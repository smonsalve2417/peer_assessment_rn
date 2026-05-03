import { useNavigation, useRoute } from "@react-navigation/native";
import * as DocumentPicker from "expo-document-picker";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { EvalFormRepository } from "@/src/features/eval-form/domain/repositories/eval_form_repository";
import { GetSubmittedEvaluationIds } from "@/src/features/eval-form/domain/usecases/get_submitted_evaluation_ids";
import { TapCourseRepository } from "../../domain/repositories/tap_course_repository";
import { GetCourseEvaluations } from "../../domain/usecases/get_course_evaluations";
import { GetCourseGroups } from "../../domain/usecases/get_course_groups";
import { ImportGroupsFromCsv } from "../../domain/usecases/import_groups_from_csv";
import { CourseEvaluation } from "../../domain/entities/course_evaluation";
import { GroupCategory } from "../../domain/entities/group_category";
import { CourseUI } from "../models/course_ui";

type SnackMessage = { title: string; body: string };

type TapCourseContextType = {
  course: CourseUI;
  isProfessor: boolean;
  selectedTab: number;
  isLoading: boolean;
  isImporting: boolean;
  evaluations: CourseEvaluation[];
  groupCategories: GroupCategory[];
  visibleGroupCategories: GroupCategory[];
  snackMessage: SnackMessage | null;
  enrollmentCode: string;
  groupCategoriesCount: number;
  isSubmitted: (evaluationId: string) => boolean;
  selectTab: (index: number) => void;
  clearSnack: () => void;
  onAddGroupsTapped: () => Promise<void>;
  onEvaluateTapped: (evaluation: CourseEvaluation) => void;
  onViewResultsTapped: (evaluation: CourseEvaluation) => void;
  onViewEvaluationResultsTapped: (evaluation: CourseEvaluation) => void;
  onViewTeacherAnalyticsTapped: () => void;
  onCreateEvaluationTapped: () => Promise<void>;
};

const TapCourseContext = createContext<TapCourseContextType | undefined>(
  undefined,
);

export function TapCourseProvider({ children }: { children: React.ReactNode }) {
  const { loggedUser, isStudent } = useAuth();
  const di = useDI();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const course = route.params as CourseUI;
  const isProfessor = !isStudent;

  const repo = useMemo(
    () => di.resolve<TapCourseRepository>(TOKENS.TapCourseRepo),
    [di],
  );
  const evalFormRepo = useMemo(
    () => di.resolve<EvalFormRepository>(TOKENS.EvalFormRepo),
    [di],
  );
  const getCourseEvaluationsUC = useMemo(
    () => new GetCourseEvaluations(repo),
    [repo],
  );
  const getCourseGroupsUC = useMemo(() => new GetCourseGroups(repo), [repo]);
  const importGroupsFromCsvUC = useMemo(
    () => new ImportGroupsFromCsv(repo),
    [repo],
  );
  const getSubmittedEvaluationIdsUC = useMemo(
    () => new GetSubmittedEvaluationIds(evalFormRepo),
    [evalFormRepo],
  );

  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [evaluations, setEvaluations] = useState<CourseEvaluation[]>([]);
  const [groupCategories, setGroupCategories] = useState<GroupCategory[]>([]);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [snackMessage, setSnackMessage] = useState<SnackMessage | null>(null);

  const enrollmentCode = `DS-${course.period.split("-")[0]}-xka`;
  const groupCategoriesCount = groupCategories.length;

  const visibleGroupCategories = useMemo(() => {
    if (isProfessor) return groupCategories;
    const email = (loggedUser?.email ?? "").toLowerCase();
    return groupCategories
      .map((cat) => ({
        ...cat,
        groups: cat.groups.filter((g) =>
          g.members.some((m) => m.email.toLowerCase() === email),
        ),
      }))
      .filter((cat) => cat.groups.length > 0);
  }, [groupCategories, isProfessor, loggedUser?.email]);

  const isSubmitted = useCallback(
    (evaluationId: string) => submittedIds.has(evaluationId),
    [submittedIds],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const submittedIds =
        !isProfessor && loggedUser?.email
          ? await getSubmittedEvaluationIdsUC.call(loggedUser.email)
          : new Set<string>();

      const [evals, groups] = await Promise.all([
        getCourseEvaluationsUC.call(course.id),
        getCourseGroupsUC.call(course.id),
      ]);
      setEvaluations(evals);
      setGroupCategories(groups);

      // TODO: load submitted evaluation ids once eval-form feature is available

      setSubmittedIds(submittedIds);
    } catch (e) {
      console.error("TapCourseContext loadData error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [
    course.id,
    isProfessor,
    loggedUser,
    getCourseEvaluationsUC,
    getCourseGroupsUC,
    getSubmittedEvaluationIdsUC,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectTab = useCallback((index: number) => setSelectedTab(index), []);
  const clearSnack = useCallback(() => setSnackMessage(null), []);

  const onAddGroupsTapped = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "text/csv",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const response = await fetch(asset.uri);
    const csvContent = await response.text();

    setIsImporting(true);
    try {
      const imported = await importGroupsFromCsvUC.call(csvContent, course.id);

      if (imported.length === 0) {
        setSnackMessage({
          title: "Already imported",
          body: "This CSV has already been uploaded for this course.",
        });
        return;
      }

      setGroupCategories((prev) => {
        const existing = new Set(prev.map((c) => c.name));
        const newOnes = imported.filter((c) => !existing.has(c.name));
        return [...prev, ...newOnes];
      });

      setSnackMessage({
        title: "Groups imported",
        body: `${imported.length} group ${imported.length === 1 ? "category" : "categories"} added from Brightspace.`,
      });
    } catch (e) {
      console.error("onAddGroupsTapped error:", e);
    } finally {
      setIsImporting(false);
    }
  }, [course.id, importGroupsFromCsvUC]);

  const onEvaluateTapped = useCallback(
    (evaluation: CourseEvaluation) => {
      navigation.navigate("EvalFormScreen", {
        evaluation,
        courseName: course.name,
      });
    },
    [navigation, course.name],
  );

  const onViewResultsTapped = useCallback(
    (evaluation: CourseEvaluation) => {
      navigation.navigate("AnalyticsStudentScreen", {
        evaluationId: evaluation.id,
        evaluationName: evaluation.name,
        courseName: course.name,
        isPublic: evaluation.visibility === "public",
      });
    },
    [navigation, course.name],
  );

  const onViewEvaluationResultsTapped = useCallback(
    (evaluation: CourseEvaluation) => {
      navigation.navigate("AnalyticsTeacherScreen", {
        courseId: course.id,
        courseName: course.name,
        evalIdToName: { [evaluation.id]: evaluation.name },
      });
    },
    [navigation, course.id, course.name],
  );

  const onViewTeacherAnalyticsTapped = useCallback(() => {
    const evalIdToName = Object.fromEntries(
      evaluations.map((e) => [e.id, e.name]),
    );
    navigation.navigate("AnalyticsTeacherScreen", {
      courseId: course.id,
      courseName: course.name,
      evalIdToName,
    });
  }, [navigation, course.id, course.name, evaluations]);

  const onCreateEvaluationTapped = useCallback(async () => {
    const created = await navigation.navigate("CreateEvaluationScreen", {
      course,
      groupCategories,
    });
    if (created === true) {
      const evals = await getCourseEvaluationsUC.call(course.id);
      setEvaluations(evals);
    }
  }, [navigation, course, groupCategories, getCourseEvaluationsUC]);

  return (
    <TapCourseContext.Provider
      value={{
        course,
        isProfessor,
        selectedTab,
        isLoading,
        isImporting,
        evaluations,
        groupCategories,
        visibleGroupCategories,
        snackMessage,
        enrollmentCode,
        groupCategoriesCount,
        isSubmitted,
        selectTab,
        clearSnack,
        onAddGroupsTapped,
        onEvaluateTapped,
        onViewResultsTapped,
        onViewEvaluationResultsTapped,
        onViewTeacherAnalyticsTapped,
        onCreateEvaluationTapped,
      }}
    >
      {children}
    </TapCourseContext.Provider>
  );
}

export function useTapCourse(): TapCourseContextType {
  const ctx = useContext(TapCourseContext);
  if (!ctx)
    throw new Error("useTapCourse must be used inside TapCourseProvider");
  return ctx;
}

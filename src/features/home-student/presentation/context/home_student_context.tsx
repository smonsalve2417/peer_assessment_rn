import { useNavigation } from "@react-navigation/native";
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
import { HomeStudentRepository } from "../../domain/repositories/home_student_repository";
import { GetActiveEvaluations } from "../../domain/usecases/get_active_evaluations";
import { GetEnrolledCourses } from "../../domain/usecases/get_enrolled_courses";
import { Course } from "../../domain/entities/course";
import { Evaluation } from "../../domain/entities/evaluation";
import { GetSubmittedEvaluationIds } from "@/src/features/eval-form/domain/usecases/get_submitted_evaluation_ids";

type HomeStudentContextType = {
  evaluations: Evaluation[];
  courses: Course[];
  isLoading: boolean;
  studentName: string;
  studentInitials: string;
  refreshData: () => Promise<void>;
  navigateToEvaluation: (evaluation: Evaluation) => void;
  navigateToCourse: (course: Course) => void;
};

const HomeStudentContext = createContext<HomeStudentContextType | undefined>(
  undefined,
);

export function HomeStudentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loggedUser } = useAuth();
  const di = useDI();
  const navigation = useNavigation<any>();

  const repo = useMemo(
    () => di.resolve<HomeStudentRepository>(TOKENS.HomeStudentRepo),
    [di],
  );
  const evalFormRepo = useMemo(
    () => di.resolve<EvalFormRepository>(TOKENS.EvalFormRepo),
    [di],
  );
  const getActiveEvaluationsUC = useMemo(
    () => new GetActiveEvaluations(repo),
    [repo],
  );
  const getEnrolledCoursesUC = useMemo(
    () => new GetEnrolledCourses(repo),
    [repo],
  );
  const getSubmittedEvaluationIdsUC = useMemo(
    () => new GetSubmittedEvaluationIds(evalFormRepo),
    [evalFormRepo],
  );

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());

  const studentName = loggedUser?.name ?? "default user";

  const studentInitials = useMemo(() => {
    const parts = studentName.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  }, [studentName]);

  const loadData = useCallback(async () => {
    const studentEmail = loggedUser?.email;
    if (!studentEmail) {
      console.error("HomeStudentController: student email is null");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const submittedIds = await getSubmittedEvaluationIdsUC.call(studentEmail);
      const [evals, courseList] = await Promise.all([
        getActiveEvaluationsUC.call(studentEmail, submittedIds),
        getEnrolledCoursesUC.call(studentEmail),
      ]);
      setEvaluations(evals);
      setCourses(courseList);
      setSubmittedIds(submittedIds);
    } catch (e) {
      console.error("HomeStudentController loadData error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [
    loggedUser,
    getActiveEvaluationsUC,
    getEnrolledCoursesUC,
    getSubmittedEvaluationIdsUC,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const navigateToEvaluation = useCallback(
    (evaluation: Evaluation) => {
      navigation.navigate("EvalFormScreen", {
        evaluation: {
          id: evaluation.id,
          name: evaluation.title,
          status: "active",
          visibility: "public",
          groupCategory: evaluation.groupCategory,
          deadline: evaluation.deadline.toISOString(),
        },
        courseName: evaluation.courseName,
      });
    },
    [navigation],
  );

  const navigateToCourse = useCallback(
    (course: Course) => {
      navigation.navigate("TapCourseScreen", {
        id: course.id,
        code: course.code,
        name: course.name,
        period: course.period,
        studentsCount: 0,
        activeEvaluations: course.activeEvaluations,
      });
    },
    [navigation],
  );

  return (
    <HomeStudentContext.Provider
      value={{
        evaluations,
        courses,
        isLoading,
        studentName,
        studentInitials,
        refreshData: loadData,
        navigateToEvaluation,
        navigateToCourse,
      }}
    >
      {children}
    </HomeStudentContext.Provider>
  );
}

export function useHomeStudent(): HomeStudentContextType {
  const ctx = useContext(HomeStudentContext);
  if (!ctx)
    throw new Error("useHomeStudent must be used inside HomeStudentProvider");
  return ctx;
}

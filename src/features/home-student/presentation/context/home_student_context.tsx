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
import { HomeStudentRepository } from "../../domain/repositories/home_student_repository";
import { GetActiveEvaluations } from "../../domain/usecases/get_active_evaluations";
import { GetEnrolledCourses } from "../../domain/usecases/get_enrolled_courses";
import { Course } from "../../domain/entities/course";
import { Evaluation } from "../../domain/entities/evaluation";

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

const HomeStudentContext = createContext<HomeStudentContextType | undefined>(undefined);

export function HomeStudentProvider({ children }: { children: React.ReactNode }) {
  const { loggedUser } = useAuth();
  const di = useDI();
  const navigation = useNavigation<any>();

  const repo = useMemo(
    () => di.resolve<HomeStudentRepository>(TOKENS.HomeStudentRepo),
    [di]
  );
  const getActiveEvaluationsUC = useMemo(() => new GetActiveEvaluations(repo), [repo]);
  const getEnrolledCoursesUC = useMemo(() => new GetEnrolledCourses(repo), [repo]);

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const [evals, courseList] = await Promise.all([
        getActiveEvaluationsUC.call(studentEmail, new Set<string>()),
        getEnrolledCoursesUC.call(studentEmail),
      ]);
      setEvaluations(evals);
      setCourses(courseList);
    } catch (e) {
      console.error("HomeStudentController loadData error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [loggedUser, getActiveEvaluationsUC, getEnrolledCoursesUC]);

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
    [navigation]
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
    [navigation]
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
  if (!ctx) throw new Error("useHomeStudent must be used inside HomeStudentProvider");
  return ctx;
}
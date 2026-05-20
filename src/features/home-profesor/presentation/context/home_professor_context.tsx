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
import { HomeProfessorRepository } from "../../domain/repositories/home_professor_repository";
import { GetAssignedCourses } from "../../domain/usecases/get_assigned_courses";
import { Course } from "../../domain/entities/course";

type HomeProfessorContextType = {
  courses: Course[];
  isLoading: boolean;
  professorName: string;
  professorInitials: string;
  // Stats agregadas (igual que Flutter: coursesCount, studentsCount, activeEvaluations)
  coursesCount: number;
  studentsCount: number;
  activeEvaluations: number;
  refreshData: () => Promise<void>;
  navigateToCourse: (course: Course) => void;
};

const HomeProfessorContext = createContext<HomeProfessorContextType | undefined>(undefined);

export function HomeProfessorProvider({ children }: { children: React.ReactNode }) {
  const { loggedUser } = useAuth();
  const di = useDI();
  const navigation = useNavigation<any>();

  const repo = useMemo(
    () => di.resolve<HomeProfessorRepository>(TOKENS.HomeProfessorRepo),
    [di]
  );
  const getAssignedCoursesUC = useMemo(() => new GetAssignedCourses(repo), [repo]);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const professorName = loggedUser?.name ?? "default user";

  const professorInitials = useMemo(() => {
    const parts = professorName.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  }, [professorName]);

  // Stats agregadas derivadas de los cursos — igual que el controller Flutter
  const coursesCount = courses.length;
  const studentsCount = useMemo(
    () => courses.reduce((sum, c) => sum + c.studentsCount, 0),
    [courses]
  );
  const activeEvaluations = useMemo(
    () => courses.reduce((sum, c) => sum + c.activeEvaluations, 0),
    [courses]
  );

  const loadData = useCallback(async () => {
    // Flutter usa userId (no email) para filtrar por 'profid'
    const userId = loggedUser?.userId;
    if (!userId) {
      console.error("HomeProfessorContext: userId is null");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const courseList = await getAssignedCoursesUC.call(userId);
      setCourses(courseList);
    } catch (e) {
      console.error("HomeProfessorContext loadData error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [loggedUser, getAssignedCoursesUC]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const navigateToCourse = useCallback(
    (course: Course) => {
      navigation.navigate("TapCourseScreen", {
        id: course.id,
        code: course.code,
        name: course.name,
        period: course.period,
        studentsCount: course.studentsCount,
        activeEvaluations: course.activeEvaluations,
      });
    },
    [navigation]
  );

  return (
    <HomeProfessorContext.Provider
      value={{
        courses,
        isLoading,
        professorName,
        professorInitials,
        coursesCount,
        studentsCount,
        activeEvaluations,
        refreshData: loadData,
        navigateToCourse,
      }}
    >
      {children}
    </HomeProfessorContext.Provider>
  );
}

export function useHomeProfessor(): HomeProfessorContextType {
  const ctx = useContext(HomeProfessorContext);
  if (!ctx) throw new Error("useHomeProfessor must be used inside HomeProfessorProvider");
  return ctx;
}

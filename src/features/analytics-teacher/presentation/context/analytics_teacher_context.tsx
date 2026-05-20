import { useNavigation, useRoute } from "@react-navigation/native";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { TeacherAnalytics } from "../../domain/entities/teacher_analytics";
import { IAnalyticsTeacherRepository } from "../../domain/repositories/i_analytics_teacher_repository";
import { GetTeacherAnalytics } from "../../domain/usecases/get_teacher_analytics";

type AnalyticsTeacherContextType = {
  courseName: string;
  subtitle: string;
  analytics: TeacherAnalytics | null;
  isLoading: boolean;
  hasNoData: boolean;
  expandedEmail: string;
  toggleStudent: (email: string) => void;
  goBack: () => void;
};

const AnalyticsTeacherContext = createContext<AnalyticsTeacherContextType | undefined>(undefined);

export function AnalyticsTeacherProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { courseId, courseName, evalIdToName } = route.params as {
    courseId: string;
    courseName: string;
    evalIdToName: Record<string, string>;
  };

  const repo = useMemo(() => di.resolve<IAnalyticsTeacherRepository>(TOKENS.AnalyticsTeacherRepo), [di]);
  const useCase = useMemo(() => new GetTeacherAnalytics(repo), [repo]);

  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedEmail, setExpandedEmail] = useState("");

  const hasNoData = !isLoading && analytics === null;

  const subtitle = useMemo(() => {
    const names = Object.values(evalIdToName);
    return names.length === 1 ? names[0] : courseName;
  }, [evalIdToName, courseName]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await useCase.call({ courseId, courseName, evalIdToName });
      setAnalytics(result);
    } catch (e) {
      console.error("AnalyticsTeacherContext load error:", e);
    } finally {
      setIsLoading(false);
    }
  }, [courseId, courseName, useCase]);

  useEffect(() => { load(); }, [load]);

  const toggleStudent = useCallback((email: string) => {
    setExpandedEmail(prev => prev === email ? "" : email);
  }, []);

  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  return (
    <AnalyticsTeacherContext.Provider value={{
      courseName, subtitle, analytics, isLoading, hasNoData, expandedEmail, toggleStudent, goBack,
    }}>
      {children}
    </AnalyticsTeacherContext.Provider>
  );
}

export function useAnalyticsTeacher(): AnalyticsTeacherContextType {
  const ctx = useContext(AnalyticsTeacherContext);
  if (!ctx) throw new Error("useAnalyticsTeacher must be used inside AnalyticsTeacherProvider");
  return ctx;
}
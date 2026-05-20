import { TeacherAnalyticsModel } from "../models/teacher_analytics_model";

export interface IAnalyticsTeacherDatasource {
  fetchCourseAnalytics(params: {
    courseId: string;
    evalIdToName: Record<string, string>;
  }): Promise<TeacherAnalyticsModel | null>;
}
import { TeacherAnalytics } from "../entities/teacher_analytics";

export interface IAnalyticsTeacherRepository {
  getCourseAnalytics(params: {
    courseId: string;
    courseName: string;
    evalIdToName: Record<string, string>;
  }): Promise<TeacherAnalytics | null>;
}
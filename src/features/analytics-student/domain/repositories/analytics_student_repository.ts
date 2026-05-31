import { StudentAnalytics } from '../entities/student_analytics';

export interface AnalyticsStudentRepository {
  getStudentAnalytics(evaluationId: string, studentEmail: string, evaluationName: string, courseName: string, isPublic: boolean): Promise<StudentAnalytics | null>;
}

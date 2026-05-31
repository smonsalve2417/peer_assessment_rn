import { StudentAnalyticsModel } from '../models/student_analytics_model';

export interface AnalyticsStudentDatasource {
  fetchResults(evaluationId: string, studentEmail: string): Promise<StudentAnalyticsModel | null>;
}

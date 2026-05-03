import { AnalyticsStudentDatasource } from '../datasources/i_analytics_student_datasource';
import { AnalyticsStudentRepository } from '../../domain/repositories/analytics_student_repository';
import { StudentAnalytics } from '../../domain/entities/student_analytics';

export class AnalyticsStudentRepositoryImpl implements AnalyticsStudentRepository {
  constructor(private readonly datasource: AnalyticsStudentDatasource) {}

  async getStudentAnalytics(evaluationId: string, studentEmail: string, evaluationName: string, courseName: string, isPublic: boolean): Promise<StudentAnalytics | null> {
    const model = await this.datasource.fetchResults(evaluationId, studentEmail);
    if (!model) return null;
    return model.toEntity(evaluationName, courseName, isPublic);
  }
}

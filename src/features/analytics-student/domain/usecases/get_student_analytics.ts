import { AnalyticsStudentRepository } from '../repositories/analytics_student_repository';
import { StudentAnalytics } from '../entities/student_analytics';

export class GetStudentAnalytics {
  readonly repository: AnalyticsStudentRepository;

  constructor(repository: AnalyticsStudentRepository) {
    this.repository = repository;
  }

  async call(evaluationId: string, studentEmail: string, evaluationName: string, courseName: string, isPublic: boolean): Promise<StudentAnalytics | null> {
    return this.repository.getStudentAnalytics(evaluationId, studentEmail, evaluationName, courseName, isPublic);
  }
}

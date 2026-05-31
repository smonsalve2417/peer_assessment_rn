import { AnalyticsStudentDatasource } from '../datasources/i_analytics_student_datasource';
import { AnalyticsStudentRepository } from '../../domain/repositories/analytics_student_repository';
import { StudentAnalytics } from '../../domain/entities/student_analytics';
import { LocalAnalyticsStudentCacheSource } from '../datasources/local_analytics_student_cache_source';

export class AnalyticsStudentRepositoryImpl implements AnalyticsStudentRepository {
  constructor(private readonly datasource: AnalyticsStudentDatasource, private readonly cacheSource: LocalAnalyticsStudentCacheSource) {}

  async getStudentAnalytics(evaluationId: string, studentEmail: string, evaluationName: string, courseName: string, isPublic: boolean): Promise<StudentAnalytics | null> {
    // Check cache validity
    try {
      const isCacheValid = await this.cacheSource.isCacheValid(evaluationId, studentEmail);
      if (isCacheValid) {
        const cachedModel = await this.cacheSource.getCachedAnalyticsData(evaluationId, studentEmail);
        if (cachedModel) {
          return cachedModel.toEntity(evaluationName, courseName, isPublic);
        }
      }
    } catch (e) {
      console.error('cache check error', e);
    }

    // Fetch from remote
    const model = await this.datasource.fetchResults(evaluationId, studentEmail);
    if (model != null) {
      try {
        await this.cacheSource.cacheAnalyticsData(evaluationId, studentEmail, model);
      } catch (e) {
        console.error('cache write error', e);
      }
    }

    return model?.toEntity(evaluationName, courseName, isPublic) ?? null;
  }
}

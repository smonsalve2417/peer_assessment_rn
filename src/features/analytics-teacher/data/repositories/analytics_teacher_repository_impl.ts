import { TeacherAnalytics } from "../../domain/entities/teacher_analytics";
import { IAnalyticsTeacherRepository } from "../../domain/repositories/i_analytics_teacher_repository";
import { IAnalyticsTeacherDatasource } from "../datasources/i_analytics_teacher_datasource";
import { LocalAnalyticsTeacherCacheSource } from "../datasources/local_analytics_teacher_cache_source";

export class AnalyticsTeacherRepositoryImpl implements IAnalyticsTeacherRepository {
  constructor(
    private readonly datasource: IAnalyticsTeacherDatasource,
    private readonly cache: LocalAnalyticsTeacherCacheSource,
  ) {}

  async getCourseAnalytics(params: {
    courseId: string;
    courseName: string;
    evalIdToName: Record<string, string>;
  }): Promise<TeacherAnalytics | null> {
    const { courseId, courseName, evalIdToName } = params;

    const isValid = await this.cache.isCacheValid(courseId, evalIdToName);
    if (isValid) {
      const cached = await this.cache.getCached(courseId, evalIdToName);
      if (cached) return cached.toEntity(courseName);
    }

    const model = await this.datasource.fetchCourseAnalytics({ courseId, evalIdToName });
    if (model) await this.cache.cache(courseId, evalIdToName, model);
    return model?.toEntity(courseName) ?? null;
  }
}
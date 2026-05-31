import { CourseEvaluation } from '../../domain/entities/course_evaluation';
import { GroupCategory } from '../../domain/entities/group_category';
import { TapCourseRepository } from '../../domain/repositories/tap_course_repository';
import { LocalTapCourseCacheSource } from '../datasources/local_tap_course_cache_source';
import { TapCourseDatasource } from '../datasources/tap_course_datasource';
import { CsvGroupParser } from '../parsers/csv_group_parser';

export class TapCourseRepositoryImpl implements TapCourseRepository {
  constructor(
    private readonly datasource: TapCourseDatasource,
    private readonly cacheSource: LocalTapCourseCacheSource,
    private readonly csvParser: CsvGroupParser,
  ) {}

  async getCourseEvaluations(courseId: string): Promise<CourseEvaluation[]> {
    const isValid = await this.cacheSource.isCourseEvaluationsCacheValid(courseId);
    if (isValid) {
      const cached = await this.cacheSource.getCachedCourseEvaluations(courseId);
      if (cached) return cached.map((m) => m.toEntity());
    }

    const models = await this.datasource.getCourseEvaluations(courseId);
    await this.cacheSource.cacheCourseEvaluations(courseId, models);
    return models.map((m) => m.toEntity());
  }

  async getCourseGroups(courseId: string): Promise<GroupCategory[]> {
    const isValid = await this.cacheSource.isCourseGroupsCacheValid(courseId);
    if (isValid) {
      const cached = await this.cacheSource.getCachedCourseGroups(courseId);
      if (cached) return cached.map((m) => m.toEntity());
    }

    const models = await this.datasource.getCourseGroups(courseId);
    await this.cacheSource.cacheCourseGroups(courseId, models);
    return models.map((m) => m.toEntity());
  }

  async importGroupsFromCsv(csvContent: string, courseId: string): Promise<GroupCategory[]> {
    const models = await this.datasource.importGroupsFromCsv(csvContent, courseId);
    return models.map((m) => m.toEntity());
  }
}

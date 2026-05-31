import { ILocalPreferences } from '../../../../core/iLocalPreferences';
import { CourseEvaluationModel } from '../models/course_evaluation_model';
import {
  CourseGroupModel,
  GroupCategoryModel,
  GroupMemberModel,
} from '../models/group_category_model';

export class LocalTapCourseCacheSource {
  private static readonly EVALUATIONS_CACHE_PREFIX = 'tap_course_evaluations_cache';
  private static readonly EVALUATIONS_CACHE_TS_PREFIX = 'tap_course_evaluations_cache_ts';
  private static readonly GROUPS_CACHE_PREFIX = 'tap_course_groups_cache';
  private static readonly GROUPS_CACHE_TS_PREFIX = 'tap_course_groups_cache_ts';
  private static readonly CACHE_TTL_MINUTES = 10;

  constructor(private readonly prefs: ILocalPreferences) {}

  async isCourseEvaluationsCacheValid(courseId: string): Promise<boolean> {
    return this.isValid(`${LocalTapCourseCacheSource.EVALUATIONS_CACHE_TS_PREFIX}_${courseId}`);
  }

  async isCourseGroupsCacheValid(courseId: string): Promise<boolean> {
    return this.isValid(`${LocalTapCourseCacheSource.GROUPS_CACHE_TS_PREFIX}_${courseId}`);
  }

  async getCachedCourseEvaluations(courseId: string): Promise<CourseEvaluationModel[] | null> {
    try {
      const cacheKey = `${LocalTapCourseCacheSource.EVALUATIONS_CACHE_PREFIX}_${courseId}`;
      const rows = await this.prefs.getAllEntries<Record<string, any>>(cacheKey);
      if (rows.length === 0) return null;
      return rows.map(CourseEvaluationModel.fromJson);
    } catch (e) {
      console.error('Error reading course evaluations cache:', e);
      return null;
    }
  }

  async cacheCourseEvaluations(courseId: string, evaluations: CourseEvaluationModel[]): Promise<void> {
    try {
      const cacheKey = `${LocalTapCourseCacheSource.EVALUATIONS_CACHE_PREFIX}_${courseId}`;
      const cacheTsKey = `${LocalTapCourseCacheSource.EVALUATIONS_CACHE_TS_PREFIX}_${courseId}`;

      const payload = evaluations.map((e) => ({
        _id: e.id,
        name: e.name,
        status: e.status,
        visibility: e.visibility,
        group_category: e.groupCategory,
        deadline: e.deadline.toISOString(),
      }));

      await this.prefs.replaceEntries(cacheKey, payload);
      await this.prefs.storeData<string>(cacheTsKey, new Date().toISOString());
    } catch (e) {
      console.error('Error saving course evaluations cache:', e);
      throw e;
    }
  }

  async invalidateCourseEvaluationsCache(courseId: string): Promise<void> {
    try {
      await this.prefs.replaceEntries(`${LocalTapCourseCacheSource.EVALUATIONS_CACHE_PREFIX}_${courseId}`, []);
      await this.prefs.removeData(`${LocalTapCourseCacheSource.EVALUATIONS_CACHE_TS_PREFIX}_${courseId}`);
    } catch (e) {
      console.error('Error invalidating course evaluations cache:', e);
      throw e;
    }
  }

  async getCachedCourseGroups(courseId: string): Promise<GroupCategoryModel[] | null> {
    try {
      const cacheKey = `${LocalTapCourseCacheSource.GROUPS_CACHE_PREFIX}_${courseId}`;
      const rows = await this.prefs.getAllEntries<Record<string, any>>(cacheKey);
      if (rows.length === 0) return null;
      return this.deserializeGroupCategories(rows);
    } catch (e) {
      console.error('Error reading course groups cache:', e);
      return null;
    }
  }

  async cacheCourseGroups(courseId: string, groups: GroupCategoryModel[]): Promise<void> {
    try {
      const cacheKey = `${LocalTapCourseCacheSource.GROUPS_CACHE_PREFIX}_${courseId}`;
      const cacheTsKey = `${LocalTapCourseCacheSource.GROUPS_CACHE_TS_PREFIX}_${courseId}`;

      await this.prefs.replaceEntries(cacheKey, this.serializeGroupCategories(groups));
      await this.prefs.storeData<string>(cacheTsKey, new Date().toISOString());
    } catch (e) {
      console.error('Error saving course groups cache:', e);
      throw e;
    }
  }

  private async isValid(timestampKey: string): Promise<boolean> {
    try {
      const timestampStr = await this.prefs.retrieveData<string>(timestampKey);
      if (!timestampStr) return false;

      const ageMinutes = (Date.now() - new Date(timestampStr).getTime()) / 60_000;
      return ageMinutes < LocalTapCourseCacheSource.CACHE_TTL_MINUTES;
    } catch (e) {
      console.error('Error checking tap-on-course cache validity:', e);
      return false;
    }
  }

  private serializeGroupCategories(categories: GroupCategoryModel[]): Record<string, any>[] {
    return categories.map((category) => ({
      name: category.name,
      source: category.source,
      groups: category.groups.map((group) => ({
        name: group.name,
        code: group.code,
        members: group.members.map((member) => ({
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
        })),
      })),
    }));
  }

  private deserializeGroupCategories(decoded: Record<string, any>[]): GroupCategoryModel[] {
    return decoded.map((categoryJson) => {
      const groups: CourseGroupModel[] = (categoryJson['groups'] ?? []).map((groupJson: Record<string, any>) => {
        const members: GroupMemberModel[] = (groupJson['members'] ?? []).map((memberJson: Record<string, any>) =>
          new GroupMemberModel(
            memberJson['firstName'] ?? '',
            memberJson['lastName'] ?? '',
            memberJson['email'] ?? '',
          ),
        );
        return new CourseGroupModel(groupJson['name'] ?? '', groupJson['code'] ?? '', members);
      });

      return new GroupCategoryModel(categoryJson['name'] ?? '', categoryJson['source'] ?? '', groups);
    });
  }
}

import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { Course } from "../../domain/entities/course";

export class LocalHomeProfessorCacheSource {
  private readonly prefs: ILocalPreferences;

  private static readonly ASSIGNED_COURSES_CACHE_PREFIX = "assigned_courses_cache";
  private static readonly ASSIGNED_COURSES_CACHE_TS_PREFIX = "assigned_courses_cache_ts";
  private static readonly CACHE_TTL_MINUTES = 10;

  constructor(prefs: ILocalPreferences) {
    this.prefs = prefs;
  }

  async isAssignedCoursesCacheValid(professorId: string): Promise<boolean> {
    return this._isValid(
      `${LocalHomeProfessorCacheSource.ASSIGNED_COURSES_CACHE_TS_PREFIX}_${professorId}`
    );
  }

  async getCachedAssignedCourses(professorId: string): Promise<Course[] | null> {
    try {
      const cacheKey = `${LocalHomeProfessorCacheSource.ASSIGNED_COURSES_CACHE_PREFIX}_${professorId}`;
      const decoded = await this.prefs.retrieveData<any[]>(cacheKey);
      if (!decoded || decoded.length === 0) return null;
      return decoded.map((item) => Course.fromJson(item));
    } catch (e) {
      console.error("Error reading assigned courses cache:", e);
      return null;
    }
  }

  async cacheAssignedCourses(professorId: string, courses: Course[]): Promise<void> {
    try {
      const cacheKey = `${LocalHomeProfessorCacheSource.ASSIGNED_COURSES_CACHE_PREFIX}_${professorId}`;
      const cacheTsKey = `${LocalHomeProfessorCacheSource.ASSIGNED_COURSES_CACHE_TS_PREFIX}_${professorId}`;

      await this.prefs.storeData(cacheKey, courses.map((c) => c.toJson()));
      await this.prefs.storeData(cacheTsKey, new Date().toISOString());
    } catch (e) {
      console.error("Error saving assigned courses cache:", e);
      throw e;
    }
  }

  async invalidateAssignedCoursesCache(professorId: string): Promise<void> {
    try {
      const cacheKey = `${LocalHomeProfessorCacheSource.ASSIGNED_COURSES_CACHE_PREFIX}_${professorId}`;
      const cacheTsKey = `${LocalHomeProfessorCacheSource.ASSIGNED_COURSES_CACHE_TS_PREFIX}_${professorId}`;
      await this.prefs.removeData(cacheKey);
      await this.prefs.removeData(cacheTsKey);
    } catch (e) {
      console.error("Error invalidating assigned courses cache:", e);
    }
  }

  private async _isValid(timestampKey: string): Promise<boolean> {
    try {
      const timestampStr = await this.prefs.retrieveData<string>(timestampKey);
      if (!timestampStr) return false;
      const timestamp = new Date(timestampStr);
      const ageMinutes = (Date.now() - timestamp.getTime()) / (1000 * 60);
      return ageMinutes < LocalHomeProfessorCacheSource.CACHE_TTL_MINUTES;
    } catch (e) {
      console.error("Error checking cache validity:", e);
      return false;
    }
  }
}

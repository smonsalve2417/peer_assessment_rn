import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { EvaluationStatus } from "../../domain/entities/evaluation";
import { CourseModel } from "../models/course_model";
import { EvaluationModel } from "../models/evaluation_model";

export class LocalHomeStudentCacheSource {
  private readonly prefs: ILocalPreferences;

  private static readonly ENROLLED_COURSES_CACHE_PREFIX = "enrolled_courses_cache";
  private static readonly ENROLLED_COURSES_CACHE_TS_PREFIX = "enrolled_courses_cache_ts";
  private static readonly ACTIVE_EVALUATIONS_CACHE_PREFIX = "active_evaluations_cache";
  private static readonly ACTIVE_EVALUATIONS_CACHE_TS_PREFIX = "active_evaluations_cache_ts";
  private static readonly CACHE_TTL_MINUTES = 10;

  constructor(prefs: ILocalPreferences) {
    this.prefs = prefs;
  }

  async isEnrolledCoursesCacheValid(studentEmail: string): Promise<boolean> {
    return this._isValid(
      `${LocalHomeStudentCacheSource.ENROLLED_COURSES_CACHE_TS_PREFIX}_${studentEmail}`
    );
  }

  async isActiveEvaluationsCacheValid(studentEmail: string): Promise<boolean> {
    return this._isValid(
      `${LocalHomeStudentCacheSource.ACTIVE_EVALUATIONS_CACHE_TS_PREFIX}_${studentEmail}`
    );
  }

  async getCachedEnrolledCourses(studentEmail: string): Promise<CourseModel[] | null> {
    try {
      const cacheKey = `${LocalHomeStudentCacheSource.ENROLLED_COURSES_CACHE_PREFIX}_${studentEmail}`;
      const decoded = await this.prefs.retrieveData<any[]>(cacheKey);
      if (!decoded || decoded.length === 0) return null;
      return decoded.map((item) => CourseModel.fromJson(item));
    } catch (e) {
      console.error("Error reading enrolled courses cache:", e);
      return null;
    }
  }

  async cacheEnrolledCourses(studentEmail: string, courses: CourseModel[]): Promise<void> {
    try {
      const cacheKey = `${LocalHomeStudentCacheSource.ENROLLED_COURSES_CACHE_PREFIX}_${studentEmail}`;
      const cacheTsKey = `${LocalHomeStudentCacheSource.ENROLLED_COURSES_CACHE_TS_PREFIX}_${studentEmail}`;

      const payload = courses.map((course) => ({
        _id: course.id,
        code: course.code,
        name: course.name,
        period: course.period,
        activeEvaluations: course.activeEvaluations,
      }));

      await this.prefs.storeData(cacheKey, payload);
      await this.prefs.storeData(cacheTsKey, new Date().toISOString());
    } catch (e) {
      console.error("Error saving enrolled courses cache:", e);
      throw e;
    }
  }

  async getCachedActiveEvaluations(studentEmail: string): Promise<EvaluationModel[] | null> {
    try {
      const cacheKey = `${LocalHomeStudentCacheSource.ACTIVE_EVALUATIONS_CACHE_PREFIX}_${studentEmail}`;
      const decoded = await this.prefs.retrieveData<any[]>(cacheKey);
      if (!decoded || decoded.length === 0) return null;

      return decoded.map(
        (item) =>
          new EvaluationModel({
            id: item["id"] as string,
            courseCode: item["courseCode"] as string,
            title: item["title"] as string,
            courseName: item["courseName"] as string,
            status:
              item["status"] === "open" ? EvaluationStatus.OPEN : EvaluationStatus.CLOSED,
            timeRemaining: item["timeRemaining"] as string,
            groupCategory: item["groupCategory"] as string,
            deadline: new Date(item["deadline"] as string),
          })
      );
    } catch (e) {
      console.error("Error reading active evaluations cache:", e);
      return null;
    }
  }

  async cacheActiveEvaluations(
    studentEmail: string,
    evaluations: EvaluationModel[]
  ): Promise<void> {
    try {
      const cacheKey = `${LocalHomeStudentCacheSource.ACTIVE_EVALUATIONS_CACHE_PREFIX}_${studentEmail}`;
      const cacheTsKey = `${LocalHomeStudentCacheSource.ACTIVE_EVALUATIONS_CACHE_TS_PREFIX}_${studentEmail}`;

      const payload = evaluations.map((evaluation) => ({
        id: evaluation.id,
        courseCode: evaluation.courseCode,
        title: evaluation.title,
        courseName: evaluation.courseName,
        status: evaluation.status === EvaluationStatus.OPEN ? "open" : "closed",
        timeRemaining: evaluation.timeRemaining,
        groupCategory: evaluation.groupCategory,
        deadline: evaluation.deadline.toISOString(),
      }));

      await this.prefs.storeData(cacheKey, payload);
      await this.prefs.storeData(cacheTsKey, new Date().toISOString());
    } catch (e) {
      console.error("Error saving active evaluations cache:", e);
      throw e;
    }
  }

  private async _isValid(timestampKey: string): Promise<boolean> {
    try {
      const timestampStr = await this.prefs.retrieveData<string>(timestampKey);
      if (!timestampStr) return false;

      const timestamp = new Date(timestampStr);
      const ageMinutes = (Date.now() - timestamp.getTime()) / (1000 * 60);
      return ageMinutes < LocalHomeStudentCacheSource.CACHE_TTL_MINUTES;
    } catch (e) {
      console.error("Error checking cache validity:", e);
      return false;
    }
  }
}

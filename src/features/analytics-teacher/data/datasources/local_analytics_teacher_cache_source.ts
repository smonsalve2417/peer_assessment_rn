import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { TeacherAnalyticsModel } from "../models/teacher_analytics_model";

export class LocalAnalyticsTeacherCacheSource {
  private static readonly PREFIX = "teacher_analytics_cache";
  private static readonly TS_PREFIX = "teacher_analytics_cache_ts";
  private static readonly TTL_MINUTES = 10;
  private readonly prefs: ILocalPreferences;

  constructor() {
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  private cacheKey(prefix: string, courseId: string, evalIdToName: Record<string, string>): string {
    const ids = Object.keys(evalIdToName).sort().join("|");
    return `${prefix}_${courseId}_${ids}`;
  }

  async isCacheValid(courseId: string, evalIdToName: Record<string, string>): Promise<boolean> {
    try {
      const tsKey = this.cacheKey(LocalAnalyticsTeacherCacheSource.TS_PREFIX, courseId, evalIdToName);
      const tsStr = await this.prefs.retrieveData<string>(tsKey);
      if (!tsStr) return false;
      const diff = (Date.now() - new Date(tsStr).getTime()) / 60000;
      return diff < LocalAnalyticsTeacherCacheSource.TTL_MINUTES;
    } catch {
      return false;
    }
  }

  async getCached(courseId: string, evalIdToName: Record<string, string>): Promise<TeacherAnalyticsModel | null> {
    try {
      const key = this.cacheKey(LocalAnalyticsTeacherCacheSource.PREFIX, courseId, evalIdToName);
      const encoded = await this.prefs.retrieveData<string>(key);
      if (!encoded) return null;
      const json = JSON.parse(encoded);
      return TeacherAnalyticsModel.fromJson(json, evalIdToName);
    } catch {
      return null;
    }
  }

  async cache(courseId: string, evalIdToName: Record<string, string>, model: TeacherAnalyticsModel): Promise<void> {
    const key = this.cacheKey(LocalAnalyticsTeacherCacheSource.PREFIX, courseId, evalIdToName);
    const tsKey = this.cacheKey(LocalAnalyticsTeacherCacheSource.TS_PREFIX, courseId, evalIdToName);
    await this.prefs.storeData(key, JSON.stringify(model.toJson()));
    await this.prefs.storeData(tsKey, new Date().toISOString());
  }
}
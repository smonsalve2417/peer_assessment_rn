import { ILocalPreferences } from '@/src/core/iLocalPreferences';
import { StudentAnalyticsModel, EvaluatorCommentModel } from '../models/student_analytics_model';

export class LocalAnalyticsStudentCacheSource {
  private static readonly _cacheKeyPrefix = 'student_analytics_cache';
  private static readonly _cacheTimestampKeyPrefix = 'student_analytics_cache_ts';
  private static readonly _cacheTTLMinutes = 10;

  constructor(private readonly prefs: ILocalPreferences) {}

  private cacheKey(evaluationId: string, studentEmail: string) {
    return `${LocalAnalyticsStudentCacheSource._cacheKeyPrefix}_${evaluationId}_${studentEmail}`;
  }

  private cacheTsKey(evaluationId: string, studentEmail: string) {
    return `${LocalAnalyticsStudentCacheSource._cacheTimestampKeyPrefix}_${evaluationId}_${studentEmail}`;
  }

  async isCacheValid(evaluationId: string, studentEmail: string): Promise<boolean> {
    try {
      const ts = await this.prefs.retrieveData<string>(this.cacheTsKey(evaluationId, studentEmail));
      if (!ts) return false;
      const timestamp = new Date(ts);
      if (isNaN(timestamp.getTime())) return false;
      const diffMs = Date.now() - timestamp.getTime();
      const diffMinutes = diffMs / 1000 / 60;
      return diffMinutes < LocalAnalyticsStudentCacheSource._cacheTTLMinutes;
    } catch (e) {
      console.error('isCacheValid error', e);
      return false;
    }
  }

  async cacheAnalyticsData(evaluationId: string, studentEmail: string, model: StudentAnalyticsModel): Promise<void> {
    try {
      const payload = {
        punctuality: model.punctuality,
        contributions: model.contributions,
        commitment: model.commitment,
        attitude: model.attitude,
        comments: model.comments.map((c) => ({ evaluator_email: c.evaluatorEmail, comment: c.text })),
      };
      await this.prefs.storeData(this.cacheKey(evaluationId, studentEmail), payload);
      await this.prefs.storeData(this.cacheTsKey(evaluationId, studentEmail), new Date().toISOString());
      // console.info('Analytics cache saved');
    } catch (e) {
      console.error('cacheAnalyticsData error', e);
    }
  }

  async getCachedAnalyticsData(evaluationId: string, studentEmail: string): Promise<StudentAnalyticsModel | null> {
    try {
      const decoded = await this.prefs.retrieveData<any>(this.cacheKey(evaluationId, studentEmail));
      if (!decoded) return null;
      const comments = (decoded.comments as any[] | undefined) ?? [];
      const commentModels = comments.map((c) => EvaluatorCommentModel.fromJson({ evaluator_email: c.evaluator_email ?? c.evaluatorEmail, comment: c.comment ?? c.text }));
      return new StudentAnalyticsModel({
        punctuality: Number(decoded.punctuality ?? 0),
        contributions: Number(decoded.contributions ?? 0),
        commitment: Number(decoded.commitment ?? 0),
        attitude: Number(decoded.attitude ?? 0),
        comments: commentModels,
      });
    } catch (e) {
      console.error('getCachedAnalyticsData error', e);
      return null;
    }
  }

  async clearCache(evaluationId: string, studentEmail: string): Promise<void> {
    try {
      await this.prefs.removeData(this.cacheKey(evaluationId, studentEmail));
      await this.prefs.removeData(this.cacheTsKey(evaluationId, studentEmail));
    } catch (e) {
      console.error('clearCache error', e);
    }
  }

  async clearAllCache(): Promise<void> {
    // Not implemented: LocalPreferences does not expose keys listing reliably.
    return Promise.resolve();
  }
}

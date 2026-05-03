import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { Container } from '@/src/core/di/container';
import { TOKENS } from '@/src/core/di/tokens';
import { RemoteAnalyticsStudentDatasource } from '@/src/features/analytics-student/data/datasources/remote_analytics_student_datasource';
import { AnalyticsStudentRepositoryImpl } from '@/src/features/analytics-student/data/repositories/analytics_student_repository_impl';
import { LocalAnalyticsStudentCacheSource } from '@/src/features/analytics-student/data/datasources/local_analytics_student_cache_source';

export class AnalyticsStudentBinding {
  static register(c: Container): void {
    const prefs = LocalPreferencesAsyncStorage.getInstance();
    const remote = new RemoteAnalyticsStudentDatasource(prefs);
    const cache = new LocalAnalyticsStudentCacheSource(prefs);
    const repo = new AnalyticsStudentRepositoryImpl(remote, cache);
    c.register(TOKENS.AnalyticsStudentRepo, repo);
  }
}

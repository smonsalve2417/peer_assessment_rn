import { LocalPreferencesAsyncStorage } from '@/src/core/LocalPreferencesAsyncStorage';
import { Container } from '@/src/core/di/container';
import { TOKENS } from '@/src/core/di/tokens';
import { LocalTapCourseCacheSource } from '../../data/datasources/local_tap_course_cache_source';
import { RemoteTapCourseDatasource } from '../../data/datasources/remote_tap_course_datasource';
import { CsvGroupParser } from '../../data/parsers/csv_group_parser';
import { TapCourseRepositoryImpl } from '../../data/repositories/tap_course_repository_impl';

export class TapCourseBinding {
  static register(c: Container): void {
    const prefs = LocalPreferencesAsyncStorage.getInstance();
    const csvParser = new CsvGroupParser();
    const cacheSource = new LocalTapCourseCacheSource(prefs);
    const remote = new RemoteTapCourseDatasource(csvParser, prefs);
    const repo = new TapCourseRepositoryImpl(remote, cacheSource, csvParser);
    c.register(TOKENS.TapCourseRepo, repo);
  }
}

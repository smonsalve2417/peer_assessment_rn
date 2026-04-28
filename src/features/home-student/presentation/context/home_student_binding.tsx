import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { LocalHomeStudentCacheSource } from "../../data/datasources/local_home_student_cache_source";
import { RemoteHomeStudentDataSource } from "../../data/datasources/remote_home_student_datasource";
import { HomeStudentRepositoryImpl } from "../../data/repositories/home_student_repository_impl";

export class HomeStudentBinding {
  static register(c: Container): void {
    const prefs = LocalPreferencesAsyncStorage.getInstance();
    const cacheSource = new LocalHomeStudentCacheSource(prefs);
    const remoteDS = new RemoteHomeStudentDataSource();
    const repo = new HomeStudentRepositoryImpl(remoteDS, cacheSource);
    c.register(TOKENS.HomeStudentRepo, repo);
  }
}
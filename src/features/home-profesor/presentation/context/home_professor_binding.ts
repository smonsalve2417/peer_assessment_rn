import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { LocalHomeProfessorCacheSource } from "../../data/datasources/local_home_professor_cache_source";
import { RemoteHomeProfessorDataSource } from "../../data/datasources/remote_home_professor_datasource";
import { HomeProfessorRepositoryImpl } from "../../data/repositories/home_professor_repository_impl";

export class HomeProfessorBinding {
  static register(c: Container): void {
    const prefs = LocalPreferencesAsyncStorage.getInstance();
    const cacheSource = new LocalHomeProfessorCacheSource(prefs);
    const remoteDS = new RemoteHomeProfessorDataSource();
    const repo = new HomeProfessorRepositoryImpl(remoteDS, cacheSource);
    c.register(TOKENS.HomeProfessorRepo, repo);
  }
}

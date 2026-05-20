import { Container } from "@/src/core/di/container"; 
import { TOKENS } from "@/src/core/di/tokens";
import { AnalyticsTeacherRepositoryImpl } from "../repositories/analytics_teacher_repository_impl";
import { RemoteAnalyticsTeacherDatasource } from "./remote_analytics_teacher_datasource";
import { LocalAnalyticsTeacherCacheSource } from "./local_analytics_teacher_cache_source";

export class AnalyticsTeacherBinding {
  static register(c: Container): void {
    const remoteDS = new RemoteAnalyticsTeacherDatasource();
    const cacheSource = new LocalAnalyticsTeacherCacheSource();
    const repo = new AnalyticsTeacherRepositoryImpl(remoteDS, cacheSource);
    c.register(TOKENS.AnalyticsTeacherRepo, repo);
  }
}
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { RemoteCreateEvaluationDatasource } from "../datasources/remote_create_evaluation_datasource";
import { CreateEvaluationRepositoryImpl } from "../repositories/create_evaluation_repository_impl";

export class CreateEvaluationBinding {
  static register(c: Container): void {
    const remoteDS = new RemoteCreateEvaluationDatasource();
    const repo = new CreateEvaluationRepositoryImpl(remoteDS);
    c.register(TOKENS.CreateEvaluationRepo, repo);
  }
}

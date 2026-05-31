import { CreateEvaluationParams } from "../../domain/entities/create_evaluation_params";
import { ICreateEvaluationRepository } from "../../domain/repositories/i_create_evaluation_repository";
import { CreateEvaluationDatasource } from "../datasources/create_evaluation_datasource";
import { CreateEvaluationModel } from "../models/create_evaluation_model";

export class CreateEvaluationRepositoryImpl implements ICreateEvaluationRepository {
  datasource: CreateEvaluationDatasource;

  constructor(datasource: CreateEvaluationDatasource) {
    this.datasource = datasource;
  }

  createEvaluation(params: CreateEvaluationParams): Promise<void> {
    return this.datasource.createEvaluation(CreateEvaluationModel.fromEntity(params));
  }
}

import { CreateEvaluationParams } from "../entities/create_evaluation_params";
import { ICreateEvaluationRepository } from "../repositories/i_create_evaluation_repository";

export class CreateEvaluation {
  repository: ICreateEvaluationRepository;

  constructor(repository: ICreateEvaluationRepository) {
    this.repository = repository;
  }

  call(params: CreateEvaluationParams): Promise<void> {
    return this.repository.createEvaluation(params);
  }
}

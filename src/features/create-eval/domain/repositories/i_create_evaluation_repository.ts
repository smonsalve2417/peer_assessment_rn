import { CreateEvaluationParams } from "../entities/create_evaluation_params";

export interface ICreateEvaluationRepository {
  createEvaluation(params: CreateEvaluationParams): Promise<void>;
}

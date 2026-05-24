import { CreateEvaluationModel } from "../models/create_evaluation_model";

export interface CreateEvaluationDatasource {
  createEvaluation(model: CreateEvaluationModel): Promise<void>;
}

import { EvalFormDatasource } from "../datasources/eval_form_datasource";
import { EvalSubmissionModel } from "../models/eval_submission_model";
import { EvalPeer } from "../../domain/entities/eval_peer";
import { EvalSubmission } from "../../domain/entities/eval_submitions";
import { EvalFormRepository } from "../../domain/repositories/eval_form_repository";

export class EvalFormRepositoryImpl implements EvalFormRepository {
  constructor(private readonly datasource: EvalFormDatasource) {}

  async getGroupPeers(groupCategory: string, studentEmail: string): Promise<EvalPeer[]> {
    const models = await this.datasource.getGroupPeers(groupCategory, studentEmail);
    return models.map((model) => model.toEntity());
  }

  async submitEvaluation(submission: EvalSubmission): Promise<void> {
    return this.datasource.submitEvaluation(EvalSubmissionModel.fromEntity(submission));
  }

  async getSubmittedEvaluationIds(studentEmail: string): Promise<Set<string>> {
    return this.datasource.getSubmittedEvaluationIds(studentEmail);
  }
}

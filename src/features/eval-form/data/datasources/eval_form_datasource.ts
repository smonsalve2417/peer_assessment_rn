import { EvalPeerModel } from '../models/eval_peer_model';
import { EvalSubmissionModel } from '../models/eval_submission_model';

export interface EvalFormDatasource {
  getGroupPeers(groupCategory: string, studentEmail: string): Promise<EvalPeerModel[]>;
  submitEvaluation(model: EvalSubmissionModel): Promise<void>;
  getSubmittedEvaluationIds(studentEmail: string): Promise<Set<string>>;
}

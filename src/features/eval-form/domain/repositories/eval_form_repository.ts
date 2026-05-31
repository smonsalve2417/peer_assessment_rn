import { EvalPeer } from '../entities/eval_peer';
import { EvalSubmission } from '../entities/eval_submitions';

export interface EvalFormRepository {
  getGroupPeers(groupCategory: string, studentEmail: string): Promise<EvalPeer[]>;
  submitEvaluation(submission: EvalSubmission): Promise<void>;
  getSubmittedEvaluationIds(studentEmail: string): Promise<Set<string>>;
}

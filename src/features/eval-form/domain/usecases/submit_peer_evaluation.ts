import { EvalSubmission } from '../entities/eval_submitions';
import { EvalFormRepository } from '../repositories/eval_form_repository';

export class SubmitPeerEvaluation {
  readonly repository: EvalFormRepository;

  constructor(repository: EvalFormRepository) {
    this.repository = repository;
  }

  async call(submission: EvalSubmission): Promise<void> {
    return this.repository.submitEvaluation(submission);
  }
}

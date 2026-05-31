import { EvalFormRepository } from '../repositories/eval_form_repository';

export class GetSubmittedEvaluationIds {
  readonly repository: EvalFormRepository;

  constructor(repository: EvalFormRepository) {
    this.repository = repository;
  }

  async call(studentEmail: string): Promise<Set<string>> {
    return this.repository.getSubmittedEvaluationIds(studentEmail);
  }
}

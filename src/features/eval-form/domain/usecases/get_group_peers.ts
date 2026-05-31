import { EvalPeer } from '../entities/eval_peer';
import { EvalFormRepository } from '../repositories/eval_form_repository';

export class GetGroupPeers {
  readonly repository: EvalFormRepository;

  constructor(repository: EvalFormRepository) {
    this.repository = repository;
  }

  async call(groupCategory: string, studentEmail: string): Promise<EvalPeer[]> {
    return this.repository.getGroupPeers(groupCategory, studentEmail);
  }
}

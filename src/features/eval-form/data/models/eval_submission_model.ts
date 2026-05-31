import { EvalSubmission } from '../../domain/entities/eval_submitions';

export class EvalSubmissionModel {
  readonly evaluationId: string;
  readonly evaluatorEmail: string;
  readonly evaluatedEmail: string;
  readonly scores: Record<string, number>;
  readonly comment?: string;

  constructor(data: {
    evaluationId: string;
    evaluatorEmail: string;
    evaluatedEmail: string;
    scores: Record<string, number>;
    comment?: string;
  }) {
    this.evaluationId = data.evaluationId;
    this.evaluatorEmail = data.evaluatorEmail;
    this.evaluatedEmail = data.evaluatedEmail;
    this.scores = data.scores;
    this.comment = data.comment;
  }

  static fromEntity(entity: EvalSubmission): EvalSubmissionModel {
    return new EvalSubmissionModel({
      evaluationId: entity.evaluationId,
      evaluatorEmail: entity.evaluatorEmail,
      evaluatedEmail: entity.evaluatedEmail,
      scores: entity.scores,
      comment: entity.comment,
    });
  }

  toJson(): Record<string, any> {
    const json: Record<string, any> = {
      evaluation_id: this.evaluationId,
      evaluator_email: this.evaluatorEmail,
      evaluated_email: this.evaluatedEmail,
      punctuality: this.scores['punctuality'],
      contributions: this.scores['contributions'],
      commitment: this.scores['commitment'],
      attitude: this.scores['attitude'],
      created_at: new Date().toISOString(),
    };

    if (this.comment && this.comment.length > 0) {
      json.comment = this.comment;
    }

    return json;
  }
}

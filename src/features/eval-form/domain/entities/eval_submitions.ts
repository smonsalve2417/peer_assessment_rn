export class EvalSubmission {
  readonly evaluationId: string;
  readonly evaluatorEmail: string;
  readonly evaluatedEmail: string;
  readonly scores: Record<string, number>; // criterionKey -> score
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
}

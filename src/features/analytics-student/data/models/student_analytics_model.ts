import { StudentAnalytics, EvaluatorComment } from '../../domain/entities/student_analytics';

export class EvaluatorCommentModel implements EvaluatorComment {
  evaluatorEmail: string;
  text: string;
  constructor(evaluatorEmail: string, text: string) {
    this.evaluatorEmail = evaluatorEmail;
    this.text = text;
  }

  static fromJson(json: Record<string, any>): EvaluatorCommentModel {
    return new EvaluatorCommentModel(json['evaluator_email'] as string, json['comment'] as string);
  }

  toEntity(): EvaluatorComment {
    return { evaluatorEmail: this.evaluatorEmail, text: this.text };
  }
}

export class StudentAnalyticsModel {
  punctuality: number;
  contributions: number;
  commitment: number;
  attitude: number;
  comments: EvaluatorCommentModel[];

  constructor(props: Partial<StudentAnalyticsModel> = {}) {
    this.punctuality = props.punctuality ?? 0;
    this.contributions = props.contributions ?? 0;
    this.commitment = props.commitment ?? 0;
    this.attitude = props.attitude ?? 0;
    this.comments = props.comments ?? [];
  }

  static fromRows(rows: Record<string, any>[]): StudentAnalyticsModel {
    const avg = (key: string) => rows.map((r) => Number(r[key] ?? 0)).reduce((a, b) => a + b, 0) / rows.length;
    const comments = rows.filter((r) => (r['comment'] as string | undefined)?.trim()).map((r) => EvaluatorCommentModel.fromJson(r));
    return new StudentAnalyticsModel({
      punctuality: avg('punctuality'),
      contributions: avg('contributions'),
      commitment: avg('commitment'),
      attitude: avg('attitude'),
      comments,
    });
  }

  toEntity(evaluationName: string, courseName: string, isPublic: boolean): StudentAnalytics {
    return new StudentAnalytics({
      evaluationName,
      courseName,
      isPublic,
      punctuality: this.punctuality,
      contributions: this.contributions,
      commitment: this.commitment,
      attitude: this.attitude,
      comments: this.comments.map((c) => c.toEntity()),
    });
  }
}

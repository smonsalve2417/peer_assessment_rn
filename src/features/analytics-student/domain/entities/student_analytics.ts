export type EvaluatorComment = {
  evaluatorEmail: string;
  text: string;
};

export class StudentAnalytics {
  evaluationName: string;
  courseName: string;
  isPublic: boolean;
  punctuality: number;
  contributions: number;
  commitment: number;
  attitude: number;
  comments: EvaluatorComment[];

  constructor(props: Partial<StudentAnalytics> = {}) {
    this.evaluationName = props.evaluationName ?? '';
    this.courseName = props.courseName ?? '';
    this.isPublic = props.isPublic ?? false;
    this.punctuality = props.punctuality ?? 0;
    this.contributions = props.contributions ?? 0;
    this.commitment = props.commitment ?? 0;
    this.attitude = props.attitude ?? 0;
    this.comments = props.comments ?? [];
  }

  get avgScore(): number {
    return (this.punctuality + this.contributions + this.commitment + this.attitude) / 4;
  }

  get scoreLabel(): string {
    const a = this.avgScore;
    return a >= 4 ? 'Excellent' : a >= 3 ? 'Good' : 'Needs improvement';
  }
}

export class Course {
  id: string;
  code: string;
  name: string;
  period: string;
  activeEvaluations: number;

  constructor({
    id,
    code,
    name,
    period,
    activeEvaluations,
  }: {
    id: string;
    code: string;
    name: string;
    period: string;
    activeEvaluations: number;
  }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.period = period;
    this.activeEvaluations = activeEvaluations;
  }
}
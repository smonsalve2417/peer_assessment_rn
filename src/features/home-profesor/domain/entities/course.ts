export class Course {
  id: string;
  code: string;
  name: string;
  period: string;
  studentsCount: number;
  activeEvaluations: number;
  totalEvaluations: number;

  constructor({
    id,
    code,
    name,
    period,
    studentsCount,
    activeEvaluations,
    totalEvaluations,
  }: {
    id: string;
    code: string;
    name: string;
    period: string;
    studentsCount: number;
    activeEvaluations: number;
    totalEvaluations: number;
  }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.period = period;
    this.studentsCount = studentsCount;
    this.activeEvaluations = activeEvaluations;
    this.totalEvaluations = totalEvaluations;
  }

  static fromJson(json: any): Course {
    return new Course({
      id: json["_id"],
      code: json["code"] ?? "---",
      name: json["name"] ?? "---",
      period: json["period"] ?? "---",
      studentsCount: json["studentsCount"] ?? 0,
      activeEvaluations: json["activeEvaluations"] ?? 0,
      totalEvaluations: json["totalEvaluations"] ?? 0,
    });
  }

  toJson() {
    return {
      _id: this.id,
      code: this.code,
      name: this.name,
      period: this.period,
      studentsCount: this.studentsCount,
      activeEvaluations: this.activeEvaluations,
      totalEvaluations: this.totalEvaluations,
    };
  }
}

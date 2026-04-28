import { Course } from "../../domain/entities/course";

export class CourseModel implements Course {
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
  }: Course) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.period = period;
    this.activeEvaluations = activeEvaluations;
  }

  static fromJson(json: any): CourseModel {
    return new CourseModel({
      id: json["_id"],
      code: json["code"] ?? "---",
      name: json["name"] ?? "---",
      period: json["period"] ?? "---",
      activeEvaluations: json["activeEvaluations"] ?? 0,
    });
  }

  toJson() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      period: this.period,
      activeEvaluations: this.activeEvaluations,
    };
  }
}
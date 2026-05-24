import { Course } from "../../domain/entities/course";

export class CourseModel extends Course {
  constructor(args: {
    id: string;
    code: string;
    name: string;
    period: string;
    studentsCount: number;
    activeEvaluations: number;
    totalEvaluations: number;
  }) {
    super(args);
  }
}

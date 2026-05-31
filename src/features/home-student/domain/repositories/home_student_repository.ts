import { Evaluation } from "../entities/evaluation";
import { Course } from "../entities/course";

export interface HomeStudentRepository {
  getActiveEvaluations(
    studentId: string,
    submittedIds: Set<string>
  ): Promise<Evaluation[]>;

  getEnrolledCourses(studentId: string): Promise<Course[]>;
}
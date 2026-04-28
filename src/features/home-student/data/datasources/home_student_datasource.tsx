import { EvaluationModel } from "../models/evaluation_model";
import { CourseModel } from "../models/course_model";

export interface HomeStudentDataSource {
  getActiveEvaluations(
    studentEmail: string,
    submittedIds: Set<string>
  ): Promise<EvaluationModel[]>;

  getEnrolledCourses(
    studentEmail: string
  ): Promise<CourseModel[]>;
}
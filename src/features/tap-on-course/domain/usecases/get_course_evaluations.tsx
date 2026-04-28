import { CourseEvaluation } from '../entities/course_evaluation';
import { TapCourseRepository } from '../repositories/tap_course_repository';

export class GetCourseEvaluations {
  constructor(private repository: TapCourseRepository) {}

  call(courseId: string): Promise<CourseEvaluation[]> {
    return this.repository.getCourseEvaluations(courseId);
  }
}
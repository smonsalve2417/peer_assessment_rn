import { CourseEvaluation } from '../entities/course_evaluation';
import { GroupCategory } from '../entities/group_category';

export interface TapCourseRepository {
  getCourseEvaluations(courseId: string): Promise<CourseEvaluation[]>;

  getCourseGroups(courseId: string): Promise<GroupCategory[]>;

  importGroupsFromCsv(
    csvContent: string,
    courseId: string,
  ): Promise<GroupCategory[]>;
}
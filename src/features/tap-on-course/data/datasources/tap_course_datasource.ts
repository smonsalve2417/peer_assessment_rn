import { CourseEvaluationModel } from '../models/course_evaluation_model';
import { GroupCategoryModel } from '../models/group_category_model';

export interface TapCourseDatasource {
  getCourseEvaluations(
    courseId: string,
  ): Promise<CourseEvaluationModel[]>;

  getCourseGroups(
    courseId: string,
  ): Promise<GroupCategoryModel[]>;

  importGroupsFromCsv(
    csvContent: string,
    courseId: string,
  ): Promise<GroupCategoryModel[]>;
}
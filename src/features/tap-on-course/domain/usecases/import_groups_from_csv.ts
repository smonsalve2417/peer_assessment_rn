import { GroupCategory } from '../entities/group_category';
import { TapCourseRepository } from '../repositories/tap_course_repository';

export class ImportGroupsFromCsv {
  constructor(private repository: TapCourseRepository) {}

  call(
    csvContent: string,
    courseId: string,
  ): Promise<GroupCategory[]> {
    return this.repository.importGroupsFromCsv(csvContent, courseId);
  }
}
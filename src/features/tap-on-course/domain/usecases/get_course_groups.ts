import { GroupCategory } from '../entities/group_category';
import { TapCourseRepository } from '../repositories/tap_course_repository';

export class GetCourseGroups {
  constructor(private repository: TapCourseRepository) {}

  call(courseId: string): Promise<GroupCategory[]> {
    return this.repository.getCourseGroups(courseId);
  }
}
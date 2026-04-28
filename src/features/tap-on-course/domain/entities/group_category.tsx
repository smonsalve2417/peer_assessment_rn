import { CourseGroup } from './course_group';

export interface GroupCategory {
  name: string;
  source: string;
  groups: CourseGroup[];
}

import { CourseGroup } from './course_group';

export class GroupCategory {
  constructor(
    public name: string,
    public source: string,
    public groups: CourseGroup[],
  ) {}
}
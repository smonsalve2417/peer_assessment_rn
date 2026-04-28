import { GroupMember } from './group_member';

export class CourseGroup {
  constructor(
    public name: string,
    public code: string,
    public members: GroupMember[],
  ) {}
}
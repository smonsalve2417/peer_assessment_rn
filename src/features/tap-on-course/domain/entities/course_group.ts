import { GroupMember } from './group_member';

export interface CourseGroup {
  name: string;
  code: string;
  members: GroupMember[];
}

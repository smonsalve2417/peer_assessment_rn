import { CourseGroup } from '../../domain/entities/course_group';
import { GroupCategory } from '../../domain/entities/group_category';
import { GroupMember } from '../../domain/entities/group_member';

export class GroupMemberModel {
  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
  ) {}

  toEntity(): GroupMember {
    return new GroupMember(this.firstName, this.lastName, this.email);
  }
}

export class CourseGroupModel {
  constructor(
    public name: string,
    public code: string,
    public members: GroupMemberModel[],
  ) {}

  toEntity(): CourseGroup {
    return { name: this.name, code: this.code, members: this.members.map((m) => m.toEntity()) };
  }
}

export class GroupCategoryModel {
  constructor(
    public name: string,
    public source: string,
    public groups: CourseGroupModel[],
  ) {}

  toEntity(): GroupCategory {
    return { name: this.name, source: this.source, groups: this.groups.map((g) => g.toEntity()) };
  }
}
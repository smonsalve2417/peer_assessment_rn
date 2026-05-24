import { CreateEvaluationParams } from "../../domain/entities/create_evaluation_params";

export class CreateEvaluationModel {
  name: string;
  courseId: string;
  groupCategoryName: string;
  deadline: Date;
  visibility: "public" | "private";

  constructor({
    name,
    courseId,
    groupCategoryName,
    deadline,
    visibility,
  }: {
    name: string;
    courseId: string;
    groupCategoryName: string;
    deadline: Date;
    visibility: "public" | "private";
  }) {
    this.name = name;
    this.courseId = courseId;
    this.groupCategoryName = groupCategoryName;
    this.deadline = deadline;
    this.visibility = visibility;
  }

  static fromEntity(entity: CreateEvaluationParams): CreateEvaluationModel {
    return new CreateEvaluationModel({
      name: entity.name,
      courseId: entity.courseId,
      groupCategoryName: entity.groupCategoryName,
      deadline: entity.deadline,
      visibility: entity.visibility,
    });
  }

  toJson() {
    return {
      name: this.name,
      course_id: this.courseId,
      group_category: this.groupCategoryName,
      deadline: this.deadline.toISOString(),
      visibility: this.visibility,
      status: "active",
      created_at: new Date().toISOString(),
    };
  }
}

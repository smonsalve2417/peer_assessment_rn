export class CreateEvaluationParams {
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
}

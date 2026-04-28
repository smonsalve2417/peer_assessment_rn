import {
  Evaluation,
  EvaluationStatus,
} from "../../domain/entities/evaluation";

export class EvaluationModel implements Evaluation {
  id: string;
  courseCode: string;
  title: string;
  courseName: string;
  status: EvaluationStatus;
  timeRemaining: string;
  groupCategory: string;
  deadline: Date;

  constructor({
    id,
    courseCode,
    title,
    courseName,
    status,
    timeRemaining,
    groupCategory,
    deadline,
  }: Evaluation) {
    this.id = id;
    this.courseCode = courseCode;
    this.title = title;
    this.courseName = courseName;
    this.status = status;
    this.timeRemaining = timeRemaining;
    this.groupCategory = groupCategory;
    this.deadline = deadline;
  }

  static fromDbJson(
    evalJson: any,
    courseJson: any
  ): EvaluationModel {
    const deadline = new Date(evalJson["deadline"]);

    return new EvaluationModel({
      id: evalJson["_id"].toString(),
      courseCode: courseJson["code"] ?? "---",
      title: evalJson["name"],
      courseName: courseJson["name"] ?? "---",
      status:
        deadline > new Date()
          ? EvaluationStatus.OPEN
          : EvaluationStatus.CLOSED,
      timeRemaining:
        this.computeTimeRemaining(deadline),
      groupCategory:
        evalJson["group_category"],
      deadline,
    });
  }

  static computeTimeRemaining(
    deadline: Date
  ): string {
    const now = new Date();
    const diffMs =
      deadline.getTime() - now.getTime();

    if (diffMs < 0) return "Ended";

    const minutes = Math.floor(
      diffMs / (1000 * 60)
    );
    const hours = Math.floor(
      diffMs / (1000 * 60 * 60)
    );
    const days = Math.floor(
      diffMs / (1000 * 60 * 60 * 24)
    );

    if (days >= 1) return `${days}d left`;
    if (hours >= 1) return `${hours}h left`;

    return `${minutes}m left`;
  }
}
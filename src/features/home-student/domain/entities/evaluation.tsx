export enum EvaluationStatus {
  OPEN = "open",
  CLOSED = "closed",
  PENDING = "pending",
}

export class Evaluation {
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
  }: {
    id: string;
    courseCode: string;
    title: string;
    courseName: string;
    status: EvaluationStatus;
    timeRemaining: string;
    groupCategory: string;
    deadline: Date;
  }) {
    this.id = id;
    this.courseCode = courseCode;
    this.title = title;
    this.courseName = courseName;
    this.status = status;
    this.timeRemaining = timeRemaining;
    this.groupCategory = groupCategory;
    this.deadline = deadline;
  }
}
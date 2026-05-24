import { TeacherAnalytics } from "../entities/teacher_analytics";
import { IAnalyticsTeacherRepository } from "../repositories/i_analytics_teacher_repository";

export class GetTeacherAnalytics {
  constructor(private readonly repository: IAnalyticsTeacherRepository) {}

  call(params: {
    courseId: string;
    courseName: string;
    evalIdToName: Record<string, string>;
  }): Promise<TeacherAnalytics | null> {
    return this.repository.getCourseAnalytics(params);
  }
}
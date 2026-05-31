import { CourseEvaluation } from '../../domain/entities/course_evaluation';

export class CourseEvaluationModel {
  constructor(
    public id: string,
    public name: string,
    public status: string,
    public visibility: string,
    public groupCategory: string,
    public deadline: Date,
  ) {}

  static fromJson(json: Record<string, any>): CourseEvaluationModel {
    return new CourseEvaluationModel(
      json['_id'].toString(),
      json['name'] as string,
      json['status'] as string,
      json['visibility'] as string,
      json['group_category'] as string,
      new Date(json['deadline']),
    );
  }

  toEntity(): CourseEvaluation {
    return {
      id: this.id,
      name: this.name,
      status: this.status as 'active' | 'closed',
      visibility: this.visibility as 'public' | 'private',
      groupCategory: this.groupCategory,
      deadline: this.deadline,
    };
  }
}
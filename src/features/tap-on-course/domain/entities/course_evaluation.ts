export class CourseEvaluation {
  constructor(
    public id: string,
    public name: string,
    public status: 'active' | 'closed',
    public visibility: 'public' | 'private',
    public groupCategory: string,
    public deadline: Date,
  ) {}
}
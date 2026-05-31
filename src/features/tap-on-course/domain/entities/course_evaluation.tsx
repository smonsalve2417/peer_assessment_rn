export interface CourseEvaluation {
  id: string;
  name: string;
  status: 'active' | 'closed';
  visibility: 'public' | 'private';
  groupCategory: string;
  deadline: Date;
}

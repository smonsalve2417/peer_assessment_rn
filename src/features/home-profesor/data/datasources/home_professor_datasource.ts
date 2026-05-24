import { Course } from "../../domain/entities/course";

export interface HomeProfessorDataSource {
  getAssignedCourses(professorId: string): Promise<Course[]>;
}

import { Course } from "../entities/course";

export interface HomeProfessorRepository {
  getAssignedCourses(professorId: string): Promise<Course[]>;
}

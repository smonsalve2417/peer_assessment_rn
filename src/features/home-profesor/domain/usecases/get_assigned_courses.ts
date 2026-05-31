import { Course } from "../entities/course";
import { HomeProfessorRepository } from "../repositories/home_professor_repository";

export class GetAssignedCourses {
  repository: HomeProfessorRepository;

  constructor(repository: HomeProfessorRepository) {
    this.repository = repository;
  }

  call(professorId: string): Promise<Course[]> {
    return this.repository.getAssignedCourses(professorId);
  }
}

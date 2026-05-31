import { Course } from "../entities/course";
import { HomeStudentRepository } from "../repositories/home_student_repository";

export class GetEnrolledCourses {
  repository: HomeStudentRepository;

  constructor(repository: HomeStudentRepository) {
    this.repository = repository;
  }

  call(studentId: string): Promise<Course[]> {
    return this.repository.getEnrolledCourses(studentId);
  }
}
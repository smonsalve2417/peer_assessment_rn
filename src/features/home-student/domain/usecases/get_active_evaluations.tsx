import { Evaluation } from "../entities/evaluation";
import { HomeStudentRepository } from "../repositories/home_student_repository";

export class GetActiveEvaluations {
  repository: HomeStudentRepository;

  constructor(repository: HomeStudentRepository) {
    this.repository = repository;
  }

  call(
    studentId: string,
    submittedIds: Set<string>
  ): Promise<Evaluation[]> {
    return this.repository.getActiveEvaluations(
      studentId,
      submittedIds
    );
  }
}
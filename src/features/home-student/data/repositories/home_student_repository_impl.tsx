import { EvaluationModel } from "../models/evaluation_model";
import { Course } from "../../domain/entities/course";
import { HomeStudentRepository } from "../../domain/repositories/home_student_repository";
import { HomeStudentDataSource } from "../datasources/home_student_datasource";
import { LocalHomeStudentCacheSource } from "../datasources/local_home_student_cache_source";

export class HomeStudentRepositoryImpl
  implements HomeStudentRepository
{
  dataSource: HomeStudentDataSource;
  cacheSource: LocalHomeStudentCacheSource;

  constructor(
    dataSource: HomeStudentDataSource,
    cacheSource: LocalHomeStudentCacheSource
  ) {
    this.dataSource = dataSource;
    this.cacheSource = cacheSource;
  }

  async getActiveEvaluations(
    studentId: string,
    submittedIds: Set<string>
  ): Promise<EvaluationModel[]> {
    const isValid =
      await this.cacheSource.isActiveEvaluationsCacheValid(
        studentId
      );

    if (isValid) {
      const cached =
        await this.cacheSource.getCachedActiveEvaluations(
          studentId
        );

      if (cached != null) {
        return cached.filter(
          (evaluation) =>
            !submittedIds.has(evaluation.id)
        );
      }
    }

    const remote =
      await this.dataSource.getActiveEvaluations(
        studentId,
        new Set<string>()
      );

    if (remote.length > 0) {
      await this.cacheSource.cacheActiveEvaluations(
        studentId,
        remote
      );
    }

    return remote.filter(
      (evaluation) =>
        !submittedIds.has(evaluation.id)
    );
  }

  async getEnrolledCourses(
    studentId: string
  ): Promise<Course[]> {
    const isValid =
      await this.cacheSource.isEnrolledCoursesCacheValid(
        studentId
      );

    if (isValid) {
      const cached =
        await this.cacheSource.getCachedEnrolledCourses(
          studentId
        );

      if (cached != null) {
        return cached;
      }
    }

    const remote =
      await this.dataSource.getEnrolledCourses(
        studentId
      );

    if (remote.length > 0) {
      await this.cacheSource.cacheEnrolledCourses(
        studentId,
        remote
      );
    }

    return remote;
  }
}
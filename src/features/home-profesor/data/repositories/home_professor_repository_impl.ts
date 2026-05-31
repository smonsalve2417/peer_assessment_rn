import { Course } from "../../domain/entities/course";
import { HomeProfessorRepository } from "../../domain/repositories/home_professor_repository";
import { HomeProfessorDataSource } from "../datasources/home_professor_datasource";
import { LocalHomeProfessorCacheSource } from "../datasources/local_home_professor_cache_source";

export class HomeProfessorRepositoryImpl implements HomeProfessorRepository {
  dataSource: HomeProfessorDataSource;
  cacheSource: LocalHomeProfessorCacheSource;

  constructor(dataSource: HomeProfessorDataSource, cacheSource: LocalHomeProfessorCacheSource) {
    this.dataSource = dataSource;
    this.cacheSource = cacheSource;
  }

  async getAssignedCourses(professorId: string): Promise<Course[]> {
    const isValid = await this.cacheSource.isAssignedCoursesCacheValid(professorId);
    if (isValid) {
      const cached = await this.cacheSource.getCachedAssignedCourses(professorId);
      if (cached != null) return cached;
    }

    const remote = await this.dataSource.getAssignedCourses(professorId);
    if (remote.length > 0) {
      await this.cacheSource.cacheAssignedCourses(professorId, remote);
    }
    return remote;
  }
}

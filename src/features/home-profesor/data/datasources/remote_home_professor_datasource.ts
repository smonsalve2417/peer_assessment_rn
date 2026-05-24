import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { Course } from "../../domain/entities/course";
import { HomeProfessorDataSource } from "./home_professor_datasource";

export class RemoteHomeProfessorDataSource implements HomeProfessorDataSource {
  private readonly contract: string;
  private readonly baseUrl = "https://roble-api.openlab.uninorte.edu.co";
  private readonly prefs: ILocalPreferences;

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    this.contract = projectId;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  private buildUrl(path: string, params: Record<string, string>): string {
    const query = new URLSearchParams(params).toString();
    return `${this.baseUrl}${path}?${query}`;
  }

  async getAssignedCourses(professorId: string): Promise<Course[]> {
    const token = await this.prefs.retrieveData<string>("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Flutter filtra por 'profid' (userId, no email)
    const res = await fetch(
      this.buildUrl(`/database/${this.contract}/read`, {
        tableName: "cursos",
        profid: professorId,
      }),
      { headers }
    );

    if (!res.ok) {
      throw new Error(`getAssignedCourses error ${res.status}`);
    }

    const rows: any[] = await res.json();

    const courses = await Promise.all(
      rows.map((row) => this._enrichCourse(row, token!))
    );

    return courses;
  }

  private async _enrichCourse(courseJson: any, token: string): Promise<Course> {
    const courseId = courseJson["_id"] as string;

    const [studentsCount, activeEvaluations, totalEvaluations] = await Promise.all([
      this._getStudentsCount(courseId, token),
      this._getActiveEvaluationsCount(courseId, token),
      this._getTotalEvaluationsCount(courseId, token),
    ]);

    return new Course({
      id: courseId,
      code: courseJson["code"] ?? "---",
      name: courseJson["name"] ?? "---",
      period: courseJson["period"] ?? "---",
      studentsCount,
      activeEvaluations,
      totalEvaluations,
    });
  }

  // Cuenta estudiantes únicos: group_categories del curso → grupitos por cada categoría → emails únicos
  private async _getStudentsCount(courseId: string, token: string): Promise<number> {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const gcRes = await fetch(
        this.buildUrl(`/database/${this.contract}/read`, {
          tableName: "group_categories",
          course_id: courseId,
        }),
        { headers }
      );

      if (!gcRes.ok) {
        console.error(`group_categories error for course ${courseId}: ${gcRes.status}`);
        return 0;
      }

      const groupCategories: any[] = await gcRes.json();
      if (groupCategories.length === 0) return 0;

      const uniqueEmails = new Set<string>();

      await Promise.all(
        groupCategories.map(async (gc) => {
          const gcName = gc["name"] as string | undefined;
          if (!gcName) return;

          const gRes = await fetch(
            this.buildUrl(`/database/${this.contract}/read`, {
              tableName: "grupitos",
              GroupCategory: gcName,
            }),
            { headers }
          );

          if (!gRes.ok) {
            console.error(`grupitos error for GroupCategory ${gcName}: ${gRes.status}`);
            return;
          }

          const members: any[] = await gRes.json();
          for (const member of members) {
            const email = member["correo"] as string | undefined;
            if (email) uniqueEmails.add(email);
          }
        })
      );

      return uniqueEmails.size;
    } catch (e) {
      console.error(`_getStudentsCount error for course ${courseId}:`, e);
      return 0;
    }
  }

  private async _getActiveEvaluationsCount(courseId: string, token: string): Promise<number> {
    try {
      const res = await fetch(
        this.buildUrl(`/database/${this.contract}/read`, {
          tableName: "evaluations",
          course_id: courseId,
          status: "active",
        }),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const evaluations: any[] = await res.json();
        return evaluations.length;
      }
      console.error(`evaluations error for course ${courseId}: ${res.status}`);
      return 0;
    } catch (e) {
      console.error(`_getActiveEvaluationsCount error for course ${courseId}:`, e);
      return 0;
    }
  }

  private async _getTotalEvaluationsCount(courseId: string, token: string): Promise<number> {
    try {
      const res = await fetch(
        this.buildUrl(`/database/${this.contract}/read`, {
          tableName: "evaluations",
          course_id: courseId,
        }),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const evaluations: any[] = await res.json();
        return evaluations.length;
      }
      console.error(`evaluations total error for course ${courseId}: ${res.status}`);
      return 0;
    } catch (e) {
      console.error(`_getTotalEvaluationsCount error for course ${courseId}:`, e);
      return 0;
    }
  }
}

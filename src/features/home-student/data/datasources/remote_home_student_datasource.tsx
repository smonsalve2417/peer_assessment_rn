import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { CourseModel } from "../models/course_model";
import { EvaluationModel } from "../models/evaluation_model";
import { HomeStudentDataSource } from "./home_student_datasource";

export class RemoteHomeStudentDataSource implements HomeStudentDataSource {
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

  async getEnrolledCourses(studentEmail: string): Promise<CourseModel[]> {
    const token = await this.prefs.retrieveData<string>("token");
    const headers = { Authorization: `Bearer ${token}` };

    const grupitosRes = await fetch(
      this.buildUrl(`/database/${this.contract}/read`, {
        tableName: "grupitos",
        correo: studentEmail,
      }),
      { headers }
    );

    if (!grupitosRes.ok) {
      throw new Error(`getEnrolledCourses grupitos error ${grupitosRes.status}`);
    }

    const grupitos: any[] = await grupitosRes.json();
    const categoryNames = new Set<string>(grupitos.map((g) => g["GroupCategory"] as string));
    if (categoryNames.size === 0) return [];

    const courseIds = new Set<string>();
    for (const name of categoryNames) {
      const catRes = await fetch(
        this.buildUrl(`/database/${this.contract}/read`, {
          tableName: "group_categories",
          name,
        }),
        { headers }
      );
      if (!catRes.ok) {
        console.error(`getEnrolledCourses group_categories error ${catRes.status}`);
        continue;
      }
      const categories: any[] = await catRes.json();
      for (const cat of categories) {
        const courseId = cat["course_id"] as string | undefined;
        if (courseId) courseIds.add(courseId);
      }
    }

    if (courseIds.size === 0) return [];

    const courses: CourseModel[] = [];
    for (const courseId of courseIds) {
      const courseRes = await fetch(
        this.buildUrl(`/database/${this.contract}/read`, {
          tableName: "cursos",
          _id: courseId,
        }),
        { headers }
      );
      if (!courseRes.ok) {
        console.error(`getEnrolledCourses cursos error ${courseRes.status}`);
        continue;
      }
      const rows: any[] = await courseRes.json();
      for (const row of rows) {
        const activeEvaluations = await this._getActiveEvaluationsCount(courseId, token!);
        courses.push(CourseModel.fromJson({ ...row, activeEvaluations }));
      }
    }

    return courses;
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

  async getActiveEvaluations(
    studentEmail: string,
    _submittedIds: Set<string>
  ): Promise<EvaluationModel[]> {
    const token = await this.prefs.retrieveData<string>("token");
    const headers = { Authorization: `Bearer ${token}` };

    const grupitosRes = await fetch(
      this.buildUrl(`/database/${this.contract}/read`, {
        tableName: "grupitos",
        correo: studentEmail,
      }),
      { headers }
    );
    if (!grupitosRes.ok) {
      console.error(`getActiveEvaluations grupitos error ${grupitosRes.status}`);
      return [];
    }
    const grupitos: any[] = await grupitosRes.json();
    const categoryNames = new Set<string>(grupitos.map((g) => g["GroupCategory"] as string));
    if (categoryNames.size === 0) return [];

    const courseIds = new Set<string>();
    for (const name of categoryNames) {
      const catRes = await fetch(
        this.buildUrl(`/database/${this.contract}/read`, {
          tableName: "group_categories",
          name,
        }),
        { headers }
      );
      if (!catRes.ok) continue;
      const cats: any[] = await catRes.json();
      for (const cat of cats) {
        const courseId = cat["course_id"] as string | undefined;
        if (courseId) courseIds.add(courseId);
      }
    }
    if (courseIds.size === 0) return [];

    const result: EvaluationModel[] = [];
    for (const courseId of courseIds) {
      const evalsRes = await fetch(
        this.buildUrl(`/database/${this.contract}/read`, {
          tableName: "evaluations",
          course_id: courseId,
          status: "active",
        }),
        { headers }
      );
      if (!evalsRes.ok) continue;

      const evals: Record<string, any>[] = await evalsRes.json();
      if (evals.length === 0) continue;

      await this._closeExpiredEvaluations(evals, headers);
      const stillActive = evals.filter((e) => e["status"] === "active");
      if (stillActive.length === 0) continue;

      const courseRes = await fetch(
        this.buildUrl(`/database/${this.contract}/read`, {
          tableName: "cursos",
          _id: courseId,
        }),
        { headers }
      );
      const courseJson: Record<string, any> =
        courseRes.ok ? ((await courseRes.json()) as any[])[0] ?? {} : {};

      for (const evalRow of stillActive) {
        result.push(EvaluationModel.fromDbJson(evalRow, courseJson));
      }
    }

    return result;
  }

  private async _closeExpiredEvaluations(
    rows: Record<string, any>[],
    headers: Record<string, string>
  ): Promise<void> {
    const now = new Date();
    for (const row of rows) {
      if (row["status"] !== "active") continue;
      const deadline = row["deadline"] ? new Date(row["deadline"] as string) : null;
      if (!deadline || deadline > now) continue;

      const id = row["_id"]?.toString();
      if (!id) {
        console.error("_closeExpiredEvaluations: missing _id in row:", row);
        continue;
      }

      const res = await fetch(`${this.baseUrl}/database/${this.contract}/update`, {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          tableName: "evaluations",
          idColumn: "_id",
          idValue: id,
          updates: { status: "closed" },
        }),
      });

      if (res.ok) {
        row["status"] = "closed";
      } else {
        console.error(`_closeExpiredEvaluations PUT error ${res.status}:`, await res.text());
      }
    }
  }
}

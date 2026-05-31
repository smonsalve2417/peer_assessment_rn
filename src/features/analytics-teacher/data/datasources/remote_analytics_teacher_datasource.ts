import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { TeacherAnalyticsModel } from "../models/teacher_analytics_model";
import { IAnalyticsTeacherDatasource } from "./i_analytics_teacher_datasource";

export class RemoteAnalyticsTeacherDatasource implements IAnalyticsTeacherDatasource {
  private readonly contract: string;
  private readonly baseUrl = "https://roble-api.openlab.uninorte.edu.co";
  private readonly prefs = LocalPreferencesAsyncStorage.getInstance();

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID");
    this.contract = projectId;
  }

  async fetchCourseAnalytics(params: {
    courseId: string;
    evalIdToName: Record<string, string>;
  }): Promise<TeacherAnalyticsModel | null> {
    const token = await this.prefs.retrieveData<string>("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const [allRows, emailMaps] = await Promise.all([
      this._fetchAllResponses(Object.keys(params.evalIdToName), headers),
      this._fetchEmailMaps(params.courseId, headers),
    ]);

    if (allRows.length === 0) return null;

    return new TeacherAnalyticsModel(
      allRows,
      emailMaps.emailToDisplayName,
      emailMaps.emailToGroupName,
      params.evalIdToName,
    );
  }

  private async _fetchAllResponses(
    evaluationIds: string[],
    headers: Record<string, string>,
  ): Promise<Record<string, any>[]> {
    const results = await Promise.all(
      evaluationIds.map(async (id) => {
        const url = `${this.baseUrl}/database/${this.contract}/read?tableName=responses&evaluation_id=${id}`;
        const res = await fetch(url, { headers });
        if (res.status !== 200) return [];
        const rows: Record<string, any>[] = await res.json();
        for (const r of rows) {
          r.evaluation_id = r.evaluation_id ?? id;
        }
        return rows;
      })
    );
    return results.flat();
  }

  private async _fetchEmailMaps(
    courseId: string,
    headers: Record<string, string>,
  ): Promise<{ emailToDisplayName: Record<string, string>; emailToGroupName: Record<string, string> }> {
    const catUrl = `${this.baseUrl}/database/${this.contract}/read?tableName=group_categories&course_id=${courseId}`;
    const catRes = await fetch(catUrl, { headers });
    if (catRes.status !== 200) return { emailToDisplayName: {}, emailToGroupName: {} };

    const categories: Record<string, any>[] = await catRes.json();
    const emailToDisplayName: Record<string, string> = {};
    const emailToGroupName: Record<string, string> = {};

    await Promise.all(
      categories.map(async (cat) => {
        const groupUrl = `${this.baseUrl}/database/${this.contract}/read?tableName=grupitos&GroupCategory=${encodeURIComponent(cat.name)}`;
        const groupRes = await fetch(groupUrl, { headers });
        if (groupRes.status !== 200) return;
        const members: Record<string, any>[] = await groupRes.json();
        for (const m of members) {
          const email = m.correo ?? "";
          if (!email) continue;
          emailToDisplayName[email] = `${m.FirstName ?? ""} ${m.LastName ?? ""}`.trim();
          emailToGroupName[email] = m.Groupname ?? "Unknown";
        }
      })
    );

    return { emailToDisplayName, emailToGroupName };
  }
}
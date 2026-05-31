import { ILocalPreferences } from '@/src/core/iLocalPreferences';
import { StudentAnalyticsModel } from '../models/student_analytics_model';
import { AnalyticsStudentDatasource } from './i_analytics_student_datasource';

export class RemoteAnalyticsStudentDatasource implements AnalyticsStudentDatasource {
  private readonly contract: string;
  private readonly baseUrl = 'https://roble-api.openlab.uninorte.edu.co';
  private readonly prefs: ILocalPreferences;

  constructor(prefs: ILocalPreferences, projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error('Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var');
    this.contract = projectId;
    this.prefs = prefs;
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const token = await this.prefs.retrieveData<string>('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async fetchResults(evaluationId: string, studentEmail: string): Promise<StudentAnalyticsModel | null> {
    const url = new URL(`${this.baseUrl}/database/${this.contract}/read`);
    url.searchParams.set('tableName', 'responses');
    url.searchParams.set('evaluation_id', evaluationId);
    url.searchParams.set('evaluated_email', studentEmail);

    const finalUrl = url.toString();
    console.debug('[Analytics] fetching results url:', finalUrl);
    const response = await fetch(finalUrl, { headers: await this.buildHeaders() });

    if (!response.ok) {
      const body = await response.text();
      console.error(`fetchResults error ${response.status}: ${body}`);
      throw new Error(`Error fetching analytics: ${response.status}`);
    }

    const rows: Record<string, any>[] = await response.json();
    console.debug(`[Analytics] fetched rows count: ${Array.isArray(rows) ? rows.length : 'not-array'}`);
    if (!rows || rows.length === 0) return null;

    return StudentAnalyticsModel.fromRows(rows);
  }
}

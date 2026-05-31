import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { EvalPeerModel } from "../models/eval_peer_model";
import { EvalSubmissionModel } from "../models/eval_submission_model";
import { EvalFormDatasource } from "./eval_form_datasource";

export class RemoteEvalFormDatasource implements EvalFormDatasource {
  private readonly contract: string;
  private readonly baseUrl = "https://roble-api.openlab.uninorte.edu.co";
  private readonly prefs: ILocalPreferences;

  constructor(
    prefs: ILocalPreferences,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID,
  ) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.prefs = prefs;
    this.contract = projectId;
  }

  private buildUrl(path: string, params: Record<string, string>): string {
    const query = new URLSearchParams(params).toString();
    return `${this.baseUrl}${path}?${query}`;
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const token = await this.prefs.retrieveData<string>("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getGroupPeers(groupCategory: string, studentEmail: string): Promise<EvalPeerModel[]> {
    const studentUrl = this.buildUrl(`/database/${this.contract}/read`, {
      tableName: "grupitos",
      GroupCategory: groupCategory,
      correo: studentEmail,
    });

    const studentResponse = await fetch(studentUrl, { headers: await this.buildHeaders() });

    if (!studentResponse.ok) {
      console.error(`getGroupPeers student lookup error ${studentResponse.status}`);
      throw new Error(`Error fetching student group: ${studentResponse.status}`);
    }

    const studentRows: Record<string, any>[] = await studentResponse.json();
    if (studentRows.length === 0) return [];

    const groupName = studentRows[0]["Groupname"] as string;

    const peersUrl = this.buildUrl(`/database/${this.contract}/read`, {
      tableName: "grupitos",
      GroupCategory: groupCategory,
      Groupname: groupName,
    });

    const peersResponse = await fetch(peersUrl, { headers: await this.buildHeaders() });

    if (!peersResponse.ok) {
      console.error(`getGroupPeers peers lookup error ${peersResponse.status}`);
      throw new Error(`Error fetching peers: ${peersResponse.status}`);
    }

    const peerRows: Record<string, any>[] = await peersResponse.json();

    return peerRows
      .filter((row) => row["correo"] !== studentEmail)
      .map((row) => EvalPeerModel.fromJson(row));
  }

  async getSubmittedEvaluationIds(studentEmail: string): Promise<Set<string>> {
    const url = this.buildUrl(`/database/${this.contract}/read`, {
      tableName: "responses",
      evaluator_email: studentEmail,
    });

    const response = await fetch(url, { headers: await this.buildHeaders() });

    if (!response.ok) {
      console.error(`getSubmittedEvaluationIds error ${response.status}`);
      return new Set<string>();
    }

    const rows: Record<string, any>[] = await response.json();
    return new Set(rows.map((row) => row["evaluation_id"] as string));
  }

  async submitEvaluation(model: EvalSubmissionModel): Promise<void> {
    const url = `${this.baseUrl}/database/${this.contract}/insert`;

    const response = await fetch(url, {
      method: "POST",
      headers: await this.buildHeaders(),
      body: JSON.stringify({
        tableName: "responses",
        records: [model.toJson()],
      }),
    });

    if (response.status !== 201) {
      const responseText = await response.text();
      console.error(`submitEvaluation error ${response.status}: ${responseText}`);
      throw new Error(`Error submitting evaluation: ${response.status}`);
    }
  }
}

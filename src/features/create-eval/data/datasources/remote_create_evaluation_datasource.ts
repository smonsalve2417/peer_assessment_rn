import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { CreateEvaluationModel } from "../models/create_evaluation_model";
import { CreateEvaluationDatasource } from "./create_evaluation_datasource";

export class RemoteCreateEvaluationDatasource implements CreateEvaluationDatasource {
  private readonly contract: string;
  private readonly baseUrl = "https://roble-api.openlab.uninorte.edu.co";
  private readonly prefs: ILocalPreferences;

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    this.contract = projectId;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async createEvaluation(model: CreateEvaluationModel): Promise<void> {
    const token = await this.prefs.retrieveData<string>("token");

    const response = await fetch(`${this.baseUrl}/database/${this.contract}/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tableName: "evaluations",
        records: [model.toJson()],
      }),
    });

    if (response.status !== 201) {
      const body = await response.json().catch(() => ({}));
      throw new Error(`createEvaluation error ${response.status}: ${body.message ?? ""}`);
    }
  }
}

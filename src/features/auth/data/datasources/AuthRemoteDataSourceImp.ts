import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSource } from "./AuthRemoteDataSource";


export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;
  private readonly dbBaseUrl: string;
  private prefs: ILocalPreferences;

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/auth/${this.projectId}`;
    this.dbBaseUrl = `https://roble-api.openlab.uninorte.edu.co/database/${this.projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async login(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 201) {
      const data = await response.json();
      await this.prefs.storeData("token", data["accessToken"]);
      await this.prefs.storeData("refreshToken", data["refreshToken"]);
      await this.prefs.storeData("userId", data["user"]["id"]);
      await this.prefs.storeData("userName", data["user"]["name"]);
    } else {
      const body = await response.json();
      throw new Error(`Login error: ${body.message}`);
    }
  }

  async getCurrentUser(): Promise<{ email: string; name: string; password: string } | null> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) return null;
    const userId = await this.prefs.retrieveData<string>("userId");
    if (!userId) return null;

    const params = new URLSearchParams({ tableName: "Users", userId });
    const response = await fetch(`${this.dbBaseUrl}/read?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      const rows: any[] = await response.json();
      const user = rows[0];
      if (!user) return null;
      return { email: user["email"], name: user["name"], password: ""};
    }

    return null;
  }

  async signUp(name: string, email: string, password: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/signup-direct`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ email, name, password }),
    });

    if (response.status === 201) {
      await this.login(email, password);
      await this.addUser(email, name);
    } else {
      const body = await response.json();
      throw new Error(`Signup error: ${(body.message || []).join(" ")}`);
    }
  }

  async logOut(): Promise<void> {
    //const token = await this.prefs.retrieveData<string>("token");
    //if (!token) throw new Error("No token found");

    //const response = await fetch(`${this.baseUrl}/logout`, {
      //method: "POST",
      //headers: { Authorization: `Bearer ${token}` },
    //});

    //if (response.status === 201) {
      await this.prefs.removeData("token");
      await this.prefs.removeData("refreshToken");
      await this.prefs.removeData("userId");
      await this.prefs.removeData("userName");
      return Promise.resolve();
    //} else {
      //const body = await response.json();
      //throw new Error(`Logout error: ${body.message}`);
    //}
  }

  async validate(email: string, validationCode: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ email, code: validationCode }),
    });

    if (response.status !== 201) {
      const body = await response.json();
      throw new Error(`Validation error: ${body.message}`);
    }
  }

  async refreshToken(): Promise<boolean> {
    const refreshToken = await this.prefs.retrieveData<string>("refreshToken");
    if (!refreshToken) return false;

    const response = await fetch(`${this.baseUrl}/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.status === 201) {
      const data = await response.json();
      await this.prefs.storeData("token", data["accessToken"]);
      return true;
    } else {
      const body = await response.json();
      throw new Error(`Refresh token error: ${body.message}`);
    }
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const body = await response.json();
      throw new Error(`Forgot password error: ${body.message}`);
    }
  }

  async resetPassword(
    _email: string,
    _newPassword: string,
    _validationCode: string,
  ): Promise<boolean> {
    return true;
  }

  async verifyToken(): Promise<boolean> {
    const token = await this.prefs.retrieveData<string>("token");
    if (!token) return false;

    const response = await fetch(`${this.baseUrl}/verify-token`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.status === 200;
  }

  private async addUser(email: string, name: string): Promise<void> {
    const token = await this.prefs.retrieveData<string>("token");
    const userId = await this.prefs.retrieveData<string>("userId");

    const response = await fetch(`${this.dbBaseUrl}/insert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        tableName: "Users",
        records: [{ userId, email, name }],
      }),
    });

    if (!response.ok) {
      const body = await response.json();
      throw new Error(`addUser error: ${body.message}`);
    }
  }
}

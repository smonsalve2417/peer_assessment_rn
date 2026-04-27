import { ILocalPreferences } from "@/src/core/iLocalPreferences";
import { LocalPreferencesAsyncStorage } from "@/src/core/LocalPreferencesAsyncStorage";
import { AuthRemoteDataSource } from "./AuthRemoteDataSource";

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  private readonly projectId: string;
  private readonly baseUrl: string;

  private prefs: ILocalPreferences;

  constructor(projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID) {
    if (!projectId) {
      throw new Error("Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var");
    }
    this.projectId = projectId;
    this.baseUrl = `https://roble-api.openlab.uninorte.edu.co/auth/${this.projectId}`;
    this.prefs = LocalPreferencesAsyncStorage.getInstance();
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 201) {
        const data = await response.json();
        const token = data["accessToken"];
        const refreshToken = data["refreshToken"];
        await this.prefs.storeData("token", token);
        await this.prefs.storeData("refreshToken", refreshToken);
        await this.prefs.storeData("userEmail", email);
        return Promise.resolve();
      } else {
        const body = await response.json();
        throw new Error(`Login error: ${body.message}`);
      }
    } catch (e: any) {
      throw e;
    }
  }

  async getCurrentUser(): Promise<{ email: string; name: string; password: string } | null> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      if (!token) return null;
      const email = await this.prefs.retrieveData<string>("userEmail");
      if (!email) return null;
      const name = (await this.prefs.retrieveData<string>("userName")) ?? email;
      return { email, name, password: "" };
    } catch {
      return null;
    }
  }

  async signUp(name: string, email: string, password: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/signup-direct`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, name, password }),
      });

      if (response.status === 201) {
        await this.prefs.storeData("userName", name);
        return this.login(email, password);
      } else {
        const body = await response.json();
        throw new Error(`Signup error: ${(body.message || []).join(" ")}`);
      }
    } catch (e: any) {
      console.error("Signup failed", e);
      throw e;
    }
  }

  async logOut(): Promise<void> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      if (!token) throw new Error("No token found");

      const response = await fetch(`${this.baseUrl}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        await this.prefs.removeData("token");
        await this.prefs.removeData("refreshToken");
        await this.prefs.removeData("userEmail");
        await this.prefs.removeData("userName");
        return Promise.resolve();
      } else {
        const body = await response.json();
        throw new Error(`Logout error: ${body.message}`);
      }
    } catch (e: any) {
      //console.error("Logout failed", e);
      throw e;
    }
  }
  async validate(email: string, validationCode: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        body: JSON.stringify({ email, code: validationCode }),
      });

      if (response.status === 201) {
        return Promise.resolve();
      } else {
        const body = await response.json();
        throw new Error(`Validation error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("Validation failed", e);
      throw e;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken =
        await this.prefs.retrieveData<string>("refreshToken");
      if (!refreshToken) {
        console.warn("Refresh token failed", "No refresh token found");
        return false;
      }
      const response = await fetch(`${this.baseUrl}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.status === 201) {
        const data = await response.json();
        const newToken = data["accessToken"];
        await this.prefs.storeData("token", newToken);
        console.log("Token refreshed successfully");
        return true;
      } else {
        const body = await response.json();
        throw new Error(`Refresh token error: ${body.message}`);
      }
    } catch (e: any) {
      console.error("Refresh token failed", e);
      throw e;
    }
  }
  forgotPassword(email: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  resetPassword(
    email: string,
    newPassword: string,
    validationCode: string,
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  async verifyToken(): Promise<boolean> {
    try {
      const token = await this.prefs.retrieveData<string>("token");
      if (!token) return false;

      const response = await fetch(`${this.baseUrl}/verify-token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        console.log("Token is valid");
        return true;
      } else {
        const body = await response.json();
        console.error(`Token verification error: ${body.message}`);
        return false;
      }
    } catch (e: any) {
      console.error("Verify token failed", e);
      return false;
    }
  }
}

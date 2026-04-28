export interface AuthRemoteDataSource {
  login(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>;
  getCurrentUser(): Promise<{ email: string; name: string; password: string; student: boolean } | null>;
  logOut(): Promise<void>;
  validate(email: string, validationCode: string): Promise<void>;
  refreshToken(): Promise<boolean>;
  forgotPassword(email: string): Promise<void>;
  resetPassword(
    email: string,
    newPassword: string,
    validationCode: string,
  ): Promise<boolean>;
  verifyToken(): Promise<boolean>;
}

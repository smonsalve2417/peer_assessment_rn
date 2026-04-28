import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { AuthUser } from "../../domain/entities/AuthUser";
import { AuthRepository } from "../../domain/repositories/AuthRepository";

export type AuthContextType = {
  loggedUser: AuthUser | null;
  isLoggedIn: boolean;
  isStudent: boolean;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  validate: (email: string, validationCode: string) => Promise<string | null>;
  getLoggedUser: () => Promise<AuthUser | null>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const authRepo = useMemo(
    () => di.resolve<AuthRepository>(TOKENS.AuthRepo),
    [di],
  );

  const [loggedUser, setLoggedUser] = useState<AuthUser | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const getLoggedUser = async (): Promise<AuthUser | null> => {
    setIsLoading(true);
    try {
      const user = await authRepo.getCurrentUser();
      setLoggedUser(user);
      if (user) setIsStudent(user.student);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    authRepo
      .verifyToken()
      .then(async (valid) => {
        if (valid) {
          await getLoggedUser();
          setIsLoggedIn(true);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    clearError();
    try {
      setIsLoading(true);
      await authRepo.login(email, password);
      await getLoggedUser();
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err?.message ?? "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    clearError();
    try {
      setIsLoading(true);
      await authRepo.signup(name, email, password);
    } catch (err: any) {
      setError(err?.message ?? "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    clearError();
    try {
      setIsLoading(true);
      await authRepo.logout();
      setLoggedUser(null);
      setIsLoggedIn(false);
    } catch (err: any) {
      setError(err?.message ?? "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    clearError();
    try {
      setIsLoading(true);
      await authRepo.forgotPassword(email);
    } catch (err: any) {
      setError(err?.message ?? "Failed to send password reset link");
    } finally {
      setIsLoading(false);
    }
  };

  const validate = async (email: string, validationCode: string) => {
    clearError();
    try {
      await authRepo.validate(email, validationCode);
    } catch (err: any) {
      return err?.message ?? "Validation failed";
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        loggedUser,
        isLoggedIn,
        isStudent,
        isLoading,
        error,
        clearError,
        login,
        signup,
        logout,
        forgotPassword,
        validate,
        getLoggedUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

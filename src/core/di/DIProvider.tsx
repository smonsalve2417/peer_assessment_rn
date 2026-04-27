import React, { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { HomeStudentBinding } from "@/src/features/home-student/presentation/context/home_student_binding";
import { Container } from "./container";
const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
  //useMemo is a React Hook that lets you cache the result of a calculation between re-renders.
  const container = useMemo(() => {
    const c = new Container();

    const authDS = new AuthRemoteDataSourceImpl();
    const authRepo = new AuthRepositoryImpl(authDS);
    c.register(TOKENS.AuthRemoteDS, authDS).register(TOKENS.AuthRepo, authRepo);

    HomeStudentBinding.register(c);

    return c;
  }, []);

  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
  const c = useContext(DIContext);
  if (!c) throw new Error("DIProvider missing");
  return c;
}

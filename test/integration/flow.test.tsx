import React from "react";
import {
  render,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import AuthFlow from "@/src/AuthFlow";
import { DIContext } from "@/src/core/di/DIProvider";
import { Container } from "@/src/core/di/container";
import { TOKENS } from "@/src/core/di/tokens";
import { AuthContext, AuthContextType } from "@/src/features/auth/presentation/context/authContext";
import { AuthUser } from "@/src/features/auth/domain/entities/AuthUser";
import { HomeProfessorRepository } from "@/src/features/home-profesor/domain/repositories/home_professor_repository";
import { HomeStudentRepository } from "@/src/features/home-student/domain/repositories/home_student_repository";
import { TapCourseRepository } from "@/src/features/tap-on-course/domain/repositories/tap_course_repository";
import { EvalFormRepository } from "@/src/features/eval-form/domain/repositories/eval_form_repository";
import { IAnalyticsTeacherRepository } from "@/src/features/analytics-teacher/domain/repositories/i_analytics_teacher_repository";
import { AnalyticsStudentRepository } from "@/src/features/analytics-student/domain/repositories/analytics_student_repository";
import { ICreateEvaluationRepository } from "@/src/features/create-eval/domain/repositories/i_create_evaluation_repository";
import { Course as ProfCourse } from "@/src/features/home-profesor/domain/entities/course";
import { Course as StudentCourse } from "@/src/features/home-student/domain/entities/course";
import { Evaluation, EvaluationStatus } from "@/src/features/home-student/domain/entities/evaluation";
import { CourseEvaluation } from "@/src/features/tap-on-course/domain/entities/course_evaluation";
import { GroupCategory } from "@/src/features/tap-on-course/domain/entities/group_category";
import { EvalPeer } from "@/src/features/eval-form/domain/entities/eval_peer";

// datos para el test

const PROFESSOR_USER: AuthUser = {
  userId: "user-prof-1",
  email: "prof@test.com",
  password: "",
  name: "Josh Professor",
  student: false,
};

const STUDENT_USER: AuthUser = {
  userId: "user-stud-1",
  email: "test@test.com",
  password: "",
  name: "Alice Student",
  student: true,
};

const FAKE_COURSE_PROF = new ProfCourse({
  id: "course-1",
  code: "CS101",
  name: "Software Design",
  period: "2024-10",
  studentsCount: 30,
  activeEvaluations: 0,
  totalEvaluations: 1,
});

const FAKE_COURSE_STUDENT = new StudentCourse({
  id: "course-1",
  code: "CS101",
  name: "Software Design",
  period: "2024-10",
  activeEvaluations: 1,
});

const FAKE_ACTIVE_EVAL = new Evaluation({
  id: "eval-1",
  title: "Sprint 1 Peer Review",
  status: EvaluationStatus.OPEN,
  courseCode: "CS101",
  courseName: "Software Design",
  groupCategory: "Grupo A",
  deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  timeRemaining: "7d",
});

const FAKE_CLOSED_EVAL: CourseEvaluation = {
  id: "eval-2",
  name: "Sprint 0 Peer Review",
  status: "closed",
  groupCategory: "Grupo A",
  deadline: new Date("2024-01-01T14:00:00.000Z"),
  visibility: "public",
};

const FAKE_GROUP_CATEGORY: GroupCategory = {
  name: "Grupo A",
  source: "CSV",
  groups: [],
};

const FAKE_PEERS: EvalPeer[] = [
  new EvalPeer({
    firstName: "Bob",
    lastName: "Peer",
    email: "bob@test.com",
  }),
];

function makeFakeAuthContext(user: AuthUser): AuthContextType {
  return {
    loggedUser: null,
    isLoggedIn: false,
    isStudent: user.student,
    isLoading: false,  
    error: null,
    clearError: jest.fn(),
    login: jest.fn(async () => {}),
    signup: jest.fn(),
    logout: jest.fn(async () => {}),
    forgotPassword: jest.fn(),
    validate: jest.fn().mockResolvedValue(null),
    getLoggedUser: jest.fn().mockResolvedValue(user),
  };
}

const makeFakeHomeProfessorRepo = (): HomeProfessorRepository => ({
  getAssignedCourses: jest.fn(async () => [FAKE_COURSE_PROF]),
});

const makeFakeHomeStudentRepo = (): HomeStudentRepository => ({
  getActiveEvaluations: jest.fn(async () => [FAKE_ACTIVE_EVAL]),
  getEnrolledCourses: jest.fn(async () => [FAKE_COURSE_STUDENT]),
});

const makeFakeTapCourseRepo = (): TapCourseRepository => ({
  getCourseEvaluations: jest.fn(async () => [FAKE_CLOSED_EVAL]),
  getCourseGroups: jest.fn(async () => [FAKE_GROUP_CATEGORY]),
  importGroupsFromCsv: jest.fn(async () => []),
});

const makeFakeEvalFormRepo = (): EvalFormRepository => ({
  getGroupPeers: jest.fn(async () => FAKE_PEERS),
  submitEvaluation: jest.fn(async () => {}),
  getSubmittedEvaluationIds: jest.fn(async () => new Set<string>()),
});

const makeFakeAnalyticsTeacherRepo = (): IAnalyticsTeacherRepository => ({
  getCourseAnalytics: jest.fn(async () => null),
});

const makeFakeAnalyticsStudentRepo = (): AnalyticsStudentRepository => ({
  getStudentAnalytics: jest.fn(async () => null),
});

const makeFakeCreateEvaluationRepo = (): ICreateEvaluationRepository => ({
  createEvaluation: jest.fn(async () => {}),
});

interface TestAppOptions {
  user: AuthUser;
}

function buildTestApp({ user }: TestAppOptions) {
  const container = new Container();
  container
    .register(TOKENS.HomeProfessorRepo, makeFakeHomeProfessorRepo())
    .register(TOKENS.HomeStudentRepo, makeFakeHomeStudentRepo())
    .register(TOKENS.TapCourseRepo, makeFakeTapCourseRepo())
    .register(TOKENS.EvalFormRepo, makeFakeEvalFormRepo())
    .register(TOKENS.AnalyticsTeacherRepo, makeFakeAnalyticsTeacherRepo())
    .register(TOKENS.AnalyticsStudentRepo, makeFakeAnalyticsStudentRepo())
    .register(TOKENS.CreateEvaluationRepo, makeFakeCreateEvaluationRepo());

  const authCtx = makeFakeAuthContext(user);

  let setAuthState: (patch: Partial<AuthContextType>) => void = () => {};

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ctx, setCtx] = React.useState<AuthContextType>(authCtx);

    setAuthState = (patch) => setCtx((prev) => ({ ...prev, ...patch }));

    return (
      <DIContext.Provider value={container}>
        <AuthContext.Provider value={ctx}>
          <NavigationContainer>{children}</NavigationContainer>
        </AuthContext.Provider>
      </DIContext.Provider>
    );
  };

  const utils = render(<AuthFlow />, { wrapper: Wrapper });

  const reactiveAuthCtx = new Proxy(authCtx, {
    set(target, prop, value) {
      (target as any)[prop] = value;
      setAuthState({ [prop as string]: value });
      return true;
    },
  });

  return { ...utils, authCtx: reactiveAuthCtx, container };
}

// Flujo de profesor

describe("Flujo Profesor", () => {
  it("login -> ver cursos -> entrar a curso -> crear evaluación -> ver estadísticas -> logout", async () => {
    const { findByTestId, getByPlaceholderText, findByText, authCtx } = buildTestApp({
      user: PROFESSOR_USER,
    });

    //HomeScreen -> LoginScreen 
    fireEvent.press(await findByText("Log in", {}, { timeout: 5000 }));

    //pantalla de login
    await findByText("Let's get you signed in");

    //ingresar
    fireEvent.changeText(getByPlaceholderText("Email"), "prof@test.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "ThePassword!1.");

    // simular login correcto
    act(() => {
      authCtx.isLoggedIn = true;
      authCtx.loggedUser = PROFESSOR_USER;
      authCtx.isStudent = false;
    });

    // HomeProfessorPage -> entrar al curso
    fireEvent.press(await findByText("Software Design"));

    // TapCourseScreen -> crear evaluación
    await findByText("Sprint 0 Peer Review");
    fireEvent.press(await findByText("+ Create evaluation"));

    // CreateEvalScreen
    await findByText("Evaluation Name");
    fireEvent.changeText(
    getByPlaceholderText("e.g. Sprint 3 peer review"),
    "Sprint 2 Peer Review"
    );

    // seleccionar grupo 
    fireEvent.press(await findByText("Select a group category"));
    fireEvent.press(await findByText("Grupo A"));

    // creación -> volver a TapCourseScreen
    fireEvent.press(await findByText("+ Create evaluation"));
    await findByText("Sprint 0 Peer Review");

    // ver estadísticas globales
    fireEvent.press(await findByText("◑"));
    await findByText("No responses yet.");

    // volver a TapCourseScreen 
    fireEvent.press(await findByTestId("back-button"));
    await findByText("Sprint 0 Peer Review");

    // ver estadísticas de una evaluacion
    fireEvent.press(await findByText("View results →"));
    await findByText("No responses yet.");

    // volver -> TapCourseScreen -> HomeProfessorPage
    fireEvent.press(await findByTestId("back-button"));
    await findByText("Sprint 0 Peer Review");

    fireEvent.press(await findByText("‹")); 
    await findByText("Software Design");
    // logout
    fireEvent.press(await findByText("JP"));
    fireEvent.press(await findByText("Sign out"));

    act(() => {
      authCtx.isLoggedIn = false;
      authCtx.loggedUser = null;
    });

    await findByText("Log in");
  });
});

// Flujo de estudiante

describe("Flujo Estudiante", () => {
  it("login -> evaluar compañero -> ver resultados -> ver cursos -> logout", async () => {
    const { findByTestId ,findByText, getByText, getAllByText, getByPlaceholderText, authCtx } = buildTestApp({
      user: STUDENT_USER,
    });

    // HomeScreen -> LoginScreen
    fireEvent.press(await findByText("Log in", {}, { timeout: 5000 }));
    // ingresar 
    fireEvent.changeText(getByPlaceholderText("Email"), "test@test.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "ThePassword!1.");

    // login -> HomeStudentPage 
    act(() => {
      authCtx.isLoggedIn = true;
      authCtx.loggedUser = STUDENT_USER;
      authCtx.isStudent = true;
    });

    await waitFor(() => {
      expect(getByText("Student")).toBeTruthy();
    });

    // verificar secciones de la pantalla 
    expect(getByText("Active Evaluations")).toBeTruthy();
    expect(getByText("Sprint 1 Peer Review")).toBeTruthy();
    expect(getByText("My Courses")).toBeTruthy();
    expect(getAllByText("Software Design").length).toBeGreaterThanOrEqual(1);

    // tap en evaluación activa -> EvalFormScreen 
    fireEvent.press(getByText("Evaluate now →"));

    await waitFor(() => {
      expect(getByText("Bob Peer")).toBeTruthy();
    });

    // verificar indicador de progreso
    expect(getByText("Peer 1 of 1")).toBeTruthy();

    //  Good es decir 3 para cada criterio
    const goodButtons = getAllByText("Good");
    expect(goodButtons).toHaveLength(4);

    for (const btn of goodButtons) {
      fireEvent.press(btn);
    }

    // submit -> volver a HomeStudentPage 
    await waitFor(() => expect(getByText("Submit →")).toBeTruthy());
    fireEvent.press(getByText("Submit →"));

    await waitFor(() => {
      expect(getByText("Active Evaluations")).toBeTruthy();
    });

    // verificar cursos
    expect(getByText("My Courses")).toBeTruthy();
    expect(getAllByText("Software Design").length).toBeGreaterThanOrEqual(1);

    // entrar a un curso 
    fireEvent.press(getAllByText("Software Design")[getAllByText("Software Design").length - 1]);

    await waitFor(() => {
      expect(getByText("Sprint 0 Peer Review")).toBeTruthy();
    });

    // ver resultados -> AnalyticsStudentScreen 
    fireEvent.press(getByText("View results →"));

    await waitFor(() => {
      expect(getByText("No results available yet.")).toBeTruthy();
    });

    // volver -> TapCourseScreen -> HomeStudentPage
    fireEvent.press(await findByTestId("back-button"));
    fireEvent.press(await findByTestId("back-button"));

    await waitFor(() => {
      expect(getByText("Active Evaluations")).toBeTruthy();
    });

    // Logout 
    fireEvent.press(getByText("AS"));

    await waitFor(() => expect(getByText("Sign out")).toBeTruthy());
    fireEvent.press(getByText("Sign out"));

    act(() => {
      authCtx.isLoggedIn = false;
      authCtx.loggedUser = null;
    });

    await waitFor(() => {
      expect(getByText("Log in")).toBeTruthy();
    });
  });
});

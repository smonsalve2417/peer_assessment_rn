import { useNavigation, useRoute } from "@react-navigation/native";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { TextInput } from "react-native";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { ICreateEvaluationRepository } from "../../domain/repositories/i_create_evaluation_repository";
import { CreateEvaluation } from "../../domain/usecases/create_evaluation";
import { CreateEvaluationParams } from "../../domain/entities/create_evaluation_params";

type CreateEvalContextType = {
  // Datos del curso (recibidos por navegación)
  courseName: string;
  groupCategoryNames: string[];

  // Estado del formulario
  name: string;
  setName: (v: string) => void;
  selectedGroup: string | null;
  selectGroup: (v: string) => void;
  deadline: Date;
  setDeadline: (dt: Date) => void;
  visibility: "public" | "private";
  selectVisibility: (v: "public" | "private") => void;

  // Submit
  isCreating: boolean;
  isFormValid: boolean;
  onCreateTapped: () => Promise<void>;

  // Navegación
  goBack: () => void;
};

const CreateEvalContext = createContext<CreateEvalContextType | undefined>(undefined);

export function CreateEvalProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Parámetros recibidos desde TapCourseScreen
  const { course, groupCategories } = route.params as {
    course: { id: string; name: string };
    groupCategories: { name: string }[];
  };

  const repo = useMemo(
    () => di.resolve<ICreateEvaluationRepository>(TOKENS.CreateEvaluationRepo),
    [di]
  );
  const createEvaluationUC = useMemo(() => new CreateEvaluation(repo), [repo]);

  const groupCategoryNames = useMemo(
    () => groupCategories.map((c) => c.name),
    [groupCategories]
  );

  // Form state
  const [name, setName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<Date>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // +7 días por defecto
  );
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [isCreating, setIsCreating] = useState(false);

  const isFormValid = name.trim().length > 0 && selectedGroup !== null;

  const selectGroup = useCallback((v: string) => setSelectedGroup(v), []);
  const selectVisibility = useCallback((v: "public" | "private") => setVisibility(v), []);
  const goBack = useCallback(() => navigation.goBack(), [navigation]);

  const onCreateTapped = useCallback(async () => {
    if (isCreating || !isFormValid) return;
    setIsCreating(true);
    try {
      const params = new CreateEvaluationParams({
        name: name.trim(),
        courseId: course.id,
        groupCategoryName: selectedGroup!,
        deadline,
        visibility,
      });
      await createEvaluationUC.call(params);
      navigation.goBack();
    } catch (e) {
      console.error("onCreateTapped error:", e);
    } finally {
      setIsCreating(false);
    }
  }, [isCreating, isFormValid, name, course, selectedGroup, deadline, visibility, createEvaluationUC, navigation]);

  return (
    <CreateEvalContext.Provider
      value={{
        courseName: course.name,
        groupCategoryNames,
        name,
        setName,
        selectedGroup,
        selectGroup,
        deadline,
        setDeadline,
        visibility,
        selectVisibility,
        isCreating,
        isFormValid,
        onCreateTapped,
        goBack,
      }}
    >
      {children}
    </CreateEvalContext.Provider>
  );
}

export function useCreateEval(): CreateEvalContextType {
  const ctx = useContext(CreateEvalContext);
  if (!ctx) throw new Error("useCreateEval must be used inside CreateEvalProvider");
  return ctx;
}

import { useNavigation, useRoute } from "@react-navigation/native";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { CourseEvaluation } from "@/src/features/tap-on-course/domain/entities/course_evaluation";
import { EvalPeer } from "../../domain/entities/eval_peer";
import { EvalSubmission } from "../../domain/entities/eval_submitions";
import { EvalFormRepository } from "../../domain/repositories/eval_form_repository";
import { GetGroupPeers } from "../../domain/usecases/get_group_peers";
import { SubmitPeerEvaluation } from "../../domain/usecases/submit_peer_evaluation";

export type EvalCriterion = {
  label: string;
  key: string;
};

export type ScoreOption = {
  value: number;
  label: string;
};

export const evalCriteria: EvalCriterion[] = [
  { label: "Punctuality", key: "punctuality" },
  { label: "Contributions", key: "contributions" },
  { label: "Commitment", key: "commitment" },
  { label: "Attitude", key: "attitude" },
];

export const scoreOptions: ScoreOption[] = [
  { value: 2, label: "Bad" },
  { value: 3, label: "Adequate" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

type EvalFormRouteParams = {
  evaluation: CourseEvaluation;
  courseName: string;
};

type EvalFormContextType = {
  evaluation: CourseEvaluation | null;
  courseName: string;
  studentEmail: string;
  peers: EvalPeer[];
  currentPeer: EvalPeer | null;
  isLoading: boolean;
  isSubmitting: boolean;
  currentIndex: number;
  elapsedTime: string;
  doneCount: number;
  currentScores: Record<string, number | null>;
  currentComment: string;
  isLastPeer: boolean;
  isFormValid: boolean;
  nextPeerName: string;
  selectScore: (criterionKey: string, score: number) => void;
  setCurrentComment: (comment: string) => void;
  onNextOrSubmit: () => Promise<void>;
  resetCurrentPeer: () => void;
};

const EvalFormContext = createContext<EvalFormContextType | undefined>(
  undefined,
);

function createEmptyScores(): Record<string, number | null> {
  return Object.fromEntries(
    evalCriteria.map((criterion) => [criterion.key, null]),
  ) as Record<string, number | null>;
}

export function EvalFormProvider({ children }: { children: React.ReactNode }) {
  const { loggedUser } = useAuth();
  const di = useDI();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const params = route.params as EvalFormRouteParams;
  const evaluation = params?.evaluation ?? null;
  const courseName = params?.courseName ?? "";
  const studentEmail = loggedUser?.email ?? "";

  const repo = useMemo(
    () => di.resolve<EvalFormRepository>(TOKENS.EvalFormRepo),
    [di],
  );
  const getGroupPeersUC = useMemo(() => new GetGroupPeers(repo), [repo]);
  const submitPeerEvaluationUC = useMemo(
    () => new SubmitPeerEvaluation(repo),
    [repo],
  );

  const [peers, setPeers] = useState<EvalPeer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState("0:00");
  const [currentScores, setCurrentScores] =
    useState<Record<string, number | null>>(createEmptyScores());
  const [currentComment, setCurrentComment] = useState("");
  const [allScores, setAllScores] = useState<Record<string, number | null>[]>(
    [],
  );
  const [allComments, setAllComments] = useState<string[]>([]);
  const [_secondsElapsed, setSecondsElapsed] = useState(0);

  const currentPeer = peers[currentIndex] ?? null;
  const isLastPeer =
    peers.length === 0 ? true : currentIndex === peers.length - 1;
  const isFormValid = evalCriteria.every(
    (criterion) => currentScores[criterion.key] != null,
  );
  const nextPeerName =
    currentIndex + 1 < peers.length ? peers[currentIndex + 1].fullName : "";
  const doneCount = useMemo(
    () =>
      allScores.filter((scores) =>
        evalCriteria.every((criterion) => scores[criterion.key] != null),
      ).length,
    [allScores],
  );

  const syncCurrentPeer = useCallback(
    (
      index: number,
      scoresList: Record<string, number | null>[],
      commentsList: string[],
    ) => {
      setCurrentScores(
        scoresList[index] ? { ...scoresList[index] } : createEmptyScores(),
      );
      setCurrentComment(commentsList[index] ?? "");
    },
    [],
  );

  const loadPeers = useCallback(async () => {
    if (!evaluation || !studentEmail) {
      console.error("EvalFormContext: missing evaluation or student email");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const loadedPeers = await getGroupPeersUC.call(
        evaluation.groupCategory,
        studentEmail,
      );
      const initialScores = loadedPeers.map(() => createEmptyScores());
      const initialComments = loadedPeers.map(() => "");

      setPeers(loadedPeers);
      setAllScores(initialScores);
      setAllComments(initialComments);
      setCurrentIndex(0);
      syncCurrentPeer(0, initialScores, initialComments);
    } catch (error) {
      console.error("EvalFormContext loadPeers error:", error);
      setPeers([]);
      setAllScores([]);
      setAllComments([]);
      setCurrentScores(createEmptyScores());
      setCurrentComment("");
    } finally {
      setIsLoading(false);
    }
  }, [evaluation, studentEmail, getGroupPeersUC, syncCurrentPeer]);

  useEffect(() => {
    loadPeers();
  }, [loadPeers]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((seconds) => {
        const next = seconds + 1;
        const minutes = Math.floor(next / 60);
        const secondsPart = next % 60;
        setElapsedTime(`${minutes}:${secondsPart.toString().padStart(2, "0")}`);
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (allScores.length === 0 || peers.length === 0) return;
    if (currentIndex < 0 || currentIndex >= peers.length) return;
    syncCurrentPeer(currentIndex, allScores, allComments);
  }, [currentIndex, allScores, allComments, peers.length, syncCurrentPeer]);

  const selectScore = useCallback((criterionKey: string, score: number) => {
    setCurrentScores((prev) => ({ ...prev, [criterionKey]: score }));
  }, []);

  const resetCurrentPeer = useCallback(() => {
    setCurrentScores(createEmptyScores());
    setCurrentComment("");
  }, []);

  const saveCurrentPeerSnapshot = useCallback(
    (
      snapshotScores: Record<string, number | null>[],
      snapshotComments: string[],
    ) => {
      if (currentIndex < 0 || currentIndex >= peers.length)
        return { scores: snapshotScores, comments: snapshotComments };

      const nextScores = snapshotScores.map((item) => ({ ...item }));
      const nextComments = [...snapshotComments];
      nextScores[currentIndex] = { ...currentScores };
      nextComments[currentIndex] = currentComment;
      return { scores: nextScores, comments: nextComments };
    },
    [currentIndex, peers.length, currentScores, currentComment],
  );

  const onNextOrSubmit = useCallback(async () => {
    if (!evaluation || isSubmitting || peers.length === 0) return;
    if (!isFormValid) return;

    const snapshot = saveCurrentPeerSnapshot(allScores, allComments);
    setAllScores(snapshot.scores);
    setAllComments(snapshot.comments);

    if (!isLastPeer) {
      setCurrentIndex((value) => value + 1);
      return;
    }

    setIsSubmitting(true);
    try {
      for (let index = 0; index < peers.length; index++) {
        const scores = snapshot.scores[index];
        const complete = evalCriteria.every(
          (criterion) => scores[criterion.key] != null,
        );
        if (!complete) continue;

        await submitPeerEvaluationUC.call(
          new EvalSubmission({
            evaluationId: evaluation.id,
            evaluatorEmail: studentEmail,
            evaluatedEmail: peers[index].email,
            scores: Object.fromEntries(
              Object.entries(scores).filter(([, value]) => value != null),
            ) as Record<string, number>,
            comment: snapshot.comments[index]?.trim().length
              ? snapshot.comments[index].trim()
              : undefined,
          }),
        );
      }
      navigation.goBack();
    } catch (error) {
      console.error("EvalFormContext submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    evaluation,
    isSubmitting,
    peers,
    isFormValid,
    saveCurrentPeerSnapshot,
    allScores,
    allComments,
    isLastPeer,
    submitPeerEvaluationUC,
    studentEmail,
    navigation,
  ]);

  return (
    <EvalFormContext.Provider
      value={{
        evaluation,
        courseName,
        studentEmail,
        peers,
        currentPeer,
        isLoading,
        isSubmitting,
        currentIndex,
        elapsedTime,
        doneCount,
        currentScores,
        currentComment,
        isLastPeer,
        isFormValid,
        nextPeerName,
        selectScore,
        setCurrentComment,
        onNextOrSubmit,
        resetCurrentPeer,
      }}
    >
      {children}
    </EvalFormContext.Provider>
  );
}

export function useEvalForm(): EvalFormContextType {
  const ctx = useContext(EvalFormContext);
  if (!ctx) throw new Error("useEvalForm must be used inside EvalFormProvider");
  return ctx;
}

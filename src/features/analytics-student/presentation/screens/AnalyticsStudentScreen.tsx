import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import RadarChart from "../components/RadarChart";
import ScoreBar from "../components/ScoreBar";
import { useDI } from "@/src/core/di/DIProvider";
import { TOKENS } from "@/src/core/di/tokens";
import { GetStudentAnalytics } from "@/src/features/analytics-student/domain/usecases/get_student_analytics";
import { AnalyticsStudentRepository } from "@/src/features/analytics-student/domain/repositories/analytics_student_repository";

type RouteParams = {
  evaluationId: string;
  studentEmail: string;
  evaluationName?: string;
  courseName?: string;
  isPublic?: boolean;
};

const AnalyticsStudentScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const container = useDI();
  const repo = container.resolve<AnalyticsStudentRepository>(
    TOKENS.AnalyticsStudentRepo,
  );
  const usecase = new GetStudentAnalytics(repo);
  const {
    evaluationId,
    studentEmail,
    evaluationName = "",
    courseName = "",
    isPublic = false,
  } = (route.params || {}) as RouteParams;

  const { loggedUser } = useAuth();
  const targetEmail = (studentEmail ?? loggedUser?.email ?? "").trim();

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);

  useEffect(() => {
    console.debug("[AnalyticsScreen] params", {
      evaluationId,
      studentEmail,
      evaluationName,
      courseName,
      isPublic,
      loggedUserEmail: loggedUser?.email,
    });
    (async () => {
      if (!targetEmail) {
        console.warn("[AnalyticsScreen] missing student email, aborting fetch");
        setData(null);
        setIsLoading(false);
        return;
      }
      try {
        const res = await usecase.call(
          evaluationId,
          targetEmail,
          evaluationName,
          courseName,
          isPublic,
        );
        if (!res) {
          setData(null);
        } else {
          setData({
            punctuality: res.punctuality,
            contributions: res.contributions,
            commitment: res.commitment,
            attitude: res.attitude,
            comments: res.comments,
            avgScore: res.avgScore,
            scoreLabel: res.scoreLabel,
            isPublic: res.isPublic,
          });
        }
      } catch (e) {
        console.error(e);
        setData(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [evaluationId, targetEmail]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={{ color: "white", fontSize: 20 }}>{"<"}</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{evaluationName}</Text>
          <Text style={styles.subtitle}>{courseName}</Text>
        </View>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator color="#BB3322" />
        </View>
      ) : data === null ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#FFFFFF80" }}>No results available yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.cardAvg}>
            <Text style={styles.small}>{"Your avg score in this task"}</Text>
            <Text style={styles.avg}>
              {data.avgScore.toFixed(1)}
              <Text style={styles.slash}> /5.0</Text>
            </Text>
            <View style={styles.labelPill}>
              <Text style={styles.labelPillText}>{data.scoreLabel}</Text>
            </View>
          </View>

          <View style={styles.cardBreakdown}>
            <Text style={styles.cardTitle}>Critiria breakdown</Text>
            <View style={{ alignItems: "center", marginVertical: 16 }}>
              <RadarChart
                punctuality={data.punctuality}
                contributions={data.contributions}
                commitment={data.commitment}
                attitude={data.attitude}
              />
            </View>
            <ScoreBar label="Punctuality" value={data.punctuality} />
            <ScoreBar label="Contributions" value={data.contributions} />
            <ScoreBar label="Commitment" value={data.commitment} />
            <ScoreBar label="Attitude" value={data.attitude} />
          </View>

          <View style={styles.cardComments}>
            <Text style={styles.cardTitle}>Comments</Text>
            {data.comments.length === 0 ? (
              <Text style={{ color: "#FFFFFF60", marginTop: 12 }}>
                No comments yet.
              </Text>
            ) : (
              data.comments.map((c: any, i: number) => (
                <View
                  key={i}
                  style={[
                    styles.commentItem,
                    { marginBottom: i < data.comments.length - 1 ? 12 : 0 },
                  ]}
                >
                  {data.isPublic && (
                    <Text style={styles.commentAuthor}>{c.evaluatorEmail}</Text>
                  )}
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#15100E" },
  header: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: "#231816",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: { color: "white", fontSize: 16, fontWeight: "600" },
  subtitle: { color: "#FFFFFF88", fontSize: 12 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  cardAvg: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: "#231816",
    borderRadius: 16,
    alignItems: "center",
  },
  small: { color: "#FFFFFFB3", fontSize: 13 },
  avg: { color: "#FF6B6B", fontSize: 52, fontWeight: "700", marginTop: 12 },
  slash: { color: "#FFFFFF", fontSize: 20, fontWeight: "400" },
  labelPill: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: "#3A1E18",
    borderRadius: 20,
  },
  labelPillText: { color: "#FFFFFFB3", fontSize: 14, fontWeight: "500" },
  cardBreakdown: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#231816",
    borderRadius: 16,
  },
  cardTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  cardComments: {
    marginTop: 20,
    padding: 20,
    backgroundColor: "#231816",
    borderRadius: 16,
  },
  commentItem: {
    width: "100%",
    padding: 12,
    backgroundColor: "#15100E",
    borderRadius: 10,
  },
  commentAuthor: {
    color: "#FF8C60",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 4,
  },
  commentText: { color: "#FFFFFFB3", fontSize: 13, lineHeight: 20 },
});

export default AnalyticsStudentScreen;

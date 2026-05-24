import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityAverage, StudentSummary } from "../../domain/entities/teacher_analytics";
import { AnalyticsTeacherProvider, useAnalyticsTeacher } from "../context/analytics_teacher_context";

export default function AnalyticsTeacherScreen() {
  return (
    <AnalyticsTeacherProvider>
      <AnalyticsTeacherContent />
    </AnalyticsTeacherProvider>
  );
}

function AnalyticsTeacherContent() {
  const { isLoading, hasNoData, analytics, courseName, subtitle, goBack } = useAnalyticsTeacher();

  return (
    <SafeAreaView style={styles.screen}>
      <Header courseName={courseName} subtitle={subtitle} onBack={goBack} />
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#BB3322" size="large" />
        </View>
      ) : hasNoData || !analytics ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No responses yet.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {analytics.perActivity.length > 0 && (
            <>
              <SectionCard title="Average per activity">
                <BarChart entries={analytics.perActivity.map(a => ({ label: a.evaluationName, value: a.avgScore }))} color="#BB3322" />
              </SectionCard>
              <View style={styles.gap16} />
            </>
          )}
          {analytics.perStudent.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Average per student</Text>
              <View style={styles.gap12} />
              {analytics.perStudent.map(s => (
                <StudentTile key={s.email} student={s} />
              ))}
            </>
          )}
          <View style={styles.gap24} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Header({ courseName, subtitle, onBack }: { courseName: string; subtitle: string; onBack: () => void }) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
        <Ionicons name="chevron-back" color="#ffffff" size={22} />
      </TouchableOpacity>
      <View style={styles.headerGap} />
      <View>
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionCardTitle}>{title}</Text>
      <View style={styles.gap16} />
      {children}
    </View>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ entries, color }: { entries: { label: string; value: number }[]; color: string }) {
  const max = 5;
  return (
    <View style={styles.barChart}>
      {entries.map((e, i) => (
        <View key={i} style={styles.barItem}>
          <Text style={styles.barValue}>{e.value.toFixed(1)}</Text>
          <View style={styles.barTrack}>
            <View style={[styles.barFill, { height: `${(e.value / max) * 100}%`, backgroundColor: color }]} />
          </View>
          <Text style={styles.barLabel} numberOfLines={1}>{e.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Student Tile ─────────────────────────────────────────────────────────────

function StudentTile({ student }: { student: StudentSummary }) {
  const { expandedEmail, toggleStudent } = useAnalyticsTeacher();
  const isExpanded = expandedEmail === student.email;

  return (
    <View style={styles.studentTile}>
      <TouchableOpacity style={styles.studentRow} onPress={() => toggleStudent(student.email)} activeOpacity={0.8}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{student.initials}</Text>
        </View>
        <View style={styles.studentGap} />
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.displayName}</Text>
          <View style={styles.gap4} />
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(student.avgScore / 5) * 100}%` }]} />
          </View>
        </View>
        <View style={styles.studentGap} />
        <View style={styles.scoreCol}>
          <Text style={styles.scoreValue}>{student.avgScore.toFixed(1)}</Text>
          <Text style={styles.scoreMax}>/5</Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.expandedDetail}>
          <View style={styles.divider} />
          <View style={styles.gap16} />
          <ScoreBar label="Punctuality" value={student.punctuality} />
          <ScoreBar label="Contributions" value={student.contributions} />
          <ScoreBar label="Commitment" value={student.commitment} />
          <ScoreBar label="Attitude" value={student.attitude} />
          {student.comments.length > 0 && (
            <>
              <View style={styles.gap16} />
              <View style={styles.divider} />
              <View style={styles.gap12} />
              <Text style={styles.commentsLabel}>Comments</Text>
              <View style={styles.gap8} />
              {student.comments.map((c, i) => (
                <View key={i} style={styles.commentCard}>
                  <Text style={styles.commentEmail}>{c.evaluatorEmail}</Text>
                  <View style={styles.gap4} />
                  <Text style={styles.commentText}>{c.text}</Text>
                </View>
              ))}
            </>
          )}
          <View style={styles.gap16} />
        </View>
      )}
    </View>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.scoreBarRow}>
      <Text style={styles.scoreBarLabel}>{label}</Text>
      <View style={styles.scoreBarTrack}>
        <View style={[styles.scoreBarFill, { width: `${(value / 5) * 100}%` }]} />
      </View>
      <Text style={styles.scoreBarValue}>{value.toFixed(1)}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#15100E" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#ffffff88", fontFamily: "Inter", fontSize: 14 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 36, height: 36, backgroundColor: "#231816", borderRadius: 10, justifyContent: "center", alignItems: "center" },
  headerGap: { width: 12 },
  headerTitle: { color: "#ffffff", fontSize: 16, fontWeight: "bold", fontFamily: "Inter" },
  headerSubtitle: { color: "#ffffff88", fontSize: 12, fontFamily: "Inter" },
  scrollContent: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionCard: { backgroundColor: "#231816", borderRadius: 16, padding: 16 },
  sectionCardTitle: { color: "#ffffff", fontSize: 14, fontWeight: "600", fontFamily: "Inter" },
  sectionTitle: { color: "#ffffff", fontSize: 15, fontWeight: "600", fontFamily: "Inter" },
  // Bar chart
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 140, gap: 8 },
  barItem: { flex: 1, alignItems: "center", height: "100%" },
  barValue: { color: "#FF8C60", fontSize: 10, fontFamily: "Inter", marginBottom: 4 },
  barTrack: { flex: 1, width: "60%", backgroundColor: "#3A2016", borderRadius: 4, justifyContent: "flex-end" },
  barFill: { width: "100%", borderRadius: 4 },
  barLabel: { color: "#ffffff54", fontSize: 9, fontFamily: "Inter", marginTop: 4, textAlign: "center" },
  // Student tile
  studentTile: { backgroundColor: "#231816", borderRadius: 12, marginBottom: 10, overflow: "hidden" },
  studentRow: { flexDirection: "row", alignItems: "center", padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#4A4A4A", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#ffffff", fontSize: 14, fontWeight: "600", fontFamily: "Inter" },
  studentGap: { width: 12 },
  studentInfo: { flex: 1 },
  studentName: { color: "#ffffff", fontSize: 14, fontWeight: "600", fontFamily: "Inter" },
  progressTrack: { height: 6, backgroundColor: "#3A2016", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#BB3322", borderRadius: 4 },
  scoreCol: { alignItems: "flex-end" },
  scoreValue: { color: "#FF6B6B", fontSize: 18, fontWeight: "700", fontFamily: "Inter" },
  scoreMax: { color: "#ffffff54", fontSize: 11, fontFamily: "Inter" },
  expandedDetail: { paddingHorizontal: 16 },
  divider: { height: 1, backgroundColor: "#ffffff1f" },
  commentsLabel: { color: "#ffffff", fontSize: 13, fontWeight: "600", fontFamily: "Inter" },
  commentCard: { backgroundColor: "#15100E", borderRadius: 10, padding: 12, marginBottom: 8 },
  commentEmail: { color: "#FF8C60", fontSize: 11, fontWeight: "600", fontFamily: "Inter" },
  commentText: { color: "#ffffffb3", fontSize: 13, fontFamily: "Inter", lineHeight: 20 },
  // Score bar
  scoreBarRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  scoreBarLabel: { color: "#ffffff88", fontSize: 12, fontFamily: "Inter", width: 100 },
  scoreBarTrack: { flex: 1, height: 6, backgroundColor: "#3A2016", borderRadius: 4, overflow: "hidden" },
  scoreBarFill: { height: "100%", backgroundColor: "#BB3322", borderRadius: 4 },
  scoreBarValue: { color: "#FF8C60", fontSize: 12, fontFamily: "Inter", width: 32, textAlign: "right" },
  // Gaps
  gap4: { height: 4 },
  gap8: { height: 8 },
  gap12: { height: 12 },
  gap16: { height: 16 },
  gap24: { height: 24 },
});
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Evaluation, EvaluationStatus } from "../../domain/entities/evaluation";

interface EvaluationCardProps {
  evaluation: Evaluation;
  onTap: () => void;
}

export const EvaluationCard = ({ evaluation, onTap }: EvaluationCardProps) => {
  const buttonLabel =
    evaluation.status === EvaluationStatus.CLOSED ? "View results →" : "Evaluate now →";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <DarkBadge text={evaluation.courseCode} />
        <View style={styles.badgeGap} />
        <StatusBadge status={evaluation.status} />
        <View style={styles.spacer} />
        <Text style={styles.timeRemaining}>{evaluation.timeRemaining}</Text>
      </View>
      <View style={styles.titleGap} />
      <Text style={styles.title}>{evaluation.title}</Text>
      <Text style={styles.courseName}>{evaluation.courseName}</Text>
      <View style={styles.buttonGap} />
      <TouchableOpacity style={styles.button} onPress={onTap} activeOpacity={0.8}>
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const DarkBadge = ({ text }: { text: string }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

const StatusBadge = ({ status }: { status: EvaluationStatus }) => {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <View style={styles.statusBadge}>
      <Text style={styles.statusBadgeText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: "#231816",
    borderRadius: 12,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeGap: {
    width: 8,
  },
  spacer: {
    flex: 1,
  },
  titleGap: {
    height: 10,
  },
  buttonGap: {
    height: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#3A2016",
    borderRadius: 6,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#5C2A1A",
    borderRadius: 6,
  },
  statusBadgeText: {
    color: "#FF8C60",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  timeRemaining: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  title: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  courseName: {
    color: "#ffffff88",
    fontSize: 13,
    fontFamily: "Inter",
  },
  button: {
    backgroundColor: "#3A2016",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Inter",
  },
});

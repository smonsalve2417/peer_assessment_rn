import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Course } from "../../domain/entities/course";

interface CourseCardProps {
  course: Course;
  onTap: () => void;
}

export const CourseCard = ({ course, onTap }: CourseCardProps) => {
  const linkSlug = `DS-${course.period}-${course.code.toLowerCase()}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onTap} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={styles.content}>
          {/* Fila superior: code badge + active badge */}
          <View style={styles.badgeRow}>
            <CourseBadge text={course.code} />
            <View style={styles.badgeGap} />
            <ActiveBadge count={course.activeEvaluations} />
          </View>

          <View style={styles.nameGap} />

          <Text style={styles.name}>{course.name}</Text>
          <Text style={styles.period}>{course.period}</Text>

          <View style={styles.nameGap} />

          {/* Stats: students, total evaluations, link — igual que Flutter Wrap */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color="#ffffff88" />
              <View style={styles.statGap} />
              <Text style={styles.statText}>{course.studentsCount} students</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialIcons name="assignment" size={16} color="#ffffff88" />
              <View style={styles.statGap} />
              <Text style={styles.statText}>{course.totalEvaluations} evaluations</Text>
            </View>

            <View style={styles.statItem}>
              <MaterialIcons name="link" size={16} color="#ffffff88" />
              <View style={styles.statGap} />
              <Text style={styles.statText}>{linkSlug}</Text>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" color="#ffffff88" size={22} />
      </View>
    </TouchableOpacity>
  );
};

const CourseBadge = ({ text }: { text: string }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{text}</Text>
  </View>
);

const ActiveBadge = ({ count }: { count: number }) => (
  <View style={styles.badge}>
    <Text style={styles.activeBadgeText}>{count} active</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    backgroundColor: "#231816",
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#BB3322",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeGap: {
    width: 8,
  },
  nameGap: {
    height: 8,
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
  activeBadgeText: {
    color: "#FF8C60",
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  name: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  period: {
    color: "#ffffff88",
    fontSize: 13,
    fontFamily: "Inter",
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statGap: {
    width: 4,
  },
  statText: {
    color: "#ffffff88",
    fontSize: 12,
    fontFamily: "Inter",
  },
});

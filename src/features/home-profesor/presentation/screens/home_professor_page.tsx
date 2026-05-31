import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/features/auth/presentation/context/authContext";
import { Course } from "../../domain/entities/course";
import {
  HomeProfessorProvider,
  useHomeProfessor,
} from "../context/home_professor_context";
import { CourseCard } from "../components/course_card";

export default function HomeProfessorPage() {
  return (
    <HomeProfessorProvider>
      <HomeProfessorContent />
    </HomeProfessorProvider>
  );
}

function HomeProfessorContent() {
  const {
    courses,
    isLoading,
    professorName,
    professorInitials,
    coursesCount,
    studentsCount,
    activeEvaluations,
    refreshData,
    navigateToCourse,
  } = useHomeProfessor();

  return (
    <SafeAreaView style={styles.screen}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="#BB3322" size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refreshData}
              tintColor="#BB3322"
              colors={["#BB3322"]}
            />
          }
        >
          <ProfessorHeader
            professorName={professorName}
            professorInitials={professorInitials}
          />

          <View style={styles.gap8} />

          <ProfessorBadge />

          <View style={styles.gap28} />

          {/* Stats cards — Courses / Students / Active */}
          <ProfessorStats
            coursesCount={coursesCount}
            studentsCount={studentsCount}
            activeEvaluations={activeEvaluations}
          />

          <View style={styles.gap28} />

          <ProfessorCourses courses={courses} onCourseTap={navigateToCourse} />

          <View style={styles.gap24} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function ProfessorHeader({
  professorName,
  professorInitials,
}: {
  professorName: string;
  professorInitials: string;
}) {
  const { logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerTextCol}>
        <Text style={styles.helloText}>Hello,</Text>
        <Text style={styles.nameText}>{professorName}</Text>
      </View>

      <TouchableOpacity
        style={styles.avatar}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.avatarText}>{professorInitials}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                setMenuVisible(false);
                await logout();
              }}
            >
              <Ionicons name="log-out-outline" color="#CC3322" size={20} />
              <View style={styles.menuItemGap} />
              <Text style={styles.menuItemText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function ProfessorBadge() {
  return (
    <View style={styles.roleBadge}>
      <Ionicons name="school-outline" color="#ffffff70" size={14} />
      <View style={styles.roleBadgeGap} />
      <Text style={styles.roleBadgeText}>Teacher · Computer Science</Text>
    </View>
  );
}

function ProfessorStats({
  coursesCount,
  studentsCount,
  activeEvaluations,
}: {
  coursesCount: number;
  studentsCount: number;
  activeEvaluations: number;
}) {
  return (
    <View style={styles.statsRow}>
      <StatCard label="Courses" value={coursesCount} />
      <View style={styles.statsGap} />
      <StatCard label="Students" value={studentsCount} />
      <View style={styles.statsGap} />
      <StatCard label="Active" value={activeEvaluations} />
    </View>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <View style={styles.statLabelGap} />
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProfessorCourses({
  courses,
  onCourseTap,
}: {
  courses: Course[];
  onCourseTap: (course: Course) => void;
}) {
  return (
    <View>
      <View style={styles.coursesSectionHeader}>
        <Text style={styles.sectionTitle}>My Courses</Text>
        <Text style={styles.coursesCountText}>{courses.length} total</Text>
      </View>
      <View style={styles.gap14} />
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} onTap={() => onCourseTap(course)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#15100E",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTextCol: {
    flex: 1,
  },
  helloText: {
    color: "#ffffff99",
    fontSize: 16,
    fontFamily: "Inter",
  },
  nameText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#4A2B1F",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  menuOverlay: {
    flex: 1,
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 20,
  },
  menuContainer: {
    backgroundColor: "#231816",
    borderRadius: 10,
    overflow: "hidden",
    minWidth: 160,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemGap: {
    width: 10,
  },
  menuItemText: {
    color: "#ffffff",
    fontSize: 15,
    fontFamily: "Inter",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "#3A2016",
    borderRadius: 20,
  },
  roleBadgeGap: {
    width: 4,
  },
  roleBadgeText: {
    color: "#ffffff70",
    fontSize: 12,
    fontWeight: "500",
    fontFamily: "Inter",
  },
  statsRow: {
    flexDirection: "row",
  },
  statsGap: {
    width: 10,
  },
  statCard: {
    flex: 1,
    paddingVertical: 18,
    backgroundColor: "#231816",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffffff1f",
    alignItems: "center",
  },
  statValue: {
    color: "#FF8C60",
    fontSize: 26,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  statLabelGap: {
    height: 4,
  },
  statLabel: {
    color: "#ffffff88",
    fontSize: 13,
    fontFamily: "Inter",
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  coursesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coursesCountText: {
    color: "#ffffff54",
    fontSize: 13,
    fontFamily: "Inter",
  },
  gap8: { height: 8 },
  gap14: { height: 14 },
  gap24: { height: 24 },
  gap28: { height: 28 },
});

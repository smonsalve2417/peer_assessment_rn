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
import { Evaluation } from "../../domain/entities/evaluation";
import {
  HomeStudentProvider,
  useHomeStudent,
} from "../context/home_student_context";
import { CourseCard } from "../components/course_card";
import { EvaluationCard } from "../components/evaluation_card";
import { EvalFormProvider } from "@/src/features/eval-form/presentation/context/eval_form_context";

export default function HomeStudentPage() {
  return (
    <HomeStudentProvider>
      <HomeStudentContent />
    </HomeStudentProvider>
  );
}

function HomeStudentContent() {
  const {
    evaluations,
    courses,
    isLoading,
    studentName,
    studentInitials,
    refreshData,
    navigateToEvaluation,
    navigateToCourse,
  } = useHomeStudent();

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
          <StudentHeader
            studentName={studentName}
            studentInitials={studentInitials}
          />
          <View style={styles.gap8} />
          <RoleBadge />
          <View style={styles.gap28} />
          <ActiveEvaluationsSection
            evaluations={evaluations}
            onEvaluationTap={navigateToEvaluation}
          />
          <View style={styles.gap28} />
          <MyCoursesSection courses={courses} onCourseTap={navigateToCourse} />
          <View style={styles.gap24} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function StudentHeader({
  studentName,
  studentInitials,
}: {
  studentName: string;
  studentInitials: string;
}) {
  const { logout } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerTextCol}>
        <Text style={styles.helloText}>Hello,</Text>
        <Text style={styles.nameText}>{studentName}</Text>
      </View>
      <TouchableOpacity
        style={styles.avatar}
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.avatarText}>{studentInitials}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
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

function RoleBadge() {
  return (
    <View style={styles.roleBadge}>
      <Ionicons name="person-outline" color="#ffffff70" size={14} />
      <View style={styles.roleBadgeGap} />
      <Text style={styles.roleBadgeText}>Student</Text>
    </View>
  );
}

function ActiveEvaluationsSection({
  evaluations,
  onEvaluationTap,
}: {
  evaluations: Evaluation[];
  onEvaluationTap: (evaluation: Evaluation) => void;
}) {
  return (
    <View>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Active Evaluations</Text>
        <View style={styles.sectionHeaderGap} />
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{evaluations.length}</Text>
        </View>
      </View>
      <View style={styles.gap14} />
      {evaluations.map((evaluation) => (
        <EvaluationCard
          key={evaluation.id}
          evaluation={evaluation}
          onTap={() => onEvaluationTap(evaluation)}
        />
      ))}
    </View>
  );
}

function MyCoursesSection({
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
        <Text style={styles.enrolledText}>{courses.length} enrolled</Text>
      </View>
      <View style={styles.gap14} />
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onTap={() => onCourseTap(course)}
        />
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  sectionHeaderGap: {
    width: 8,
  },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#BB3322",
    justifyContent: "center",
    alignItems: "center",
  },
  countBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Inter",
  },
  coursesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  enrolledText: {
    color: "#ffffff54",
    fontSize: 13,
    fontFamily: "Inter",
  },
  gap8: { height: 8 },
  gap14: { height: 14 },
  gap24: { height: 24 },
  gap28: { height: 28 },
});

import * as Clipboard from 'expo-clipboard'; 
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import { CourseEvaluation } from '../../domain/entities/course_evaluation';
import { CourseEvaluationCard } from '../components/course_evaluation_card';
import { GroupCategorySection } from '../components/group_category_section';
import { TapCourseProvider, useTapCourse } from '../context/tap_course_context';

export default function TapCourseScreen() {
  return (
    <TapCourseProvider>
      <TapCourseContent />
    </TapCourseProvider>
  );
}

function TapCourseContent() {
  const { isLoading, snackMessage, clearSnack } = useTapCourse();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#BB3322" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeTop}>
        <CourseHeader />
      </SafeAreaView>

      <CourseInfoCard />
      <TabBar />
      <TabContent />
      <BottomAction />

      <Snackbar
        visible={snackMessage != null}
        onDismiss={clearSnack}
        duration={2500}
        style={styles.snackbar}
      >
        <Text style={styles.snackTitle}>{snackMessage?.title} </Text>
        <Text style={styles.snackBody}>{snackMessage?.body}</Text>
      </Snackbar>
    </View>
  );
}

function CourseHeader() {
  const { course, isProfessor, onViewTeacherAnalyticsTapped } = useTapCourse();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>

      <View style={styles.headerGap} />

      <View style={styles.headerTitles}>
        <Text style={styles.headerSub}>{course.code} · {course.period}</Text>
        <Text style={styles.headerTitle}>{course.name}</Text>
      </View>

      {isProfessor && (
        <TouchableOpacity onPress={onViewTeacherAnalyticsTapped} activeOpacity={0.7}>
          <Text style={styles.analyticsIcon}>◑</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function CourseInfoCard() {
  const { course, enrollmentCode, groupCategoriesCount, isProfessor } = useTapCourse();

  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoDescription}>
        Principles and practices of modern software development.
      </Text>
      <View style={styles.infoGap} />
      <EnrollmentCode code={enrollmentCode} />
      <View style={styles.infoGap} />
      <View style={styles.infoRow}>
        {isProfessor && (
          <>
            <Text style={styles.infoMeta}>👥 {course.studentsCount} Students</Text>
            <View style={styles.infoMetaGap} />
          </>
        )}
        <Text style={styles.infoMeta}>📁 {groupCategoriesCount} group categories</Text>
      </View>
    </View>
  );
}

function EnrollmentCode({ code }: { code: string }) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
  };

  return (
    <View style={styles.codeBox}>
      <Text style={styles.codeText}>{code}</Text>
      <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
        <Text style={styles.copyIcon}>⎘</Text>
      </TouchableOpacity>
    </View>
  );
}

function TabBar() {
  const { selectedTab, selectTab } = useTapCourse();

  return (
    <View style={styles.tabBarPadding}>
      <View style={styles.tabBar}>
        <TabButton label="Evaluations" selected={selectedTab === 0} onPress={() => selectTab(0)} />
        <TabButton label="Groups" selected={selectedTab === 1} onPress={() => selectTab(1)} />
      </View>
    </View>
  );
}

function TabButton({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.tabBtn, selected && styles.tabBtnSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.tabBtnText, selected && styles.tabBtnTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function TabContent() {
  const { selectedTab } = useTapCourse();
  return selectedTab === 0 ? <EvaluationsTab /> : <GroupsTab />;
}

function EvaluationsTab() {
  const { evaluations, isProfessor, isSubmitted, onEvaluateTapped, onViewResultsTapped, onViewEvaluationResultsTapped } = useTapCourse();

  if (evaluations.length === 0) {
    return <View style={styles.centered}><Text style={styles.emptyText}>No evaluations yet</Text></View>;
  }

  const renderItem = ({ item: ev }: { item: CourseEvaluation }) => {
    const submitted = isSubmitted(ev.id);
    return (
      <CourseEvaluationCard
        evaluation={ev}
        onEvaluate={(!isProfessor && !submitted && ev.status === 'active') ? () => onEvaluateTapped(ev) : undefined}
        onViewResults={!isProfessor
          ? () => onViewResultsTapped(ev)
          : () => onViewEvaluationResultsTapped(ev)}
      />
    );
  };

  return (
    <FlatList
      data={evaluations}
      keyExtractor={(ev) => ev.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listPadding}
    />
  );
}

function GroupsTab() {
  const { visibleGroupCategories } = useTapCourse();

  if (visibleGroupCategories.length === 0) {
    return <View style={styles.centered}><Text style={styles.emptyText}>No groups yet</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.listPadding}>
      {visibleGroupCategories.map((cat) => (
        <GroupCategorySection key={cat.name} category={cat} />
      ))}
    </ScrollView>
  );
}

function BottomAction() {
  const { isProfessor, selectedTab, isImporting, onCreateEvaluationTapped, onAddGroupsTapped } = useTapCourse();

  if (!isProfessor) return null;

  const isEvaluationsTab = selectedTab === 0;
  const label = isEvaluationsTab ? '+ Create evaluation' : '+ Add groups';

  return (
    <SafeAreaView style={styles.bottomSafe}>
      <View style={styles.bottomPadding}>
        <TouchableOpacity
          style={[styles.bottomBtn, isImporting && styles.bottomBtnDisabled]}
          onPress={isImporting ? undefined : (isEvaluationsTab ? onCreateEvaluationTapped : onAddGroupsTapped)}
          activeOpacity={0.8}
          disabled={isImporting}
        >
          {isImporting
            ? <ActivityIndicator color="#FF8C60" size="small" />
            : <Text style={styles.bottomBtnText}>{label}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#15100E',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeTop: {
    backgroundColor: '#15100E',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#231816',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#ffffff',
    fontSize: 26,
    lineHeight: 30,
  },
  headerGap: { width: 12 },
  headerTitles: { flex: 1 },
  headerSub: {
    color: '#ffffff88',
    fontSize: 12,
    fontFamily: 'Inter',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  analyticsIcon: {
    color: '#ffffff88',
    fontSize: 22,
  },

  // Info card
  infoCard: {
    marginHorizontal: 16,
    padding: 14,
    backgroundColor: '#231816',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffffff1f',
  },
  infoDescription: {
    color: '#ffffffb3',
    fontSize: 13,
    fontFamily: 'Inter',
  },
  infoGap: { height: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoMetaGap: { width: 16 },
  infoMeta: {
    color: '#ffffff88',
    fontSize: 12,
    fontFamily: 'Inter',
  },

  // Enrollment code
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#15100E',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffffff1f',
  },
  codeText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  copyIcon: {
    color: '#ffffff88',
    fontSize: 16,
  },

  // Tab bar
  tabBarPadding: { padding: 16 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#231816',
    borderRadius: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnSelected: {
    backgroundColor: '#3A2016',
  },
  tabBtnText: {
    color: '#ffffff88',
    fontSize: 14,
    fontFamily: 'Inter',
  },
  tabBtnTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },

  // Lists
  listPadding: { paddingHorizontal: 16 },
  emptyText: {
    color: '#ffffff88',
    fontFamily: 'Inter',
  },

  // Bottom action
  bottomSafe: { backgroundColor: '#15100E' },
  bottomPadding: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  bottomBtn: {
    backgroundColor: '#3A2016',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bottomBtnDisabled: {
    backgroundColor: '#2A1810',
  },
  bottomBtnText: {
    color: '#FF8C60',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
  },

  // Snackbar
  snackbar: { backgroundColor: '#3A2016' },
  snackTitle: { color: '#FF8C60', fontWeight: '600' },
  snackBody: { color: '#FF8C60' },
});

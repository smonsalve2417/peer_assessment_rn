import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CourseEvaluation } from '../../domain/entities/course_evaluation';

interface Props {
  evaluation: CourseEvaluation;
  onEvaluate?: () => void;
  onViewResults?: () => void;
}

export function CourseEvaluationCard({ evaluation, onEvaluate, onViewResults }: Props) {
  const showCta = onEvaluate != null || onViewResults != null;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{evaluation.name}</Text>

      <View style={styles.badgeRow}>
        <StatusBadge status={evaluation.status} />
        <View style={styles.badgeGap} />
        <VisibilityBadge visibility={evaluation.visibility} />
      </View>

      <View style={styles.deadlineRow}>
        <Text style={styles.deadlineIcon}>📅</Text>
        <Text style={styles.deadlineText}>{formatDeadline(evaluation.deadline)}</Text>
      </View>

      {showCta && (
        <>
          <View style={styles.divider} />
          <TouchableOpacity onPress={onEvaluate ?? onViewResults} activeOpacity={0.7}>
            <Text style={styles.cta}>
              {onEvaluate != null ? 'Evaluate now →' : 'View results →'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === 'active';
  return (
    <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeClosed]}>
      <Text style={[styles.badgeText, isActive ? styles.badgeTextActive : styles.badgeTextClosed]}>
        {isActive ? 'Active' : 'Closed'}
      </Text>
    </View>
  );
}

function VisibilityBadge({ visibility }: { visibility: string }) {
  return (
    <View style={[styles.badge, styles.badgeVisibility]}>
      <Text style={[styles.badgeText, styles.badgeTextVisibility]}>
        {visibility === 'public' ? 'Public' : 'Private'}
      </Text>
    </View>
  );
}

function formatDeadline(dt: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hour = dt.getHours() % 12 === 0 ? 12 : dt.getHours() % 12;
  const minute = dt.getMinutes().toString().padStart(2, '0');
  const period = dt.getHours() < 12 ? 'AM' : 'PM';
  return `${months[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()} · ${hour}:${minute} ${period}`;
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#231816',
    borderRadius: 12,
  },
  name: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeGap: {
    width: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeActive: {
    backgroundColor: '#1E3A1E',
  },
  badgeClosed: {
    backgroundColor: '#2A2A2A',
  },
  badgeVisibility: {
    backgroundColor: '#5C2A1A',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  badgeTextActive: {
    color: '#4CAF50',
  },
  badgeTextClosed: {
    color: '#ffffff88',
  },
  badgeTextVisibility: {
    color: '#FF8C60',
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineIcon: {
    fontSize: 12,
  },
  deadlineText: {
    color: '#ffffff88',
    fontSize: 12,
    fontFamily: 'Inter',
  },
  divider: {
    height: 1,
    backgroundColor: '#ffffff1f',
    marginVertical: 12,
  },
  cta: {
    color: '#FF8C60',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
});

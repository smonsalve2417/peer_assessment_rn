import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CourseGroup } from '../../domain/entities/course_group';
import { GroupCategory } from '../../domain/entities/group_category';
import { GroupMember } from '../../domain/entities/group_member';

interface Props {
  category: GroupCategory;
}

export function GroupCategorySection({ category }: Props) {
  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <View style={styles.headerGap} />
        <SourceBadge source={category.source} />
      </View>

      <View style={styles.headerBottom} />

      {category.groups.map((group) => (
        <GroupCard key={group.code} group={group} />
      ))}

      <View style={styles.sectionBottom} />
    </View>
  );
}

function SourceBadge({ source }: { source: string }) {
  return (
    <View style={styles.sourceBadge}>
      <Text style={styles.sourceBadgeText}>{source}</Text>
    </View>
  );
}

function GroupCard({ group }: { group: CourseGroup }) {
  const memberLabel = `${group.members.length} member${group.members.length === 1 ? '' : 's'}`;

  return (
    <View style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.memberCount}>{memberLabel}</Text>
      </View>

      <View style={styles.divider} />

      {group.members.map((member) => (
        <MemberTile key={member.email} member={member} />
      ))}
    </View>
  );
}

function MemberTile({ member }: { member: GroupMember }) {
  return (
    <View style={styles.memberRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{member.initials}</Text>
      </View>
      <View style={styles.memberGap} />
      <View>
        <Text style={styles.memberName}>{member.fullName}</Text>
        <Text style={styles.memberEmail}>{member.email}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerGap: {
    width: 8,
  },
  headerBottom: {
    height: 10,
  },
  sectionBottom: {
    height: 8,
  },
  categoryName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#5C2A1A',
    borderRadius: 6,
  },
  sourceBadgeText: {
    color: '#FF8C60',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  groupCard: {
    marginBottom: 10,
    backgroundColor: '#231816',
    borderRadius: 12,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  groupName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  memberCount: {
    color: '#ffffff88',
    fontSize: 12,
    fontFamily: 'Inter',
  },
  divider: {
    height: 1,
    backgroundColor: '#ffffff1f',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4A2B1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  memberGap: {
    width: 12,
  },
  memberName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  memberEmail: {
    color: '#ffffff88',
    fontSize: 12,
    fontFamily: 'Inter',
  },
});

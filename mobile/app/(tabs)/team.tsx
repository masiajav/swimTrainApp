import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function TeamScreen() {
  const teamMembers = [
    { 
      id: 1, 
      name: 'Alice Johnson', 
      role: 'Captain', 
      avatar: '👩‍🦰',
      weeklyDistance: '12.5km',
      sessionsThisWeek: 6,
      personalBest: '2:15/100m',
      status: 'Active'
    },
    { 
      id: 2, 
      name: 'Bob Smith', 
      role: 'Swimmer', 
      avatar: '👨‍🦱',
      weeklyDistance: '8.2km',
      sessionsThisWeek: 4,
      personalBest: '2:32/100m',
      status: 'Active'
    },
    { 
      id: 3, 
      name: 'Carol Davis', 
      role: 'Coach', 
      avatar: '👩‍🏫',
      weeklyDistance: '15.8km',
      sessionsThisWeek: 8,
      personalBest: '1:58/100m',
      status: 'Active'
    },
    { 
      id: 4, 
      name: 'David Wilson', 
      role: 'Swimmer', 
      avatar: '👨‍🦲',
      weeklyDistance: '6.7km',
      sessionsThisWeek: 3,
      personalBest: '2:45/100m',
      status: 'Inactive'
    },
  ];

  const teamStats = [
    { title: 'Members', value: '4', icon: '👥', color: '#3b82f6' },
    { title: 'Sessions', value: '21', icon: '🏊‍♀️', color: '#14b8a6' },
    { title: 'Distance', value: '43.2km', icon: '📏', color: '#8b5cf6' },
    { title: 'Avg Speed', value: '2.3km/h', icon: '⚡', color: '#f59e0b' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Captain': return '#ef4444';
      case 'Coach': return '#8b5cf6';
      case 'Swimmer': return '#3b82f6';
      default: return '#64748b';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Swimming Team</Text>
        <Text style={styles.headerSubtitle}>
          4 active members • 21 sessions this month
        </Text>
      </View>

      {/* Team Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Team Overview</Text>
        <View style={styles.statsGrid}>
          {teamStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <Text style={styles.statIconText}>{stat.icon}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Team Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.primaryAction}>
          <View style={styles.actionContent}>
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>+</Text>
            </View>
            <Text style={styles.actionText}>Invite Member</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryAction}>
          <View style={styles.actionContent}>
            <View style={styles.secondaryActionIcon}>
              <Text style={styles.actionIconText}>📊</Text>
            </View>
            <Text style={styles.secondaryActionText}>Team Analytics</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Team Members */}
      <View style={styles.membersContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Team Members</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Manage</Text>
          </TouchableOpacity>
        </View>
        
        {teamMembers.map((member) => (
          <TouchableOpacity key={member.id} style={styles.memberCard}>
            <View style={styles.memberLeft}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatar}>{member.avatar}</Text>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: member.status === 'Active' ? '#22c55e' : '#ef4444' }
                ]} />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <View style={styles.roleContainer}>
                  <View style={[styles.roleBadge, { backgroundColor: getRoleColor(member.role) }]}>
                    <Text style={styles.roleText}>{member.role}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.memberStats}>
              <View style={styles.memberStatItem}>
                <Text style={styles.memberStatValue}>{member.weeklyDistance}</Text>
                <Text style={styles.memberStatLabel}>This Week</Text>
              </View>
              <View style={styles.memberStatItem}>
                <Text style={styles.memberStatValue}>{member.sessionsThisWeek}</Text>
                <Text style={styles.memberStatLabel}>Sessions</Text>
              </View>
              <View style={styles.memberStatItem}>
                <Text style={styles.memberStatValue}>{member.personalBest}</Text>
                <Text style={styles.memberStatLabel}>Best Time</Text>
              </View>
            </View>

            <View style={styles.memberActions}>
              <TouchableOpacity style={styles.messageButton}>
                <Text style={styles.messageIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreIcon}>⋯</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Team Leaderboard */}
      <View style={styles.leaderboardContainer}>
        <Text style={styles.sectionTitle}>Weekly Leaderboard</Text>
        <View style={styles.leaderboard}>
          {teamMembers
            .sort((a, b) => parseFloat(b.weeklyDistance) - parseFloat(a.weeklyDistance))
            .map((member, index) => (
              <View key={member.id} style={styles.leaderboardItem}>
                <View style={styles.rankContainer}>
                  <View style={[
                    styles.rankBadge,
                    { backgroundColor: index === 0 ? '#fbbf24' : index === 1 ? '#9ca3af' : index === 2 ? '#cd7c2f' : '#e5e7eb' }
                  ]}>
                    <Text style={[
                      styles.rankText,
                      { color: index < 3 ? 'white' : '#374151' }
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                </View>
                <Text style={styles.leaderboardAvatar}>{member.avatar}</Text>
                <View style={styles.leaderboardInfo}>
                  <Text style={styles.leaderboardName}>{member.name}</Text>
                  <Text style={styles.leaderboardDistance}>{member.weeklyDistance}</Text>
                </View>
                {index === 0 && <Text style={styles.crownIcon}>👑</Text>}
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    lineHeight: 22,
  },
  statsContainer: {
    padding: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIconText: {
    fontSize: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#14b8a6',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  secondaryActionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  actionIconText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  membersContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  memberCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    fontSize: 32,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  memberStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  memberStatItem: {
    alignItems: 'center',
  },
  memberStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  memberStatLabel: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  messageButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 8,
    flex: 1,
    alignItems: 'center',
  },
  messageIcon: {
    fontSize: 16,
  },
  moreButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  moreIcon: {
    fontSize: 16,
    color: '#64748b',
  },
  leaderboardContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  leaderboard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rankContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaderboardAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  leaderboardDistance: {
    fontSize: 12,
    color: '#64748b',
  },
  crownIcon: {
    fontSize: 20,
  },
});

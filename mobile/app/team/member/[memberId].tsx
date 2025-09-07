import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiService } from '../../../services/api';
import { useTheme } from '../../../contexts/ThemeContext';

interface TeamMemberSession {
  id: string;
  title: string;
  date: string;
  distance?: number;
  duration: number;
  workoutType?: string;
  intensity?: string;
}

interface TeamMemberStats {
  totalSessions: number;
  totalDistance: number;
  totalDuration: number;
  avgDistance: number;
  weeklyDistance: number;
  weeklySessionCount: number;
  workoutTypes: { [key: string]: number };
}

interface TeamMemberProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  username: string;
  avatar?: string;
  role?: string;
  stats: TeamMemberStats;
  recentSessions: TeamMemberSession[];
}

export default function TeamMemberProfileScreen() {
  const { isDarkMode, colors } = useTheme();
  const params = useLocalSearchParams();
  const memberId = params.memberId as string;
  
  const [profile, setProfile] = useState<TeamMemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (memberId) {
      loadMemberProfile();
    }
  }, [memberId]);

  const loadMemberProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTeamMemberProfile(memberId);
      if (response.profile) {
        setProfile(response.profile);
      }
    } catch (error) {
      console.error('Error loading member profile:', error);
      Alert.alert('Error', 'Failed to load team member profile');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}h`;
      }
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getWorkoutTypeColor = (type?: string) => {
    if (!type) return '#6b7280';
    switch (type.toUpperCase()) {
      case 'SPRINT': return '#ef4444';
      case 'ENDURANCE': return '#22c55e';
      case 'TECHNIQUE': return '#3b82f6';
      case 'WARMUP': return '#f59e0b';
      case 'COOLDOWN': return '#8b5cf6';
      case 'MAIN_SET': return '#10b981';
      default: return '#6b7280';
    }
  };

  const renderMemberAvatar = () => {
    if (profile?.avatar && profile.avatar.startsWith('http')) {
      return (
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: profile.avatar }}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>
      );
    }
    return <Text style={styles.avatarEmoji}>{profile?.avatar || '👤'}</Text>;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading member profile...
          </Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Failed to load member profile
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Member</Text>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <View style={styles.avatarContainer}>
          {renderMemberAvatar()}
        </View>
        <Text style={[styles.memberName, { color: colors.text }]}>
          {profile.firstName} {profile.lastName}
        </Text>
        <Text style={[styles.memberUsername, { color: colors.textSecondary }]}>
          @{profile.username}
        </Text>
        <View style={[styles.roleTag, { backgroundColor: colors.primary }]}>
          <Text style={styles.roleText}>{profile.role}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Training Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🏊</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatDistance(profile.stats.totalDistance)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Distance</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {profile.stats.totalSessions}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatDuration(profile.stats.totalDuration)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Time</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>📈</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatDistance(profile.stats.avgDistance)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Distance</Text>
          </View>
        </View>
      </View>

      {/* Weekly Performance */}
      <View style={[styles.weeklyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>This Week</Text>
        <View style={styles.weeklyStats}>
          <View style={styles.weeklyItem}>
            <Text style={[styles.weeklyLabel, { color: colors.textSecondary }]}>Sessions</Text>
            <Text style={[styles.weeklyValue, { color: colors.text }]}>
              {profile.stats.weeklySessionCount}
            </Text>
          </View>
          <View style={styles.weeklyItem}>
            <Text style={[styles.weeklyLabel, { color: colors.textSecondary }]}>Distance</Text>
            <Text style={[styles.weeklyValue, { color: colors.text }]}>
              {formatDistance(profile.stats.weeklyDistance)}
            </Text>
          </View>
        </View>
      </View>

      {/* Recent Sessions */}
      <View style={[styles.sessionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sessions</Text>
        {profile.recentSessions.length === 0 ? (
          <Text style={[styles.noSessionsText, { color: colors.textSecondary }]}>
            No recent sessions
          </Text>
        ) : (
          profile.recentSessions.map((session) => (
            <TouchableOpacity 
              key={session.id} 
              style={[styles.sessionItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push(`/session/${session.id}`)}
            >
              <View style={styles.sessionLeft}>
                <Text style={[styles.sessionTitle, { color: colors.text }]}>
                  {session.title}
                </Text>
                <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>
                  {formatDate(session.date)}
                </Text>
              </View>
              <View style={styles.sessionRight}>
                <Text style={[styles.sessionDistance, { color: colors.text }]}>
                  {session.distance ? formatDistance(session.distance) : '—'}
                </Text>
                <Text style={[styles.sessionDuration, { color: colors.textSecondary }]}>
                  {formatDuration(session.duration)}
                </Text>
                {session.workoutType && (
                  <View style={[styles.workoutTypeBadge, { backgroundColor: getWorkoutTypeColor(session.workoutType) }]}>
                    <Text style={styles.workoutTypeText}>
                      {session.workoutType.replace('_', ' ')}
                    </Text>
                  </View>
                )}
                <Text style={[styles.arrowText, { color: colors.textSecondary }]}>→</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileCard: {
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarEmoji: {
    fontSize: 64,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  memberName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memberUsername: {
    fontSize: 16,
    marginBottom: 12,
  },
  roleTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  statsContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  weeklyCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  weeklyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  weeklyItem: {
    alignItems: 'center',
  },
  weeklyLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  weeklyValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sessionsCard: {
    margin: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
  },
  noSessionsText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 20,
  },
  sessionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  sessionLeft: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  sessionDistance: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  sessionDuration: {
    fontSize: 14,
    marginBottom: 4,
  },
  workoutTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  workoutTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  arrowText: {
    fontSize: 16,
    marginLeft: 8,
  },
});

import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';

interface Session {
  id: string;
  title: string;
  date: string;
  distance?: number;
  duration: number;
  workoutType?: string;
  stroke?: string;
  intensity?: string;
}

export default function DashboardScreen() {
  const { isDarkMode, colors } = useTheme();
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSessions();
      if (response.data) {
        const sessions = response.data as Session[];
        // Store all sessions for calculations
        setAllSessions(sessions);
        
        // Get the 3 most recent sessions
        const recent = sessions
          .sort((a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        setRecentSessions(recent);
      } else {
        setRecentSessions([]);
        setAllSessions([]);
      }
    } catch (error) {
      console.error('Failed to load recent sessions:', error);
      setRecentSessions([]);
      setAllSessions([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload sessions when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Check if user is authenticated
      const token = apiService.getStoredAuthToken();
      if (!token) {
        // Redirect to login if no auth token
        router.replace('/auth/login');
        return;
      }
      
      loadRecentSessions();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const calculateWeeklyStats = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekSessions = allSessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= oneWeekAgo && sessionDate <= now;
    });

    const totalDistance = weekSessions.reduce((sum, session) => sum + (session.distance || 0), 0);
    const totalDuration = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    
    // Calculate estimated calories (rough estimate: ~10 calories per minute of swimming)
    const estimatedCalories = Math.round(totalDuration * 10);
    
    return {
      distance: formatDistance(totalDistance),
      sessions: weekSessions.length.toString(),
      time: formatTime(totalDuration),
      calories: estimatedCalories.toString(),
    };
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  };

  const formatTime = (minutes: number) => {
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

  const getWeeklyStats = () => {
    const stats = calculateWeeklyStats();
    return [
      { title: 'Distance', value: stats.distance, icon: '🏊‍♀️', color: '#3b82f6' },
      { title: 'Sessions', value: stats.sessions, icon: '📊', color: '#14b8a6' },
      { title: 'Time', value: stats.time, icon: '⏱️', color: '#8b5cf6' },
      { title: 'Calories', value: stats.calories, icon: '🔥', color: '#f59e0b' },
    ];
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

  const getIntensityColor = (intensity?: string) => {
    if (!intensity) return '#6b7280';
    switch (intensity.toUpperCase()) {
      case 'HARD': 
      case 'RACE_PACE': return '#ef4444';
      case 'MODERATE': return '#f59e0b';
      case 'EASY': return '#22c55e';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Gradient */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back, Swimmer! 🏊‍♀️</Text>
          <Text style={styles.headerSubtext}>
            Track your progress and stay motivated with your team
          </Text>
        </View>
        
        {/* Floating elements */}
        <View style={[styles.floatingElement, { top: 20, right: 30, width: 40, height: 40 }]} />
        <View style={[styles.floatingElement, { top: 60, left: 20, width: 30, height: 30 }]} />
      </View>

      <View style={styles.content}>
        {/* Quick Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Weekly Overview</Text>
          <View style={styles.statsGrid}>
            {getWeeklyStats().map((stat, index) => (
              <View key={index} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                  <Text style={styles.statIconText}>{stat.icon}</Text>
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{stat.title}</Text>
              </View>
            ))}
          </View>
          {allSessions.length === 0 && (
            <View style={styles.noDataMessage}>
              <Text style={[styles.noDataText, { color: colors.textSecondary }]}>Start swimming to see your weekly stats! 💪</Text>
            </View>
          )}
        </View>

        {/* Recent Sessions */}
        <View style={styles.sessionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Sessions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/sessions')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading sessions...</Text>
            </View>
          ) : recentSessions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>No sessions yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Create your first session to get started!</Text>
              <TouchableOpacity 
                style={[styles.createButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/session/create')}
              >
                <Text style={styles.createButtonText}>Create Session</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentSessions.map((session) => (
              <TouchableOpacity 
                key={session.id} 
                style={[styles.sessionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => router.push(`/session/${session.id}`)}
              >
                <View style={styles.sessionLeft}>
                  <View style={[styles.sessionIcon, { backgroundColor: getWorkoutTypeColor(session.workoutType) }]}>
                    <Text style={styles.sessionIconText}>🏊‍♀️</Text>
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={[styles.sessionTitle, { color: colors.text }]}>{session.title}</Text>
                    <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>{formatDate(session.date)}</Text>
                    {session.workoutType && (
                      <Text style={[styles.sessionType, { color: colors.textSecondary }]}>{session.workoutType.replace('_', ' ')}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.sessionRight}>
                  <View style={[styles.distanceBadge, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <Text style={[styles.distanceText, { color: colors.text }]}>
                      {session.distance ? `${session.distance}m` : '—'}
                    </Text>
                  </View>
                  <Text style={[styles.timeText, { color: colors.textSecondary }]}>{formatDuration(session.duration)}</Text>
                  {session.intensity && (
                    <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor(session.intensity) }]}>
                      <Text style={styles.intensityText}>{session.intensity}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity 
            style={styles.primaryAction}
            onPress={() => router.push('/session/create')}
          >
            <View style={styles.actionContent}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>+</Text>
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionTitle}>Start New Session</Text>
                <Text style={styles.actionSubtitle}>Begin tracking your swim</Text>
              </View>
              <Text style={styles.actionArrow}>→</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryAction}>
            <View style={styles.actionContent}>
              <View style={styles.secondaryActionIcon}>
                <Text style={styles.actionIconText}>👥</Text>
              </View>
              <View style={styles.actionTextContainer}>
                <Text style={styles.secondaryActionTitle}>View Team Progress</Text>
                <Text style={styles.secondaryActionSubtitle}>Check team leaderboard</Text>
              </View>
              <Text style={styles.secondaryActionArrow}>→</Text>
            </View>
          </TouchableOpacity>
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
    paddingBottom: 40,
    paddingHorizontal: 24,
    position: 'relative',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    zIndex: 1,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtext: {
    fontSize: 16,
    color: '#bfdbfe',
    lineHeight: 22,
  },
  floatingElement: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  content: {
    padding: 24,
  },
  statsContainer: {
    marginBottom: 32,
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
    padding: 20,
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  sessionsContainer: {
    marginBottom: 32,
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
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionIconText: {
    fontSize: 18,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  sessionDate: {
    fontSize: 14,
    color: '#64748b',
  },
  sessionRight: {
    alignItems: 'flex-end',
  },
  distanceBadge: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  distanceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: '#64748b',
  },
  actionsContainer: {
    marginBottom: 32,
  },
  primaryAction: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  secondaryActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  secondaryActionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  actionArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryActionArrow: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sessionType: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  intensityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  intensityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  noDataMessage: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  noDataText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

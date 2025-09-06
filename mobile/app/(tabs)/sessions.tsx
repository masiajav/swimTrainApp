import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
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
  description?: string;
}

export default function SessionsScreen() {
  const { isDarkMode, colors } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSessions();
      if (response.data) {
        setSessions(response.data as Session[]);
      } else {
        setSessions([]);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const calculateWeeklySummary = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= oneWeekAgo && sessionDate <= now;
    });

    const totalDistance = weekSessions.reduce((sum, session) => sum + (session.distance || 0), 0);
    const totalDuration = weekSessions.reduce((sum, session) => sum + session.duration, 0);
    
    return {
      sessionCount: weekSessions.length,
      totalDistance: totalDistance,
      totalDuration: totalDuration,
    };
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

  const calculateMonthlySummary = () => {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    
    const monthSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= oneMonthAgo && sessionDate <= now;
    });

    const totalDistance = monthSessions.reduce((sum, session) => sum + (session.distance || 0), 0);
    const totalDuration = monthSessions.reduce((sum, session) => sum + session.duration, 0);
    const avgDistance = monthSessions.length > 0 ? totalDistance / monthSessions.length : 0;
    
    return {
      sessionCount: monthSessions.length,
      totalDistance,
      totalDuration,
      avgDistance,
    };
  };

  const getWorkoutTypeStats = () => {
    const typeCount: { [key: string]: number } = {};
    sessions.forEach(session => {
      if (session.workoutType) {
        typeCount[session.workoutType] = (typeCount[session.workoutType] || 0) + 1;
      }
    });
    
    const sortedTypes = Object.entries(typeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return sortedTypes;
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
      
      loadSessions();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type?: string) => {
    if (!type) return '#6b7280';
    switch (type.toUpperCase()) {
      case 'SPRINT': return '#ef4444';
      case 'ENDURANCE': return '#22c55e';
      case 'TECHNIQUE': return '#3b82f6';
      case 'WARMUP': return '#f59e0b';
      case 'COOLDOWN': return '#8b5cf6';
      case 'MAIN_SET': return '#10b981';
      case 'KICK': return '#f97316';
      case 'PULL': return '#06b6d4';
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading sessions...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadSessions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>Swimming Sessions</Text>
        <Text style={styles.headerSubtitle}>Track and review your training progress</Text>
      </View>

      {/* Filter/Add Section */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/session/create')}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>New Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={[styles.filterText, { color: colors.text }]}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      <View style={styles.sessionsContainer}>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.text }]}>No sessions yet</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>Create your first swimming session to get started!</Text>
            <TouchableOpacity 
              style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/session/create')}
            >
              <Text style={styles.emptyStateButtonText}>Create Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sessions.map((session) => (
            <TouchableOpacity 
              key={session.id} 
              style={[styles.sessionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => router.push(`/session/${session.id}`)}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionTitleRow}>
                  <Text style={[styles.sessionTitle, { color: colors.text }]}>{session.title}</Text>
                  {session.workoutType && (
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(session.workoutType) }]}>
                      <Text style={styles.typeBadgeText}>{session.workoutType.replace('_', ' ')}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.sessionDate, { color: colors.textSecondary }]}>{formatDate(session.date)}</Text>
              </View>

              <View style={styles.sessionStats}>
                {session.distance && (
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>🏊‍♀️</Text>
                    <View style={styles.statContent}>
                      <Text style={styles.statValue}>{session.distance}m</Text>
                      <Text style={styles.statLabel}>Distance</Text>
                    </View>
                  </View>
                )}

                <View style={styles.statItem}>
                  <Text style={styles.statIcon}>⏱️</Text>
                  <View style={styles.statContent}>
                    <Text style={styles.statValue}>{session.duration}min</Text>
                    <Text style={styles.statLabel}>Duration</Text>
                  </View>
                </View>

                {session.intensity && (
                  <View style={styles.statItem}>
                    <Text style={styles.statIcon}>💪</Text>
                    <View style={styles.statContent}>
                      <View style={[styles.intensityDot, { backgroundColor: getIntensityColor(session.intensity) }]} />
                      <Text style={styles.statLabel}>{session.intensity.replace('_', ' ')}</Text>
                    </View>
                  </View>
                )}
              </View>

              {session.stroke && (
                <View style={styles.strokesContainer}>
                  <Text style={styles.strokesLabel}>Primary Stroke:</Text>
                  <View style={styles.strokesList}>
                    <View style={styles.strokeBadge}>
                      <Text style={styles.strokeText}>{session.stroke}</Text>
                    </View>
                  </View>
                </View>
              )}

              {session.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionText} numberOfLines={2}>
                    {session.description}
                  </Text>
                </View>
              )}

              <View style={styles.sessionFooter}>
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => router.push(`/session/${session.id}`)}
                >
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => router.push(`/session/edit/${session.id}`)}
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Weekly Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📊 This Week Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{calculateWeeklySummary().sessionCount}</Text>
            <Text style={styles.summaryLabel}>Sessions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDistance(calculateWeeklySummary().totalDistance)}</Text>
            <Text style={styles.summaryLabel}>Total Distance</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDuration(calculateWeeklySummary().totalDuration)}</Text>
            <Text style={styles.summaryLabel}>Total Time</Text>
          </View>
        </View>
        {calculateWeeklySummary().sessionCount === 0 && (
          <View style={styles.emptyWeekMessage}>
            <Text style={styles.emptyWeekText}>No sessions this week yet. Start training! 💪</Text>
          </View>
        )}
      </View>

      {/* Monthly Stats */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>📈 Monthly Overview</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{calculateMonthlySummary().sessionCount}</Text>
            <Text style={styles.summaryLabel}>Sessions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDistance(calculateMonthlySummary().totalDistance)}</Text>
            <Text style={styles.summaryLabel}>Total Distance</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDistance(Math.round(calculateMonthlySummary().avgDistance))}</Text>
            <Text style={styles.summaryLabel}>Avg Distance</Text>
          </View>
        </View>

        {/* Top Workout Types */}
        {getWorkoutTypeStats().length > 0 && (
          <View style={styles.workoutTypesSection}>
            <Text style={styles.workoutTypesTitle}>🏊 Most Common Workouts:</Text>
            <View style={styles.workoutTypesList}>
              {getWorkoutTypeStats().map(([type, count]) => (
                <View key={type} style={styles.workoutTypeItem}>
                  <View style={[styles.workoutTypeBadge, { backgroundColor: getTypeColor(type) }]}>
                    <Text style={styles.workoutTypeBadgeText}>{type.replace('_', ' ')}</Text>
                  </View>
                  <Text style={styles.workoutTypeCount}>{count}x</Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
  actionSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    gap: 12,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#14b8a6',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  filterButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  sessionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sessionHeader: {
    marginBottom: 16,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  typeBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionDate: {
    fontSize: 14,
    color: '#64748b',
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  strokesContainer: {
    marginBottom: 16,
  },
  strokesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  strokesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  strokeBadge: {
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  strokeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  sessionFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 24,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyWeekMessage: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  emptyWeekText: {
    fontSize: 14,
    color: '#1e40af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  workoutTypesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  workoutTypesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  workoutTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workoutTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  workoutTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
  },
  workoutTypeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  workoutTypeCount: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  descriptionText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
});

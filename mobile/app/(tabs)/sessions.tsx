import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { apiService } from '../../services/api';

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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading sessions...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSessions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Swimming Sessions</Text>
        <Text style={styles.headerSubtitle}>Track and review your training progress</Text>
      </View>

      {/* Filter/Add Section */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/session/create')}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>New Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterIcon}>⚙️</Text>
          <Text style={styles.filterText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      <View style={styles.sessionsContainer}>
        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sessions yet</Text>
            <Text style={styles.emptyStateSubtext}>Create your first swimming session to get started!</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={() => router.push('/session/create')}
            >
              <Text style={styles.emptyStateButtonText}>Create Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sessions.map((session) => (
            <TouchableOpacity key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <View style={styles.sessionTitleRow}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  {session.workoutType && (
                    <View style={[styles.typeBadge, { backgroundColor: getTypeColor(session.workoutType) }]}>
                      <Text style={styles.typeBadgeText}>{session.workoutType.replace('_', ' ')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
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
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editButton}>
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Weekly Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>This Week Summary</Text>
        <View style={styles.summaryStats}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>4</Text>
            <Text style={styles.summaryLabel}>Sessions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>7.7km</Text>
            <Text style={styles.summaryLabel}>Total Distance</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>3h</Text>
            <Text style={styles.summaryLabel}>Total Time</Text>
          </View>
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

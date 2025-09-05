import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

interface Session {
  id: string;
  title: string;
  date: string;
  distance?: number;
  duration: number;
}

export default function DashboardScreen() {
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentSessions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSessions();
      if (response.data) {
        // Get the 3 most recent sessions
        const sessions = response.data as Session[];
        const recent = sessions
          .sort((a: Session, b: Session) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);
        setRecentSessions(recent);
      } else {
        setRecentSessions([]);
      }
    } catch (error) {
      console.error('Failed to load recent sessions:', error);
      setRecentSessions([]);
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

  const weeklyStats = [
    { title: 'Distance', value: '8.5km', icon: '🏊‍♀️', color: '#3b82f6' },
    { title: 'Sessions', value: '5', icon: '📊', color: '#14b8a6' },
    { title: 'Time', value: '3.2h', icon: '⏱️', color: '#8b5cf6' },
    { title: 'Calories', value: '850', icon: '🔥', color: '#f59e0b' },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header with Gradient */}
      <View style={styles.header}>
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
          <Text style={styles.sectionTitle}>Weekly Overview</Text>
          <View style={styles.statsGrid}>
            {weeklyStats.map((stat, index) => (
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

        {/* Recent Sessions */}
        <View style={styles.sessionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Sessions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentSessions.map((session) => (
            <TouchableOpacity key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionLeft}>
                <View style={styles.sessionIcon}>
                  <Text style={styles.sessionIconText}>🏊‍♀️</Text>
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <Text style={styles.sessionDate}>{session.date}</Text>
                </View>
              </View>
              <View style={styles.sessionRight}>
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>
                    {session.distance ? `${session.distance}m` : 'N/A'}
                  </Text>
                </View>
                <Text style={styles.timeText}>{formatDuration(session.duration)}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
});

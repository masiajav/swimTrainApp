import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Image, Platform } from 'react-native';
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

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
}

export default function ProfileScreen() {
  const { isDarkMode, colors } = useTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load sessions
      const sessionsResponse = await apiService.getSessions();
      if (sessionsResponse.data) {
        setSessions(sessionsResponse.data as Session[]);
      } else {
        setSessions([]);
      }

      // Load user profile
      const profileResponse = await apiService.getProfile();
      if ((profileResponse as any).user) {
        setProfile((profileResponse as any).user);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
      setSessions([]);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Reload data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const token = apiService.getStoredAuthToken();
      if (!token) {
        router.replace('/auth/login');
        return;
      }
      
      loadProfileData();
    }, [])
  );

  const renderUserAvatar = () => {
    if (profile?.avatar && profile.avatar.startsWith('http')) {
      return (
        <Image
          source={{ uri: profile.avatar }}
          style={styles.userAvatarImage}
          resizeMode="cover"
        />
      );
    } else if (profile?.avatar) {
      return <Text style={styles.avatarEmoji}>{profile.avatar}</Text>;
    } else {
      return <Text style={styles.avatarEmoji}>🏊‍♂️</Text>;
    }
  };

  const calculateStats = () => {
    const totalDistance = sessions.reduce((sum, session) => sum + (session.distance || 0), 0);
    const totalDuration = sessions.reduce((sum, session) => sum + session.duration, 0);
    const sessionCount = sessions.length;
    
    // Calculate average distance
    const avgDistance = sessionCount > 0 ? totalDistance / sessionCount : 0;
    
    // Find best workout types
    const workoutCounts: { [key: string]: number } = {};
    sessions.forEach(session => {
      if (session.workoutType) {
        workoutCounts[session.workoutType] = (workoutCounts[session.workoutType] || 0) + 1;
      }
    });
    
    const favoriteWorkout = Object.entries(workoutCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';
    
    return {
      totalDistance,
      sessionCount,
      totalDuration,
      avgDistance,
      favoriteWorkout,
    };
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return (meters / 1000).toFixed(1);
    }
    return Math.round(meters).toString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      return `${(minutes / 60).toFixed(1)}h`;
    }
    return `${minutes}m`;
  };

  const generateAchievements = () => {
    const stats = calculateStats();
    const achievements = [];

    if (stats.sessionCount >= 10) {
      achievements.push({
        emoji: '🥇',
        title: 'Session Master',
        description: `Completed ${stats.sessionCount} sessions`,
        date: 'Recently earned'
      });
    }

    if (stats.totalDistance >= 10000) {
      achievements.push({
        emoji: '🏊',
        title: 'Distance Champion',
        description: `Swam ${formatDistance(stats.totalDistance)}km total`,
        date: 'Recently earned'
      });
    }

    if (stats.totalDuration >= 300) {
      achievements.push({
        emoji: '⏱️',
        title: 'Time Champion',
        description: `${formatDuration(stats.totalDuration)} total time`,
        date: 'Recently earned'
      });
    }

    // Add default achievements if none earned yet
    if (achievements.length === 0) {
      achievements.push({
        emoji: '🎯',
        title: 'Getting Started',
        description: 'Create your first session to earn achievements!',
        date: 'Waiting to unlock'
      });
    }

    return achievements.slice(0, 3); // Show max 3 achievements
  };

  const handleLogout = async () => {
    console.log('Logout button clicked!');
    
    // For web platform, use window.confirm instead of Alert
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
        console.log('Logout confirmed, calling logout and redirecting...');
        // Ensure logout sets did-logout flag and clears stored tokens
        await apiService.logout();
        console.log('Logout complete, redirecting to login...');
        router.replace('/auth/login');
      } else {
        console.log('Logout cancelled');
      }
    } else {
      // For native platforms, use Alert
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('Logout cancelled'),
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              console.log('Logout confirmed, calling logout and redirecting...');
              await apiService.logout();
              console.log('Logout complete, redirecting to login...');
              router.replace('/auth/login');
            },
          },
        ]
      );
    }
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Gradient */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? colors.card : colors.primary }]}>
        <Text style={[styles.headerText, { color: 'white' }]}>Profile</Text>
      </View>

      <ScrollView style={[styles.content, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => router.push('/settings')}
          >
            {renderUserAvatar()}
          </TouchableOpacity>
          <Text style={[styles.userName, { color: colors.text }]}>
            {profile ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Swimming Enthusiast' : 'Loading...'}
          </Text>
          <Text style={[styles.userHandle, { color: colors.textSecondary }]}>
            @{profile?.username || 'username'}
          </Text>
          <Text style={[styles.userRole, { color: colors.textSecondary }]}>
            {profile?.role || 'Swimming Team Member'}
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🏊</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {loading ? '...' : formatDistance(calculateStats().totalDistance)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {calculateStats().totalDistance >= 1000 ? 'Total km' : 'Total m'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {loading ? '...' : calculateStats().sessionCount}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {loading ? '...' : formatDuration(calculateStats().totalDuration)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Time</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {loading ? '...' : Math.round(calculateStats().avgDistance)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Avg Distance</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🏆 Recent Achievements</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading achievements...</Text>
            </View>
          ) : (
            <View style={styles.achievementsList}>
              {generateAchievements().map((achievement, index) => (
                <View key={index} style={[styles.achievementItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={styles.achievementEmoji}>{achievement.emoji}</Text>
                  <View style={styles.achievementContent}>
                    <Text style={[styles.achievementTitle, { color: colors.text }]}>{achievement.title}</Text>
                    <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>{achievement.description}</Text>
                  </View>
                  <Text style={[styles.achievementDate, { color: colors.textSecondary }]}>{achievement.date}</Text>
                </View>
              ))}
              {generateAchievements().length === 0 && (
                <View style={styles.achievementItem}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Complete your first session to earn achievements!</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⚙️ Settings</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity 
              style={[styles.settingItem, { borderBottomColor: colors.border }]}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.settingEmoji}>👤</Text>
              <Text style={[styles.settingText, { color: colors.text }]}>Edit Profile</Text>
              <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <Text style={styles.settingEmoji}>🔔</Text>
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
              <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <Text style={styles.settingEmoji}>🔒</Text>
              <Text style={[styles.settingText, { color: colors.text }]}>Privacy Settings</Text>
              <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
              <Text style={styles.settingEmoji}>📊</Text>
              <Text style={[styles.settingText, { color: colors.text }]}>Analytics</Text>
              <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingItem, styles.lastSettingItem]}>
              <Text style={styles.settingEmoji}>❓</Text>
              <Text style={[styles.settingText, { color: colors.text }]}>Help & Support</Text>
              <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleLogout}>
          <Text style={[styles.logoutText, { color: '#FF4444' }]}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -10,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 64,
  },
  userAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: -8,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  editIcon: {
    fontSize: 12,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: -8,
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#64748b',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  achievementEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  achievementDate: {
    fontSize: 12,
    color: '#94a3b8',
  },
  settingsList: {
    gap: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  lastSettingItem: {
    borderBottomWidth: 0,
  },
  settingEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  settingArrow: {
    fontSize: 20,
    color: '#94a3b8',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});

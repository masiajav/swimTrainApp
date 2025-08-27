import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Profile</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>🏊‍♂️</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Pro</Text>
            </View>
          </View>
          <Text style={styles.userName}>John Swimmer</Text>
          <Text style={styles.userHandle}>@johnswimmer</Text>
          <Text style={styles.userRole}>Swimming Team Member</Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏊</Text>
            <Text style={styles.statValue}>45.2</Text>
            <Text style={styles.statLabel}>Total km</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📊</Text>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⏱️</Text>
            <Text style={styles.statValue}>24.5s</Text>
            <Text style={styles.statLabel}>Best 50m</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Achievements</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>🏆 Recent Achievements</Text>
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementEmoji}>🥇</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Distance Master</Text>
                <Text style={styles.achievementDescription}>Completed 40km total distance</Text>
              </View>
              <Text style={styles.achievementDate}>2 days ago</Text>
            </View>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementEmoji}>⚡</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Speed Demon</Text>
                <Text style={styles.achievementDescription}>New personal best in 50m freestyle</Text>
              </View>
              <Text style={styles.achievementDate}>1 week ago</Text>
            </View>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementEmoji}>🔥</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Streak Champion</Text>
                <Text style={styles.achievementDescription}>7 consecutive training days</Text>
              </View>
              <Text style={styles.achievementDate}>2 weeks ago</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingEmoji}>👤</Text>
              <Text style={styles.settingText}>Edit Profile</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingEmoji}>🔔</Text>
              <Text style={styles.settingText}>Notifications</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingEmoji}>🔒</Text>
              <Text style={styles.settingText}>Privacy Settings</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingEmoji}>📊</Text>
              <Text style={styles.settingText}>Analytics</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingItem, styles.lastSettingItem]}>
              <Text style={styles.settingEmoji}>❓</Text>
              <Text style={styles.settingText}>Help & Support</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
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
  },
  avatarEmoji: {
    fontSize: 64,
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
});

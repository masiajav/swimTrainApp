import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

export default function SessionsScreen() {
  const sessions = [
    { 
      id: 1, 
      title: 'Morning Practice', 
      date: '2025-08-26', 
      distance: 2000,
      duration: 45,
      type: 'Training',
      strokes: ['Freestyle', 'Backstroke'],
      intensity: 'Medium'
    },
    { 
      id: 2, 
      title: 'Sprint Training', 
      date: '2025-08-25', 
      distance: 1500,
      duration: 35,
      type: 'Sprint',
      strokes: ['Freestyle'],
      intensity: 'High'
    },
    { 
      id: 3, 
      title: 'Endurance Set', 
      date: '2025-08-24', 
      distance: 3000,
      duration: 60,
      type: 'Endurance',
      strokes: ['Freestyle', 'Breaststroke'],
      intensity: 'Low'
    },
    { 
      id: 4, 
      title: 'Technique Focus', 
      date: '2025-08-23', 
      distance: 1200,
      duration: 40,
      type: 'Technique',
      strokes: ['Butterfly'],
      intensity: 'Medium'
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Sprint': return '#ef4444';
      case 'Endurance': return '#22c55e';
      case 'Training': return '#3b82f6';
      case 'Technique': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#22c55e';
      default: return '#64748b';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Swimming Sessions</Text>
        <Text style={styles.headerSubtitle}>Track and review your training progress</Text>
      </View>

      {/* Filter/Add Section */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.addButton}>
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
        {sessions.map((session) => (
          <TouchableOpacity key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionTitleRow}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <View style={[styles.typeBadge, { backgroundColor: getTypeColor(session.type) }]}>
                  <Text style={styles.typeBadgeText}>{session.type}</Text>
                </View>
              </View>
              <Text style={styles.sessionDate}>{session.date}</Text>
            </View>

            <View style={styles.sessionStats}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🏊‍♀️</Text>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{session.distance}m</Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⏱️</Text>
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{session.duration}min</Text>
                  <Text style={styles.statLabel}>Duration</Text>
                </View>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statIcon}>💪</Text>
                <View style={styles.statContent}>
                  <View style={[styles.intensityDot, { backgroundColor: getIntensityColor(session.intensity) }]} />
                  <Text style={styles.statLabel}>{session.intensity}</Text>
                </View>
              </View>
            </View>

            <View style={styles.strokesContainer}>
              <Text style={styles.strokesLabel}>Strokes:</Text>
              <View style={styles.strokesList}>
                {session.strokes.map((stroke, index) => (
                  <View key={index} style={styles.strokeBadge}>
                    <Text style={styles.strokeText}>{stroke}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.sessionFooter}>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
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
});

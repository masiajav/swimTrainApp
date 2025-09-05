import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
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
  createdAt: string;
  updatedAt: string;
}

export default function SessionDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadSession();
    }
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getSession(id!);
      if (response.data) {
        setSession(response.data as Session);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
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

  const handleEdit = () => {
    router.push(`/session/edit/${id}`);
  };

  const handleDelete = async () => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm('Are you sure you want to delete this session? This action cannot be undone.');
      if (confirmed) {
        try {
          await apiService.deleteSession(id!);
          console.log('Session deleted successfully');
          // Navigate back after deletion
          router.replace('/sessions');
        } catch (error) {
          console.error('Failed to delete session:', error);
          if (typeof window !== 'undefined') {
            window.alert('Failed to delete session. Please try again.');
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </View>
    );
  }

  if (error || !session) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Session not found'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButtonHeader} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{session.title}</Text>
          <Text style={styles.headerDate}>{formatDate(session.date)}</Text>
        </View>
        <TouchableOpacity style={styles.editButtonHeader} onPress={handleEdit}>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* Main Details Card */}
      <View style={styles.detailsCard}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🏊‍♀️</Text>
            <Text style={styles.statValue}>{session.distance || 0}m</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValue}>{session.duration}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
          
          {session.workoutType && (
            <View style={styles.statCard}>
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(session.workoutType) }]}>
                <Text style={styles.typeBadgeText}>{session.workoutType.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.statLabel}>Workout Type</Text>
            </View>
          )}
          
          {session.intensity && (
            <View style={styles.statCard}>
              <View style={[styles.intensityBadge, { backgroundColor: getIntensityColor(session.intensity) }]}>
                <Text style={styles.intensityText}>{session.intensity.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.statLabel}>Intensity</Text>
            </View>
          )}
        </View>
      </View>

      {/* Stroke Information */}
      {session.stroke && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏊 Swimming Stroke</Text>
          <View style={styles.strokeContainer}>
            <View style={styles.strokeBadge}>
              <Text style={styles.strokeText}>{session.stroke}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Description */}
      {session.description && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Description</Text>
          <Text style={styles.descriptionText}>{session.description}</Text>
        </View>
      )}

      {/* Session Metadata */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ℹ️ Session Info</Text>
        <View style={styles.metadataContainer}>
          <View style={styles.metadataRow}>
            <Text style={styles.metadataLabel}>Created:</Text>
            <Text style={styles.metadataValue}>
              {formatDate(session.createdAt)} at {formatTime(session.createdAt)}
            </Text>
          </View>
          {session.updatedAt !== session.createdAt && (
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Last Updated:</Text>
              <Text style={styles.metadataValue}>
                {formatDate(session.updatedAt)} at {formatTime(session.updatedAt)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Text style={styles.editButtonText}>✏️ Edit Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>🗑️ Delete Session</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
  },
  backButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    marginHorizontal: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  editButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 18,
  },
  detailsCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: -10,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  intensityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  intensityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  strokeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  strokeBadge: {
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  strokeText: {
    color: '#0369a1',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  descriptionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  metadataContainer: {
    gap: 12,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metadataLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  metadataValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    textAlign: 'right',
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

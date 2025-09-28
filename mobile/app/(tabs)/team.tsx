import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Image, Platform, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { apiService } from '../../services/api';
import { Team, TeamStats, UserRole } from '../../../shared/types';
import { useTheme } from '../../contexts/ThemeContext';

export default function TeamScreen() {
  const { isDarkMode, colors } = useTheme();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      loadTeamData();
    }, [])
  );

  const loadTeamData = async () => {
    try {
      setLoading(true);
      console.log('Loading team data...');
      
      if (!apiService.getAuthToken()) {
        console.log('No auth token found');
        setLoading(false);
        return;
      }

      const teamResponse = await apiService.getTeam();
      console.log('Team response:', teamResponse);
      
      if ((teamResponse as any).team) {
        console.log('Team members:', (teamResponse as any).team.members);
        setTeam((teamResponse as any).team);
        // Load team stats if user has a team
        const statsResponse = await apiService.getTeamStats();
        setTeamStats((statsResponse as any).stats);
      } else {
        setTeam(null);
        setTeamStats(null);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('Error', 'Please enter an invite code');
      return;
    }

    try {
      setLoading(true);
      await apiService.joinTeam(inviteCode.trim());
      setInviteCode('');
      setShowJoinForm(false);
      Alert.alert('Success', 'Successfully joined team!');
      loadTeamData();
    } catch (error: any) {
      console.error('Error joining team:', error);
      Alert.alert('Error', error.message || 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    try {
      setLoading(true);
      await apiService.createTeam({
        name: teamName.trim(),
        description: teamDescription.trim() || undefined,
      });
      setTeamName('');
      setTeamDescription('');
      setShowCreateForm(false);
      Alert.alert('Success', 'Team created successfully!');
      loadTeamData();
    } catch (error: any) {
      console.error('Error creating team:', error);
      Alert.alert('Error', error.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = () => {
    // For web compatibility, prefer window.confirm if available
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.confirm === 'function') {
      const confirmed = window.confirm('Are you sure you want to leave this team?');
      if (confirmed) leaveTeam();
      return;
    }

    Alert.alert(
      'Leave Team',
      'Are you sure you want to leave this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: leaveTeam },
      ]
    );
  };

  const leaveTeam = async () => {
    try {
      setLoading(true);
      await apiService.leaveTeam();
      Alert.alert('Success', 'Successfully left team');
      loadTeamData();
    } catch (error: any) {
      console.error('Error leaving team:', error);
      Alert.alert('Error', error.message || 'Failed to leave team');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.CAPTAIN: return '#ef4444';
      case UserRole.COACH: return '#8b5cf6';
      case UserRole.ADMIN: return '#f59e0b';
      case UserRole.MEMBER: return '#3b82f6';
      default: return '#64748b';
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)}km`;
    }
    return `${meters}m`;
  };

  const prettifyStroke = (s: string | null | undefined) => {
    if (!s) return '';
    switch (s.toUpperCase()) {
      case 'FREESTYLE': return 'Freestyle';
      case 'BACKSTROKE': return 'Backstroke';
      case 'BREASTSTROKE': return 'Breaststroke';
      case 'BUTTERFLY': return 'Butterfly';
      case 'INDIVIDUAL_MEDLEY': return 'IM';
      case 'MIXED': return 'Mixed';
      default: return s;
    }
  };

  const renderMemberAvatar = (member: any) => {
    // Check multiple possible avatar sources
    const avatarUrl = member.avatar || member.profile_image;
    
    if (avatarUrl && avatarUrl.startsWith('http')) {
      return (
        <View style={styles.memberAvatarContainer}>
          <Image
            source={{ uri: avatarUrl }}
            style={styles.memberAvatarImage}
            resizeMode="cover"
            onError={() => {
              console.log('Failed to load avatar image:', avatarUrl);
            }}
          />
        </View>
      );
    }
    // Handle emoji avatars or fallback
    return <Text style={styles.memberAvatar}>{avatarUrl || '👤'}</Text>;
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading team information...</Text>
        </View>
      </View>
    );
  }

  // No team state
  if (!team) {
    return (
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <Text style={styles.headerTitle}>Join a Team</Text>
          <Text style={styles.headerSubtitle}>
            Connect with swimmers and track progress together
          </Text>
        </View>

        <View style={styles.noTeamContainer}>
          <View style={styles.noTeamIcon}>
            <Text style={styles.noTeamIconText}>🏊‍♀️</Text>
          </View>
          <Text style={[styles.noTeamTitle, { color: colors.text }]}>No Team Yet</Text>
          <Text style={[styles.noTeamDescription, { color: colors.textSecondary }]}>
            Join an existing team with an invite code or create your own team to get started.
          </Text>

          {/* Join Team Form */}
          {showJoinForm ? (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Join Team</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter invite code"
                value={inviteCode}
                onChangeText={setInviteCode}
                autoCapitalize="characters"
              />
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={() => setShowJoinForm(false)}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleJoinTeam}>
                  <Text style={styles.primaryButtonText}>Join Team</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : showCreateForm ? (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create Team</Text>
              <TextInput
                style={styles.input}
                placeholder="Team name"
                value={teamName}
                onChangeText={setTeamName}
              />
              <TextInput
                style={styles.input}
                placeholder="Description (optional)"
                value={teamDescription}
                onChangeText={setTeamDescription}
                multiline
                numberOfLines={3}
              />
              <View style={styles.formActions}>
                <TouchableOpacity 
                  style={styles.secondaryButton} 
                  onPress={() => setShowCreateForm(false)}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleCreateTeam}>
                  <Text style={styles.primaryButtonText}>Create Team</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.primaryAction} 
                onPress={() => setShowJoinForm(true)}
              >
                <Text style={styles.actionText}>Join Team</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryAction} 
                onPress={() => setShowCreateForm(true)}
              >
                <Text style={styles.secondaryActionText}>Create Team</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  // Has team state
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerTitle}>{team.name}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'space-between' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            {team.description ? <Text style={styles.teamDescription}>{team.description}</Text> : null}

            <View style={styles.inviteRow}>
              <View style={styles.invitePill}>
                <Text style={styles.inviteLabel}>Invite</Text>
                <Text style={styles.inviteCode} numberOfLines={1} ellipsizeMode="middle">{team.inviteCode}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={async () => {
              const code = team.inviteCode || '';
              try {
                // Web clipboard
                if (Platform.OS === 'web' && typeof navigator !== 'undefined' && (navigator as any).clipboard && (navigator as any).clipboard.writeText) {
                  await (navigator as any).clipboard.writeText(code);
                  Alert.alert('Copied', 'Invite code copied to clipboard');
                  return;
                }

                // Try dynamic import of expo-clipboard for native
                try {
                  // Use require in try/catch so TypeScript doesn't fail if expo-clipboard isn't installed
                  // eslint-disable-next-line @typescript-eslint/no-var-requires
                  const ClipboardModule: any = require('expo-clipboard');
                  if (ClipboardModule && ClipboardModule.setStringAsync) {
                    await ClipboardModule.setStringAsync(code);
                    Alert.alert('Copied', 'Invite code copied to clipboard');
                    return;
                  }
                } catch (e) {
                  // ignore and fallback to Share below
                }

                // Fallback: open native share sheet so user can paste or share
                await Share.share({ message: code });
              } catch (err) {
                console.error('Failed to copy invite code', err);
                Alert.alert('Error', 'Could not copy invite code');
              }
            }}
            style={styles.copyButton}
          >
            <Text style={styles.copyButtonText}>📋 Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Team Stats */}
      {teamStats && (
        <View style={styles.statsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Team Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.statIconText}>👥</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{teamStats.members}</Text>
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Members</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: '#14b8a6' }]}>
                <Text style={styles.statIconText}>🏊‍♀️</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{teamStats.totalSessions}</Text>
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Sessions</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: '#8b5cf6' }]}>
                <Text style={styles.statIconText}>📏</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{formatDistance(teamStats.totalDistance)}</Text>
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Distance</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: '#f59e0b' }]}>
                <Text style={styles.statIconText}>🏊‍♂️</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{teamStats.mostCommonStroke ? prettifyStroke(teamStats.mostCommonStroke) : '—'}</Text>
              <Text style={[styles.statTitle, { color: colors.textSecondary }]}>Top Stroke</Text>
            </View>
          </View>
        </View>
      )}

      {/* Team Members */}
      <View style={styles.membersContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Team Members</Text>
        {team.members.map((member: any) => (
          <TouchableOpacity 
            key={member.id} 
            style={[styles.memberCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/team/member/${member.id}`)}
          >
            <View style={styles.memberInfo}>
              {renderMemberAvatar(member)}
              <View style={styles.memberDetails}>
                <Text style={[styles.memberName, { color: colors.text }]}>
                  {member.firstName} {member.lastName} (@{member.username})
                </Text>
                <View style={[styles.roleTag, { backgroundColor: getRoleColor(member.role) }]}>
                  <Text style={styles.roleText}>{member.role}</Text>
                </View>
              </View>
              <Text style={[styles.viewProfileText, { color: colors.primary }]}>View →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Team Actions */}
      <View style={styles.teamActions}>
        <TouchableOpacity style={[styles.leaveButton, { backgroundColor: colors.surface, borderColor: '#ef4444' }]} onPress={handleLeaveTeam}>
          <Text style={[styles.leaveButtonText, { color: '#ef4444' }]}>Leave Team</Text>
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
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
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
  teamDescription: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 8,
    lineHeight: 20,
  },
  noTeamContainer: {
    padding: 24,
    alignItems: 'center',
  },
  noTeamIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  noTeamIconText: {
    fontSize: 32,
  },
  noTeamTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  noTeamDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  formContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 12,
    width: '100%',
  },
  primaryAction: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  secondaryActionText: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: '600',
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
    textAlign: 'center',
  },
  membersContainer: {
    padding: 24,
    paddingTop: 0,
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
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  memberAvatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  memberAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  memberAvatarEmoji: {
    fontSize: 16,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  roleTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  inviteCodeText: {
    fontSize: 14,
    color: '#e0f2fe',
    marginRight: 8,
    maxWidth: '80%'
  },
  inviteRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  invitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 18,
    maxWidth: '100%'
  },
  inviteLabel: {
    color: '#e0f2fe',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  inviteCode: {
    color: '#e0f2fe',
    fontSize: 14,
    maxWidth: 180,
  },
  copyButton: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  teamActions: {
    padding: 24,
    paddingTop: 0,
  },
  leaveButton: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

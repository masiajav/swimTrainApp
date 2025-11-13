import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, Switch } from 'react-native';
import { router } from 'expo-router';
import { apiService } from '../services/api';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

interface UserStats {
  totalSessions: number;
  totalDistance: number;
  totalDuration: number;
  averageDistance: number;
  favoriteStroke: string;
  streakDays: number;
  joinDate: string;
}

export default function SettingsScreen() {
  const { isDarkMode, colors, toggleDarkMode } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  useEffect(() => {
    loadProfile();
  }, []);

  const calculateUserStats = (sessions: any[]): UserStats => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDistance: 0,
        totalDuration: 0,
        averageDistance: 0,
        favoriteStroke: 'Freestyle',
        streakDays: 0,
        joinDate: new Date().toISOString().split('T')[0]
      };
    }

    const totalSessions = sessions.length;
    const totalDistance = sessions.reduce((sum, session) => sum + (session.distance || 0), 0);
    const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const averageDistance = totalDistance / totalSessions;

    // Calculate favorite stroke
    const strokeCounts: { [key: string]: number } = {};
    sessions.forEach(session => {
      if (session.stroke) {
        strokeCounts[session.stroke] = (strokeCounts[session.stroke] || 0) + 1;
      }
    });
    const favoriteStroke = Object.entries(strokeCounts).reduce((a, b) => 
      strokeCounts[a[0]] > strokeCounts[b[0]] ? a : b
    )?.[0] || 'Freestyle';

    // Calculate streak days (simplified)
    const streakDays = Math.min(totalSessions, 30);

    return {
      totalSessions,
      totalDistance,
      totalDuration,
      averageDistance,
      favoriteStroke,
      streakDays,
      joinDate: sessions[0]?.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0]
    };
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, sessionsData] = await Promise.all([
        apiService.getProfile(),
        apiService.getSessions()
      ]);
      // Debug: log raw responses to help diagnose server/client shape mismatches
      // eslint-disable-next-line no-console
      console.log('[settings_new] loadProfile raw profileData =', profileData);
      // eslint-disable-next-line no-console
      console.log('[settings_new] loadProfile raw sessionsData =', sessionsData);

      // Normalize possible response shapes: { user }, { data: { ... } }, or direct user object
      let profile: UserProfile | undefined;
      if (!profileData) {
        profile = undefined;
      } else if ((profileData as any).user) {
        profile = (profileData as any).user as UserProfile;
      } else if ((profileData as any).data && ((profileData as any).data.user || (typeof (profileData as any).data.firstName !== 'undefined'))) {
        profile = (profileData as any).data.user || (profileData as any).data;
      } else if (typeof (profileData as any).firstName !== 'undefined' || (profileData as any).username) {
        // response may already be the user object
        profile = profileData as unknown as UserProfile;
      }

      const sessions = (sessionsData && (sessionsData as any).data) ? (sessionsData as any).data as any[] : (sessionsData as any).sessions || [];
      
      if (!profile) {
        console.error('[settings_new] loadProfile - profile is undefined after parsing profileData', profileData);
        Alert.alert('Error', 'Failed to load profile data (unexpected response shape). Check server logs.');
        setProfile(null);
      } else {
        setProfile(profile);
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setUsername(profile.username || '');
        setAvatar(profile.avatar || '');
      }

      const stats = calculateUserStats(sessions || []);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) {
      console.warn('[settings_new] handleSave called but profile is null - aborting save');
      Alert.alert('Profile not loaded', 'Your profile failed to load. Please try again or re-open Settings.');
      return;
    }
    // Prevent saving remote URLs as avatar - enforce direct upload from device
    if (avatar && typeof avatar === 'string' && avatar.startsWith('http')) {
      Alert.alert('Use Upload Image', 'Please upload an image from your device using the Upload Image button instead of pasting a URL.');
      return;
    }

    if (!username || username.trim().length < 3) {
      Alert.alert('Invalid username', 'Username is required and must be at least 3 characters');
      return;
    }

    try {
      setSaving(true);
      const payload = { firstName, lastName, username, avatar };
      // Debug: log payload size/type
      // eslint-disable-next-line no-console
      console.log('[settings_new] updateProfile payload (avatar length) =', typeof avatar === 'string' ? avatar.length : 0);
      // Call API and capture response
      const res = await apiService.updateProfile(payload as any);
      // eslint-disable-next-line no-console
      console.log('[settings_new] updateProfile response =', res);

      if (res && (res as any).user) {
        Alert.alert('Success', 'Profile updated successfully!');
        // Update local profile state with returned user
        const returned = (res as any).user;
        setProfile(returned);
        setFirstName(returned.firstName || '');
        setLastName(returned.lastName || '');
        setUsername(returned.username || '');
        setAvatar(returned.avatar || '');
      } else if (res && (res as any).message) {
        // Server returned a message but no user object
        Alert.alert('Update result', (res as any).message || 'Profile updated');
        await loadProfile();
      } else {
        Alert.alert('Error', 'Unexpected response from server when updating profile');
        await loadProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', (error as any)?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      await apiService.changePassword({
        currentPassword,
        newPassword,
      });
      Alert.alert('Success', 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to set your profile picture',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Sorry, we need camera roll permissions to change your avatar!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
  // Use MediaTypeOptions.Images when available, otherwise fall back to the string 'Images'
  mediaTypes: (ImagePicker as any).MediaTypeOptions?.Images || 'Images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAvatar(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Sorry, we need camera permissions to take a photo!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setAvatar(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      router.replace('/auth/login');
    }
  };

  const renderAvatarPreview = () => {
    if (avatar && typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('data:'))) {
      return (
        <Image
          source={{ uri: avatar }}
          style={{ width: 60, height: 60, borderRadius: 30 }}
          resizeMode="cover"
        />
      );
    } else if (avatar) {
      // Avoid rendering extremely long base64 text; show truncated representation
      const preview = typeof avatar === 'string' ? `${avatar.slice(0, 24)}...` : String(avatar);
      return <Text style={{ fontSize: 12 }}>{preview}</Text>;
    } else {
      return <Text style={{ fontSize: 24 }}>👤</Text>;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ padding: 8 }} onPress={() => router.back()}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>← Back</Text>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>Settings</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity style={{ padding: 8 }} onPress={() => router.back()}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>Settings</Text>
        <TouchableOpacity 
          style={{ backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, opacity: saving ? 0.5 : 1 }}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Preferences */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>⚙️ Preferences</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Push Notifications</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>Get reminders about training sessions</Text>
            </View>
            <Switch 
              value={notifications} 
              onValueChange={setNotifications}
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={notifications ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Dark Mode</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>Toggle dark appearance</Text>
            </View>
            <Switch 
              value={isDarkMode} 
              onValueChange={toggleDarkMode}
              trackColor={{ false: "#767577", true: colors.primary }}
              thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Language / Idioma</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>Choose your preferred language</Text>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: colors.border, borderRadius: 8, padding: 2 }}>
              <TouchableOpacity 
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: locale === 'en' ? colors.primary : 'transparent' }}
                onPress={async () => {
                  await setLocale('en');
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: locale === 'en' ? '#ffffff' : colors.textSecondary }}>
                  🇺🇸 English
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: locale === 'es' ? colors.primary : 'transparent' }}
                onPress={async () => {
                  await setLocale('es');
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: locale === 'es' ? '#ffffff' : colors.textSecondary }}>
                  🇪🇸 Español
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Distance Units</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>Choose your preferred measurement system</Text>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: colors.border, borderRadius: 8, padding: 2 }}>
              <TouchableOpacity 
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: units === 'metric' ? colors.primary : 'transparent' }}
                onPress={() => setUnits('metric')}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: units === 'metric' ? '#ffffff' : colors.textSecondary }}>
                  Metric
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: units === 'imperial' ? colors.primary : 'transparent' }}
                onPress={() => setUnits('imperial')}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: units === 'imperial' ? '#ffffff' : colors.textSecondary }}>
                  Imperial
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Profile Visibility</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>Who can see your profile and stats</Text>
            </View>
            <View style={{ minWidth: 120 }}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border }}
                onPress={() => {
                  Alert.alert(
                    'Profile Visibility',
                    'Choose who can see your profile and swimming statistics',
                    [
                      { text: '🌍 Public', onPress: () => setPrivacy('public') },
                      { text: '👥 Friends Only', onPress: () => setPrivacy('friends') },
                      { text: '🔒 Private', onPress: () => setPrivacy('private') },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }}
              >
                <Text style={{ fontSize: 14, color: colors.text, marginRight: 8 }}>
                  {privacy === 'public' ? '🌍 Public' : 
                   privacy === 'friends' ? '👥 Friends Only' : '🔒 Private'}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Profile Information */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Profile Information</Text>
          
          {/* Avatar */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Profile Picture</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
              <TouchableOpacity 
                style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
                onPress={showImageOptions}
              >
                {renderAvatarPreview()}
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 4, alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 12 }}>📷</Text>
                </View>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                  placeholder="Enter emoji (🏊‍♂️)"
                  placeholderTextColor={colors.textSecondary}
                  value={avatar}
                  onChangeText={(v) => {
                    // Block pasting remote URLs and encourage using the Upload Image flow
                    if (typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://') || v.includes('://'))) {
                      Alert.alert('Use Upload Image', 'Please use the Upload Image button to select or take a photo from your device. Pasting external URLs is not supported.');
                      return;
                    }
                    setAvatar(v);
                  }}
                />
                <TouchableOpacity 
                  style={{ backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 10 }}
                  onPress={showImageOptions}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>📷 Upload Image</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 16 }}>
                  Tap to upload image, or enter emoji/URL manually
                </Text>
              </View>
            </View>
          </View>

          {/* First Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>First Name</Text>
            <TextInput
              style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              placeholder="Enter your first name"
              placeholderTextColor={colors.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Last Name</Text>
            <TextInput
              style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              placeholder="Enter your last name"
              placeholderTextColor={colors.textSecondary}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Email (Read Only) */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Email</Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, padding: 16, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
              {profile?.email}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Email cannot be changed
            </Text>
          </View>

          {/* Username (Read Only) */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Username</Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, padding: 16, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
              {profile?.username}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              Username cannot be changed
            </Text>
          </View>
        </View>

        {/* Password Security */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>🔒 Password Security</Text>
          
          <TouchableOpacity 
            style={{ backgroundColor: colors.secondary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 16 }}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
              {showPasswordSection ? 'Hide Password Change' : 'Change Password'}
            </Text>
          </TouchableOpacity>

          {showPasswordSection && (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Current Password</Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                  placeholder="Enter current password"
                  placeholderTextColor={colors.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>New Password</Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                  placeholder="Enter new password"
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Confirm New Password</Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                  placeholder="Confirm new password"
                  placeholderTextColor={colors.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity 
                style={{ backgroundColor: colors.warning, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 10, opacity: saving ? 0.5 : 1 }}
                onPress={handlePasswordChange}
                disabled={saving}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                  {saving ? 'Changing...' : 'Change Password'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Account Actions */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>Account</Text>
          
          <TouchableOpacity 
            style={{ backgroundColor: colors.error, borderRadius: 12, padding: 16, alignItems: 'center' }}
            onPress={handleLogout}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

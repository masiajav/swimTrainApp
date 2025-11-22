import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
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

export default function ProfileEditScreen() {
  const { colors } = useTheme();
  const { t } = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await apiService.getProfile();
      
      let profile: UserProfile | undefined;
      if (!profileData) {
        profile = undefined;
      } else if ((profileData as any).user) {
        profile = (profileData as any).user as UserProfile;
      } else if ((profileData as any).data && ((profileData as any).data.user || (typeof (profileData as any).data.firstName !== 'undefined'))) {
        profile = (profileData as any).data.user || (profileData as any).data;
      } else if (typeof (profileData as any).firstName !== 'undefined' || (profileData as any).username) {
        profile = profileData as unknown as UserProfile;
      }

      if (!profile) {
        Alert.alert(t('common.error'), t('settings.loadProfileFailed'));
        setProfile(null);
      } else {
        setProfile(profile);
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setUsername(profile.username || '');
        setAvatar(profile.avatar || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert(t('common.error'), t('settings.loadProfileFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) {
      Alert.alert(t('settings.profileNotLoaded'), t('settings.profileNotLoadedDesc'));
      return;
    }

    if (avatar && typeof avatar === 'string' && avatar.startsWith('http')) {
      Alert.alert(t('settings.useUploadImage'), t('settings.useUploadImageDesc'));
      return;
    }

    if (!username || username.trim().length < 3) {
      Alert.alert(t('settings.invalidUsername'), t('settings.invalidUsernameDesc'));
      return;
    }

    try {
      setSaving(true);
      const payload = { firstName, lastName, username, avatar };
      const res = await apiService.updateProfile(payload as any);

      if (res && (res as any).user) {
        Alert.alert(t('common.success'), t('settings.profileUpdated'));
        const returned = (res as any).user;
        setProfile(returned);
        setFirstName(returned.firstName || '');
        setLastName(returned.lastName || '');
        setUsername(returned.username || '');
        setAvatar(returned.avatar || '');
        router.back();
      } else if (res && (res as any).message) {
        Alert.alert(t('settings.updateResult'), (res as any).message || t('settings.profileUpdated'));
        await loadProfile();
        router.back();
      } else {
        Alert.alert(t('common.error'), t('settings.unexpectedResponse'));
        await loadProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(t('common.error'), (error as any)?.message || t('settings.updateFailed'));
    } finally {
      setSaving(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      t('settings.selectImage'),
      t('settings.selectImageDesc'),
      [
        { text: t('settings.camera'), onPress: takePhoto },
        { text: t('settings.photoLibrary'), onPress: pickImage },
        { text: t('common.cancel'), style: 'cancel' }
      ]
    );
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('settings.cameraRollPermissionDenied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
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
      Alert.alert(t('common.error'), t('settings.cameraPermissionDenied'));
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

  const renderAvatarPreview = () => {
    if (avatar && typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('data:'))) {
      return (
        <Image
          source={{ uri: avatar }}
          style={{ width: 80, height: 80, borderRadius: 40 }}
          resizeMode="cover"
        />
      );
    } else if (avatar) {
      return <Text style={{ fontSize: 40 }}>{avatar}</Text>;
    } else {
      return <Text style={{ fontSize: 40 }}>👤</Text>;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ padding: 8 }} onPress={() => router.back()}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>{t('profile.editProfile')}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity style={{ padding: 8 }} onPress={() => router.back()}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>← {t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>{t('profile.editProfile')}</Text>
        <TouchableOpacity 
          style={{ backgroundColor: colors.success, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, opacity: saving ? 0.5 : 1 }}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>{saving ? t('settings.saving') : t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Profile Information */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>👤 {t('settings.profileInformation')}</Text>
          
          {/* Avatar */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>{t('settings.profilePicture')}</Text>
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
                  placeholder={t('settings.emojiPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={avatar}
                  onChangeText={(v) => {
                    if (typeof v === 'string' && (v.startsWith('http://') || v.startsWith('https://') || v.includes('://'))) {
                      Alert.alert(t('settings.useUploadImage'), t('settings.useUploadImagePasteDesc'));
                      return;
                    }
                    setAvatar(v);
                  }}
                />
                <TouchableOpacity 
                  style={{ backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 10 }}
                  onPress={showImageOptions}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>📷 {t('settings.uploadImage')}</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 16 }}>
                  {t('settings.uploadImageDesc')}
                </Text>
              </View>
            </View>
          </View>

          {/* First Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>{t('auth.firstName')}</Text>
            <TextInput
              style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              placeholder={t('settings.firstNamePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>{t('auth.lastName')}</Text>
            <TextInput
              style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              placeholder={t('settings.lastNamePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Username */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>{t('auth.username')}</Text>
            <TextInput
              style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
              placeholder={t('settings.usernamePlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          {/* Email (Read Only) */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>{t('auth.email')}</Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, padding: 16, backgroundColor: colors.background, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
              {profile?.email}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
              {t('settings.emailCannotChange')}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

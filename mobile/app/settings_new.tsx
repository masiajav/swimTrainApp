import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { router } from 'expo-router';
import { apiService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';

export default function SettingsScreen() {
  const { isDarkMode, colors, toggleDarkMode } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [privacy, setPrivacy] = useState<'public' | 'friends' | 'private'>('public');

  useEffect(() => {
    setLoading(false);
  }, []);

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('settings.fillAllPasswordFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('settings.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(t('common.error'), t('settings.passwordTooShort'));
      return;
    }

    try {
      setSaving(true);
      await apiService.changePassword({
        currentPassword,
        newPassword,
      });
      Alert.alert(t('common.success'), t('settings.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordSection(false);
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert(t('common.error'), t('settings.passwordChangeFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ backgroundColor: colors.primary, paddingTop: 60, paddingBottom: 20, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity style={{ padding: 8 }} onPress={() => router.back()}>
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>← {t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>{t('settings.title')}</Text>
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
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' }}>{t('settings.title')}</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Preferences */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>⚙️ {t('settings.preferences')}</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{t('settings.pushNotifications')}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>{t('settings.pushNotificationsDesc')}</Text>
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{t('settings.darkMode')}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>{t('settings.darkModeDesc')}</Text>
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{t('settings.language')} / Idioma</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>{t('settings.languageDesc')}</Text>
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
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{t('settings.distanceUnits')}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>{t('settings.distanceUnitsDesc')}</Text>
            </View>
            <View style={{ flexDirection: 'row', backgroundColor: colors.border, borderRadius: 8, padding: 2 }}>
              <TouchableOpacity 
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: units === 'metric' ? colors.primary : 'transparent' }}
                onPress={() => setUnits('metric')}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: units === 'metric' ? '#ffffff' : colors.textSecondary }}>
                  {t('settings.metric')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6, backgroundColor: units === 'imperial' ? colors.primary : 'transparent' }}
                onPress={() => setUnits('imperial')}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: units === 'imperial' ? '#ffffff' : colors.textSecondary }}>
                  {t('settings.imperial')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{t('settings.profileVisibility')}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>{t('settings.profileVisibilityDesc')}</Text>
            </View>
            <View style={{ minWidth: 120 }}>
              <TouchableOpacity 
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border }}
                onPress={() => {
                  Alert.alert(
                    t('settings.profileVisibility'),
                    t('settings.profileVisibilityDesc'),
                    [
                      { text: `🌍 ${t('settings.public')}`, onPress: () => setPrivacy('public') },
                      { text: `👥 ${t('settings.friendsOnly')}`, onPress: () => setPrivacy('friends') },
                      { text: `🔒 ${t('settings.private')}`, onPress: () => setPrivacy('private') },
                      { text: t('common.cancel'), style: 'cancel' }
                    ]
                  );
                }}
              >
                <Text style={{ fontSize: 14, color: colors.text, marginRight: 8 }}>
                  {privacy === 'public' ? `🌍 ${t('settings.public')}` : 
                   privacy === 'friends' ? `👥 ${t('settings.friendsOnly')}` : `🔒 ${t('settings.private')}`}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Password Security */}
        <View style={{ backgroundColor: colors.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 12, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>🔒 {t('settings.passwordSecurity')}</Text>
          
          <TouchableOpacity 
            style={{ backgroundColor: colors.secondary, borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginBottom: 16 }}
            onPress={() => setShowPasswordSection(!showPasswordSection)}
          >
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
              {showPasswordSection ? t('settings.hidePasswordChange') : t('settings.changePassword')}
            </Text>
          </TouchableOpacity>

          {showPasswordSection && (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>{t('settings.currentPassword')}</Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                  placeholder={t('settings.currentPasswordPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>{t('settings.newPassword')}</Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                  placeholder={t('settings.newPasswordPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>{t('settings.confirmPassword')}</Text>
                <TextInput
                  style={{ backgroundColor: colors.background, borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: colors.border, color: colors.text }}
                  placeholder={t('settings.confirmPasswordPlaceholder')}
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
                  {saving ? t('settings.changing') : t('settings.changePassword')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

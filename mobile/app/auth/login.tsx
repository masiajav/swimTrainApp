import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Platform, Switch } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Modal } from 'react-native';
import { Link, router } from 'expo-router';
import { apiService } from '../../services/api';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocale } from '../../contexts/LocaleContext';

export default function LoginScreen() {
  const { isDarkMode, colors } = useTheme();
  const { t, locale } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const SUPABASE_URL = 'https://pkrtqzsudfeehwufyduy.supabase.co';

  // Use the custom scheme redirect explicitly. We'll deep-link back to
  // swimtrainapp://auth/callback which `AuthCallbackScreen` parses.

  // Note: we previously attempted to use expo-auth-session (promptAsync) for an
  // in-app browser flow. That approach was unreliable across Expo Go and
  // emulator configurations for this project. Instead we'll use the provider
  // authorize URL and open the system browser with a redirect_to that points
  // to our app custom scheme. Supabase will redirect back to
  // swimtrainapp://auth/callback#access_token=... which `AuthCallbackScreen`
  // parses and exchanges with the backend.
  // (keep the AuthSession import available if you later switch to a dev-client)

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    setIsLoading(true);
    // eslint-disable-next-line no-console
    console.log('[Login] handleLogin start for', trimmedEmail);
    try {
      const response = await apiService.login({ email: trimmedEmail, password: trimmedPassword });
      // Store the token for future requests
      apiService.setAuthToken(response.token);
      // Persist auto-login preference
      try {
        await apiService.setAutoLoginEnabled(autoLogin);
        // eslint-disable-next-line no-console
        console.log('[Login] autoLogin preference saved =', autoLogin);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[Login] failed to persist autoLogin preference', e);
      }
      // You might want to store this in secure storage
      // eslint-disable-next-line no-console
      console.log('[Login] Login successful, user id =', (response as any)?.user?.id);

      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert(t('common.error'), error.message || t('auth.loginFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Web: navigate to callback route on same origin
      if (Platform.OS === 'web') {
        const redirectUrl = window.location.origin + '/auth/callback';
        window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
        return;
      }

    // Mobile: open external browser to Supabase authorize endpoint and let it
    // redirect to our public redirect helper which will deep-link back to
    // swimtrainapp://auth/callback with the fragment (access_token)...
    // Using the public helper avoids provider redirects landing at local dev
    // servers (which don't contain the fragment) when testing on device.
    // Safely read manifest or expoConfig and then extra to satisfy TypeScript types
    const _manifest: any = (Constants as any)?.manifest ?? (Constants as any)?.expoConfig ?? {};
    const redirectHelper = (_manifest?.extra as any)?.REDIRECT_HELPER_URL ||
      'https://pkrtqzsudfeehwufyduy.functions.supabase.co/redirect-helper/';
    const fallback = 'swimtrainapp://auth/callback';
  const authUrl = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectHelper)}`;
  // Debug: log the URL we will open so we can confirm redirect target in logs
  // eslint-disable-next-line no-console
  console.log('[Auth] opening authUrl =', authUrl);
  // Debug: print runtime manifest extras to confirm which REDIRECT_HELPER_URL we picked up
  // eslint-disable-next-line no-console
  console.log('[Auth] manifest.extra =', (Constants?.manifest as any)?.extra);

      Alert.alert(
        'Continue in browser',
        'We will open your browser for Google sign-in. After consenting, return to the app to finish logging in.',
        [
          { text: 'Cancel', onPress: () => setIsLoading(false), style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              try {
                await Linking.openURL(authUrl);
                // If the user doesn't return after 90s, clear loading state
                setTimeout(() => setIsLoading(false), 90000);
              } catch (err) {
                console.error('Failed to open browser for Google sign-in', err);
                setIsLoading(false);
                Alert.alert('Error', 'Unable to open browser. Please try again.');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  // On mount, ensure apiService is initialized and redirect if a token is present
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[Login] mount: checking stored token for auto-login');
    apiService.initialize().then(() => {
      try {
        const token = apiService.getStoredAuthToken();
        // eslint-disable-next-line no-console
        console.log('[Login] mount: stored token present=', !!token);
        if (token) {
          // If a token exists, go straight to main tabs
          router.replace('/(tabs)');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[Login] mount: token check failed', e);
      }
    }).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[Login] apiService.initialize() failed on mount', err);
    });
  }, []);

  // Responses are handled by the deep-link callback screen which parses the
  // access_token from the incoming URL fragment and exchanges it with the
  // backend via `apiService.googleAuth`.

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Swimming Theme */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Text style={styles.headerEmoji}>🏊‍♀️</Text>
        <Text style={styles.headerTitle}>Lapster</Text>
        <Text style={[styles.headerSubtitle, { color: isDarkMode ? colors.textSecondary : '#e0f2fe' }]}>{t('auth.welcomeMessage')}</Text>
      </View>

      {/* Login Form Card */}
      <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>{t('auth.welcomeBack')}</Text>
          <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>{t('auth.welcomeMessage')}</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t('auth.email')}</Text>
          <TextInput
            placeholder={t('auth.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>{t('auth.password')}</Text>
          <View style={styles.inputOverlayContainer}>
            <TextInput
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[styles.input, styles.inputWithIcon, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              style={styles.inputIcon}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity onPress={() => setForgotModalVisible(true)} style={{ marginBottom: 12 }}>
          <Text style={{ color: colors.primary, textAlign: 'right', fontWeight: '600' }}>{t('auth.forgotPassword')}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ marginRight: 12, color: colors.text, fontWeight: '600' }}>{t('auth.enableAutoLogin')}</Text>
          <Switch value={autoLogin} onValueChange={setAutoLogin} trackColor={{ false: '#767577', true: colors.primary }} thumbColor={autoLogin ? '#ffffff' : '#f4f3f4'} />
        </View>
        <TouchableOpacity 
          onPress={handleLogin}
          style={[styles.loginButton, { backgroundColor: colors.primary }, isLoading && styles.loginButtonDisabled]}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? t('auth.signingIn') : t('auth.signIn')}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Google Sign In Button hidden for MVP (email/password only) */}
        {/* Removed visual Google sign-in for MVP release. Re-enable by restoring the button and handler. */}
        
        <Link href="/auth/register" asChild>
          <TouchableOpacity style={styles.signUpLink}>
            <Text style={[styles.signUpText, { color: colors.textSecondary }]}>
              {t('auth.dontHaveAccount')} <Text style={[styles.signUpTextBold, { color: colors.primary }]}>{t('auth.signUp')}</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    
    {/* Forgot Password Modal */}
    <Modal
      visible={forgotModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setForgotModalVisible(false)}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
        <View style={{ width: '90%', backgroundColor: colors.surface, padding: 20, borderRadius: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8, color: colors.text }}>{t('auth.resetPassword')}</Text>
          <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>{t('auth.resetPasswordMessage')}</Text>
          <TextInput
            placeholder={t('auth.email')}
            value={forgotEmail}
            onChangeText={setForgotEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, marginBottom: 12 }]}
            placeholderTextColor={colors.textSecondary}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
            <TouchableOpacity onPress={() => setForgotModalVisible(false)} style={{ marginRight: 12 }}>
              <Text style={{ color: colors.textSecondary }}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const trimmedForgotEmail = forgotEmail.trim();
                if (!trimmedForgotEmail) { Alert.alert(t('common.error'), t('auth.enterEmail')); return; }
                try {
                  setIsLoading(true);
                  await apiService.requestPasswordReset(trimmedForgotEmail);
                  Alert.alert(t('common.success'), t('auth.resetSuccess'));
                  setForgotModalVisible(false);
                  setForgotEmail('');
                } catch (err: any) {
                  console.error('Forgot password error', err);
                  Alert.alert(t('common.error'), err?.message || t('auth.resetFailed'));
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: '700' }}>{isLoading ? t('auth.sending') : t('auth.sendEmail')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  formCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  inputOverlayContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWithIcon: {
    paddingRight: 44, // room for the icon
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#3b82f6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  signUpLink: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 16,
  },
  signUpTextBold: {
    fontWeight: 'bold',
  },
  waveContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  waveText: {
    fontSize: 24,
    opacity: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  eyeText: {
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});

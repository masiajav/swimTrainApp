import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { apiService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocale } from '../../contexts/LocaleContext';

export default function RegisterScreen() {
  const { isDarkMode, colors } = useTheme();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedUsername || !trimmedPassword) {
      Alert.alert(t('common.error'), t('auth.fillAllFields'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.register({
        email: trimmedEmail,
        username: trimmedUsername,
        password: trimmedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      
      // Store the token for future requests
      apiService.setAuthToken(response.token);
      
      console.log('Registration successful:', response.user);
      Alert.alert(t('common.success'), t('auth.welcomeUser', { name: response.user.firstName || response.user.username }));
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert(t('common.error'), error.message || t('auth.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      // For web, we'll use Supabase's built-in Google OAuth
      const SUPABASE_URL = 'https://pkrtqzsudfeehwufyduy.supabase.co';
      const redirectUrl = window.location.origin + '/auth/callback';
      
      // Redirect to Supabase Google OAuth
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
    } catch (error: any) {
      console.error('Google sign-up error:', error);
      Alert.alert('Error', 'Google sign-up failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with Swimming Theme */}
      <View style={[styles.header, { backgroundColor: colors.success }]}>
        <Text style={styles.headerEmoji}>🏊‍♂️</Text>
        <Text style={styles.headerTitle}>{t('auth.joinApp')}</Text>
        <Text style={[styles.headerSubtitle, { color: isDarkMode ? colors.textSecondary : '#a7f3d0' }]}>{t('auth.startJourney')}</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Registration Form Card */}
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>{t('auth.createAccount')}</Text>
            <Text style={[styles.welcomeSubtext, { color: colors.textSecondary }]}>{t('auth.joinCommunity')}</Text>
          </View>
          
          {/* Personal Information Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>👤 {t('auth.personalInfo')}</Text>
            
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('auth.firstName')}</Text>
                <TextInput
                  placeholder={t('auth.firstNamePlaceholder')}
                  value={firstName}
                  onChangeText={setFirstName}
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('auth.lastName')}</Text>
                <TextInput
                  placeholder={t('auth.lastNamePlaceholder')}
                  value={lastName}
                  onChangeText={setLastName}
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>
          </View>

          {/* Account Details Section */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text, borderBottomColor: colors.border }]}>🔐 {t('auth.accountDetails')}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('auth.email')} *</Text>
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
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('auth.username')} *</Text>
              <TextInput
                placeholder={t('auth.usernamePlaceholder')}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>{t('auth.password')} *</Text>
              <View style={styles.inputOverlayContainer}>
                <TextInput
                  placeholder={t('auth.createPassword')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.inputWithIcon, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((s) => !s)}
                  style={styles.inputIcon}
                  accessibilityLabel={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                >
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.success} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleRegister}
            style={[styles.registerButton, { backgroundColor: colors.success }, isLoading && styles.registerButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? t('auth.creatingAccount') : t('auth.createAccountButton')}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textSecondary }]}>{t('common.or')}</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Google Sign Up Button hidden for MVP (email/password only) */}
          {/* Removed visual Google sign-up for MVP release. Re-enable by restoring the button and handler. */}
          
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={styles.loginLink}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                {t('auth.alreadyHaveAccount')} <Text style={[styles.loginTextBold, { color: colors.success }]}>{t('auth.signIn')}</Text>
              </Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Bottom Wave Decoration */}
        <View style={styles.waveContainer}>
          <Text style={styles.waveText}>🌊 🌊 🌊</Text>
        </View>
      </ScrollView>
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
  scrollContainer: {
    flex: 1,
  },
  formCard: {
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 32,
    marginBottom: 40,
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
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
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
  registerButton: {
    borderRadius: 12,
    padding: 18,
    marginTop: 12,
    marginBottom: 24,
    shadowColor: '#059669',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
  },
  loginTextBold: {
    fontWeight: 'bold',
  },
  waveContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  waveText: {
    fontSize: 24,
    opacity: 0.3,
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
  inputOverlayContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { apiService } from '../../services/api';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !username || !password) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.register({
        email,
        username,
        password,
        firstName,
        lastName,
      });
      
      // Store the token for future requests
      apiService.setAuthToken(response.token);
      
      console.log('Registration successful:', response.user);
      Alert.alert('Success', `Welcome to SwimTrainApp, ${response.user.firstName || response.user.username}!`);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'Registration failed. Please try again.');
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
    <View style={styles.container}>
      {/* Header with Swimming Theme */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🏊‍♂️</Text>
        <Text style={styles.headerTitle}>Join SwimTrainApp</Text>
        <Text style={styles.headerSubtitle}>Start your swimming journey today</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Registration Form Card */}
        <View style={styles.formCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.welcomeSubtext}>Join our swimming community and track your progress</Text>
          </View>
          
          {/* Personal Information Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>👤 Personal Information</Text>
            
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  placeholder="John"
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                  placeholderTextColor="#94a3b8"
                />
              </View>
              
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  placeholder="Swimmer"
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
          </View>

          {/* Account Details Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>🔐 Account Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>📧 Email *</Text>
              <TextInput
                placeholder="your.email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>👤 Username *</Text>
              <TextInput
                placeholder="swimmer123"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Password *</Text>
              <TextInput
                placeholder="Create a strong password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
          
          <TouchableOpacity 
            onPress={handleRegister}
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            disabled={isLoading}
          >
            <Text style={styles.registerButtonText}>
              {isLoading ? '🏊‍♀️ Creating Account...' : '🏊‍♀️ Create Account'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign Up Button */}
          <TouchableOpacity 
            onPress={handleGoogleSignUp}
            style={styles.googleButton}
            disabled={isLoading}
          >
            <Text style={styles.googleButtonText}>
              🔍 Sign up with Google
            </Text>
          </TouchableOpacity>
          
          <Link href="/auth/login" asChild>
            <TouchableOpacity style={styles.loginLink}>
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginTextBold}>Sign in</Text>
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
    backgroundColor: '#f0f9ff',
  },
  header: {
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: '#059669',
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
    color: '#a7f3d0',
  },
  scrollContainer: {
    flex: 1,
  },
  formCard: {
    backgroundColor: 'white',
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
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
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
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#1e293b',
  },
  registerButton: {
    backgroundColor: '#059669',
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
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
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
    color: '#374151',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginLink: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
    color: '#64748b',
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: '#059669',
  },
  waveContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  waveText: {
    fontSize: 24,
    opacity: 0.3,
  },
});

import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Link, router } from 'expo-router';
import { apiService } from '../../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      // Store the token for future requests
      apiService.setAuthToken(response.token);
      
      // You might want to store this in secure storage
      console.log('Login successful:', response.user);
      
      Alert.alert('Success', `Welcome back, ${response.user.firstName || response.user.username}!`);
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // For web, we'll use Supabase's built-in Google OAuth
      const SUPABASE_URL = 'https://pkrtqzsudfeehwufyduy.supabase.co';
      const redirectUrl = window.location.origin + '/auth/callback';
      
      // Redirect to Supabase Google OAuth
      window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Google sign-in failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Swimming Theme */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🏊‍♀️</Text>
        <Text style={styles.headerTitle}>SwimTrainApp</Text>
        <Text style={styles.headerSubtitle}>Welcome back to your training</Text>
      </View>

      {/* Login Form Card */}
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.welcomeSubtext}>Sign in to continue your training journey</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>📧 Email</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>🔒 Password</Text>
          <TextInput
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />
        </View>
        
        <TouchableOpacity 
          onPress={handleLogin}
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? '🏊‍♀️ Signing In...' : '🏊‍♀️ Sign In'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google Sign In Button */}
        <TouchableOpacity 
          onPress={handleGoogleLogin}
          style={styles.googleButton}
          disabled={isLoading}
        >
          <Text style={styles.googleButtonText}>
            🔍 Continue with Google
          </Text>
        </TouchableOpacity>
        
        <Link href="/auth/register" asChild>
          <TouchableOpacity style={styles.signUpLink}>
            <Text style={styles.signUpText}>
              Don't have an account? <Text style={styles.signUpTextBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      {/* Bottom Wave Decoration */}
      <View style={styles.waveContainer}>
        <Text style={styles.waveText}>🌊 🌊 🌊</Text>
      </View>
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
    backgroundColor: '#3b82f6',
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
    color: '#e0f2fe',
  },
  formCard: {
    backgroundColor: 'white',
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
    color: '#1e293b',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
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
  loginButton: {
    backgroundColor: '#3b82f6',
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
    color: '#64748b',
  },
  signUpTextBold: {
    fontWeight: 'bold',
    color: '#3b82f6',
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
});

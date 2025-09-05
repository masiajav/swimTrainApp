import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function AuthCallbackScreen() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from URL which contains the authentication tokens
        const hash = window.location.hash;
        console.log('Auth callback - Hash:', hash);
        
        if (hash) {
          // Parse the hash to get access_token
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');
          
          console.log('Access token found:', !!accessToken);
          
          if (accessToken) {
            console.log('Sending token to backend...');
            
            // Send the token to our backend to complete authentication
            const response = await fetch('http://localhost:3000/api/auth/google', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ token: accessToken }),
            });
            
            const data = await response.json();
            console.log('Backend response:', data);
            
            if (response.ok) {
              // Store the JWT token (you might want to use secure storage)
              console.log('Google authentication successful:', data.user);
              
              // Redirect to dashboard
              router.replace('/(tabs)');
            } else {
              console.error('Authentication failed:', data.error);
              alert(`Authentication failed: ${data.error}`);
              router.replace('/auth/login');
            }
          } else {
            console.error('No access token found in hash');
            alert('No access token found');
            router.replace('/auth/login');
          }
        } else {
          console.error('No hash found in URL');
          alert('No authentication data found');
          router.replace('/auth/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        alert(`Authentication error: ${error}`);
        router.replace('/auth/login');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.loadingText}>🏊‍♀️ Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
  },
  loadingText: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

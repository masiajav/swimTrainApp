import { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { apiService } from '../../services/api';
import * as Linking from 'expo-linking';

export default function AuthCallbackScreen() {
  useEffect(() => {
    let isMounted = true;

    const handleUrl = async (url: string | null) => {
      if (!url) return;
      try {
        // url may be like: swimtrainapp://auth/callback#access_token=... or ...?access_token=...
        // Debug: log the raw incoming URL
        // eslint-disable-next-line no-console
        console.log('[AuthCallback] raw url =', url);

        const parsed = Linking.parse(url);

        // supabase often returns tokens in the fragment
        const raw = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
        const params = new URLSearchParams(raw);
        // Debug: log parsed params
        // eslint-disable-next-line no-console
        console.log('[AuthCallback] parsed params =', Object.fromEntries(params.entries()));
        const accessToken = params.get('access_token');

        if (!accessToken) {
          console.error('No access token found in callback URL');
          router.replace('/auth/login');
          return;
        }

        // Exchange with backend using apiService so API_BASE_URL logic is used
        try {
          const data = await apiService.googleAuth(accessToken);
          if (data && (data as any).token) {
            apiService.setAuthToken((data as any).token);
            if (isMounted) router.replace('/(tabs)');
          } else {
            console.error('Token exchange failed', data);
            if (isMounted) router.replace('/auth/login');
          }
        } catch (err) {
          console.error('Token exchange error', err);
          if (isMounted) router.replace('/auth/login');
        }
      } catch (err) {
        console.error('Error handling callback URL', err);
        if (isMounted) router.replace('/auth/login');
      }
    };

    const run = async () => {
      if (Platform.OS === 'web') {
        const hash = typeof window !== 'undefined' ? window.location.hash : '';
        const raw = hash ? hash.substring(1) : '';
        const params = new URLSearchParams(raw);
        const accessToken = params.get('access_token');
        if (accessToken) {
          await handleUrl(`${window.location.origin}${window.location.pathname}#${raw}`);
          return;
        }
        router.replace('/auth/login');
        return;
      }

      // Mobile: try initial URL (if opened by deep link)
      const initial = await Linking.getInitialURL();
      if (initial) {
        await handleUrl(initial);
        return;
      }

      // Also listen for incoming links if the app receives one
      const sub = Linking.addEventListener('url', (ev) => {
        handleUrl(ev.url);
      });

      // Cleanup
      return () => {
        isMounted = false;
        try {
          sub.remove();
        } catch {}
      };
    };

    const maybeCleanup = run();

    return () => {
      // ensure cleanup from run
      if (maybeCleanup && typeof (maybeCleanup as any) === 'function') (maybeCleanup as any)();
    };
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

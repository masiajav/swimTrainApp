import { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { apiService } from '../../services/api';
import * as Linking from 'expo-linking';

// NOTE: Google OAuth UI is currently disabled for the MVP.
// The callback handler remains in the codebase so developers can re-enable
// Google flows in future releases without re-implementing parsing logic.
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

        // Try to extract tokens from anywhere in the incoming URL string.
        // Some flows place tokens in the fragment, query, or inside a nested
        // `url` parameter (expo-dev-client). We perform layered attempts:
        // 1) parse fragment/query via URLSearchParams
        // 2) if not found, look for nested `url` param and decode it (double-decode if needed)
        // 3) as a last resort, run a regex across the raw URL to capture access_token or id_token
        const rawFragmentOrQuery = url.includes('#') ? url.split('#')[1] : url.split('?')[1] ?? '';
        const params = new URLSearchParams(rawFragmentOrQuery);
        // Debug: log parsed params
        // eslint-disable-next-line no-console
        console.log('[AuthCallback] parsed params =', Object.fromEntries(params.entries()));
        let accessToken = params.get('access_token') || params.get('id_token');

        // If dev-client wrapped the original URL as a `url` param, try decoding it.
        if (!accessToken) {
          const nestedRaw = params.get('url') || (parsed && (parsed.queryParams as any)?.url);
          if (nestedRaw) {
            try {
              // Try decoding multiple times to handle double-encoded values
              let decoded = nestedRaw;
              try {
                decoded = decodeURIComponent(decoded);
              } catch {}
              try {
                decoded = decodeURIComponent(decoded);
              } catch {}
              // eslint-disable-next-line no-console
              console.log('[AuthCallback] nested url detected =', decoded);
              const nestedFragmentOrQuery = decoded.includes('#') ? decoded.split('#')[1] : decoded.split('?')[1] ?? '';
              const nestedParams = new URLSearchParams(nestedFragmentOrQuery);
              // eslint-disable-next-line no-console
              console.log('[AuthCallback] parsed nested params =', Object.fromEntries(nestedParams.entries()));
              accessToken = nestedParams.get('access_token') || nestedParams.get('id_token');
            } catch (e) {
              // ignore and continue to regex fallback
              // eslint-disable-next-line no-console
              console.error('[AuthCallback] error parsing nested url', e);
            }
          }
        }

        // Regex fallback: scan the entire URL for access_token or id_token assignments
        if (!accessToken) {
          try {
            // match access_token=... or id_token=... (stop at & or end)
            const re = /(?:access_token|id_token)=([^&\s]+)/i;
            const m = url.match(re);
            if (m && m[1]) {
              // values may be percent-encoded; decode safely
              try {
                accessToken = decodeURIComponent(m[1]);
              } catch {
                accessToken = m[1];
              }
              // eslint-disable-next-line no-console
              console.log('[AuthCallback] token found via regex fallback');
            }
          } catch (e) {
            // ignore
          }
        }

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

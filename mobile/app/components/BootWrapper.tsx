import React, { useEffect, useState, PropsWithChildren } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, Text } from 'react-native';
import { apiService } from '../../services/api';

/**
 * BootWrapper
 * - Ensures apiService.initialize() runs before rendering the app navigation
 * - Prevents flicker between auth states by waiting for persisted token to load
 */
export const BootWrapper: React.FC<PropsWithChildren<Record<string, unknown>>> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // initialize will load persisted token into memory when auto-login is enabled
        await apiService.initialize();
      } catch (e) {
        // ignore initialization errors but log for diagnostics
        // eslint-disable-next-line no-console
        console.warn('[BootWrapper] apiService.initialize failed', e);
      } finally {
        if (mounted) setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    // Simple splash while the app boots. Keep small and platform-friendly.
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        {Platform.OS === 'web' ? <Text style={styles.text}>Starting Lapster…</Text> : null}
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    marginTop: 8,
    color: '#3b82f6',
    fontWeight: '600',
  },
});

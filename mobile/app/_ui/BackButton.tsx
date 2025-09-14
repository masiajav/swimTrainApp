import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export function BackButton({ label }: { label?: string }) {
  const router = useRouter();
  return (
    <TouchableOpacity onPress={() => router.back()} style={styles.container} accessibilityRole="button">
      <Text style={styles.icon}>←</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  icon: {
    fontSize: 18,
    color: '#374151',
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
});

export default BackButton;

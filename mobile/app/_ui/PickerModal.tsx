import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

type Option = string | { label: string; value: string };

export default function PickerModal({
  visible,
  onClose,
  title,
  options,
  onSelect,
  selectedValue,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  onSelect: (value: string) => void;
  selectedValue?: string | null;
}) {
  const labelFor = (opt: Option) => (typeof opt === 'string' ? opt : opt.label);
  const valueFor = (opt: Option) => (typeof opt === 'string' ? opt : opt.value);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityRole="button">
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list}>
            {options.map((opt, idx) => {
              const value = valueFor(opt);
              const label = labelFor(opt);
              const selected = selectedValue && selectedValue === value;
              return (
                <TouchableOpacity
                  key={String(idx) + value}
                  style={[styles.item, selected && styles.selectedItem]}
                  onPress={() => {
                    onSelect(value);
                    onClose();
                  }}
                >
                  <Text style={[styles.itemText, selected && styles.selectedText]}>{label.replace('_', ' ')}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  content: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 16, fontWeight: '600' },
  closeBtn: { padding: 8 },
  closeText: { color: '#6b7280' },
  list: { paddingHorizontal: 8 },
  item: { paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  itemText: { fontSize: 16, color: '#374151' },
  selectedItem: { backgroundColor: '#eff6ff' },
  selectedText: { color: '#0ea5e9', fontWeight: '600' },
});

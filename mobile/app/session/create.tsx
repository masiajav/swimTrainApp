import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { WorkoutType, Stroke, Intensity } from '../../../shared/types';

export default function CreateSession() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    duration: '',
    distance: '',
    workoutType: '' as WorkoutType | '',
    stroke: '' as Stroke | '',
    intensity: '' as Intensity | '',
  });
  const [showWorkoutTypePicker, setShowWorkoutTypePicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [showIntensityPicker, setShowIntensityPicker] = useState(false);

  const workoutTypes: WorkoutType[] = [
    WorkoutType.WARMUP,
    WorkoutType.MAIN_SET,
    WorkoutType.COOLDOWN,
    WorkoutType.TECHNIQUE,
    WorkoutType.SPRINT,
    WorkoutType.ENDURANCE,
    WorkoutType.KICK,
    WorkoutType.PULL
  ];
  const strokes: Stroke[] = [
    Stroke.FREESTYLE,
    Stroke.BACKSTROKE,
    Stroke.BREASTSTROKE,
    Stroke.BUTTERFLY,
    Stroke.INDIVIDUAL_MEDLEY,
    Stroke.MIXED
  ];
  const intensities: Intensity[] = [
    Intensity.EASY,
    Intensity.MODERATE,
    Intensity.HARD,
    Intensity.RACE_PACE
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a session title');
      return false;
    }
    if (!formData.duration.trim()) {
      Alert.alert('Error', 'Please enter session duration (in minutes)');
      return false;
    }
    if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      Alert.alert('Error', 'Please enter a valid duration in minutes');
      return false;
    }
    if (formData.distance && (isNaN(Number(formData.distance)) || Number(formData.distance) < 0)) {
      Alert.alert('Error', 'Please enter a valid distance in meters');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    console.log('Form submission started');
    if (!validateForm()) return;

    setLoading(true);
    try {
      const sessionData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        date: new Date(formData.date).toISOString(),
        duration: Number(formData.duration),
        distance: formData.distance ? Number(formData.distance) : undefined,
        workoutType: formData.workoutType || undefined,
        stroke: formData.stroke || undefined,
        intensity: formData.intensity || undefined,
      };

      console.log('Sending session data:', sessionData);
      const response = await apiService.createSession(sessionData);
      console.log('API response:', response);
      
      if (response.data) {
        Alert.alert('Success', 'Session created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/') }
        ]);
      } else {
        console.error('API Error:', response.error);
        Alert.alert('Error', response.error || 'Failed to create session. Please try again.');
      }
    } catch (error) {
      console.error('Create session error:', error);
      Alert.alert('Error', 'Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PickerModal = ({ 
    visible, 
    onClose, 
    title, 
    options, 
    onSelect, 
    selectedValue 
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: string[];
    onSelect: (value: string) => void;
    selectedValue: string;
  }) => (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.optionsList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  selectedValue === option && styles.selectedOption
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={[
                  styles.optionText,
                  selectedValue === option && styles.selectedOptionText
                ]}>
                  {option.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#0ea5e9" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Swimming Session</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Session Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="e.g., Morning Freestyle Practice"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (minutes) *</Text>
          <TextInput
            style={styles.input}
            value={formData.duration}
            onChangeText={(value) => handleInputChange('duration', value)}
            placeholder="e.g., 60"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Distance (meters)</Text>
          <TextInput
            style={styles.input}
            value={formData.distance}
            onChangeText={(value) => handleInputChange('distance', value)}
            placeholder="e.g., 2000"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Workout Type</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowWorkoutTypePicker(true)}
          >
            <Text style={[styles.pickerText, !formData.workoutType && styles.placeholderText]}>
              {formData.workoutType ? formData.workoutType.replace('_', ' ') : 'Select workout type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Primary Stroke</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowStrokePicker(true)}
          >
            <Text style={[styles.pickerText, !formData.stroke && styles.placeholderText]}>
              {formData.stroke ? formData.stroke : 'Select stroke'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Intensity</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowIntensityPicker(true)}
          >
            <Text style={[styles.pickerText, !formData.intensity && styles.placeholderText]}>
              {formData.intensity ? formData.intensity.replace('_', ' ') : 'Select intensity'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value)}
            placeholder="Additional notes about your session..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creating Session...' : 'Create Session'}
          </Text>
        </TouchableOpacity>
      </View>

      <PickerModal
        visible={showWorkoutTypePicker}
        onClose={() => setShowWorkoutTypePicker(false)}
        title="Select Workout Type"
        options={workoutTypes}
        onSelect={(value) => handleInputChange('workoutType', value)}
        selectedValue={formData.workoutType}
      />

      <PickerModal
        visible={showStrokePicker}
        onClose={() => setShowStrokePicker(false)}
        title="Select Primary Stroke"
        options={strokes}
        onSelect={(value) => handleInputChange('stroke', value)}
        selectedValue={formData.stroke}
      />

      <PickerModal
        visible={showIntensityPicker}
        onClose={() => setShowIntensityPicker(false)}
        title="Select Intensity"
        options={intensities}
        onSelect={(value) => handleInputChange('intensity', value)}
        selectedValue={formData.intensity}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
  },
  textArea: {
    height: 100,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#111827',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  submitButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedOption: {
    backgroundColor: '#eff6ff',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  selectedOptionText: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
});

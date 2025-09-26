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
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [successMessage, setSuccessMessage] = useState('');
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

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      duration: '',
      distance: '',
      workoutType: '',
      stroke: '',
      intensity: '',
    });
    setErrors({});
    setSuccessMessage('');
  };

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
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Real-time validation
    validateField(field, value);
  };

  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'title':
        if (!value.trim()) {
          error = 'Session title is required';
        } else if (value.trim().length < 3) {
          error = 'Title must be at least 3 characters';
        }
        break;
      case 'duration':
        if (!value.trim()) {
          error = 'Duration is required';
        } else if (isNaN(Number(value)) || Number(value) <= 0) {
          error = 'Duration must be a positive number';
        } else if (Number(value) > 600) {
          error = 'Duration seems too long (max 600 minutes)';
        }
        break;
      case 'distance':
        if (value && (isNaN(Number(value)) || Number(value) < 0)) {
          error = 'Distance must be a positive number';
        } else if (value && Number(value) > 50000) {
          error = 'Distance seems too long (max 50km)';
        }
        break;
      case 'date':
        const selectedDate = new Date(value);
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);
        // Allow future dates (scheduling). Only enforce reasonable lower bound.
        if (selectedDate < oneYearAgo) {
          error = 'Date cannot be more than a year ago';
        }
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate all required fields
    if (!formData.title.trim()) {
      newErrors.title = 'Session title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be a positive number';
    }
    
    if (formData.distance && (isNaN(Number(formData.distance)) || Number(formData.distance) < 0)) {
      newErrors.distance = 'Distance must be a positive number';
    }
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    // Allow future dates for scheduling purposes. Only enforce reasonable lower bound.
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    if (selectedDate < oneYearAgo) {
      newErrors.date = 'Date cannot be more than a year ago';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('Form submission started');
    if (!validateForm()) {
      // Show first error message
      const firstError = Object.values(errors).find(error => error);
      if (firstError) {
        if (typeof window !== 'undefined') {
          window.alert(firstError);
        }
      }
      return;
    }

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
        setSuccessMessage('Session created successfully! 🎉');
        setTimeout(() => {
          router.replace('/(tabs)/sessions');
        }, 1500); // Show success message for 1.5 seconds
      } else {
        console.error('API Error:', response.error);
        if (typeof window !== 'undefined') {
          window.alert(response.error || 'Failed to create session. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Create session error:', error);
      let errorMessage = 'Failed to create session. Please try again.';
      
      // Handle specific error types
      if (error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.message?.includes('401')) {
        errorMessage = 'Authentication error. Please log in again.';
        router.replace('/auth/login');
        return;
      } else if (error.message?.includes('400')) {
        errorMessage = 'Invalid data. Please check your inputs.';
      }
      
      if (typeof window !== 'undefined') {
        window.alert(errorMessage);
      }
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
        <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
          <Ionicons name="refresh" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      {/* Success Message */}
      {successMessage && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>Session Title *</Text>
            <Text style={styles.charCounter}>{formData.title.length}/50</Text>
          </View>
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : null]}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value.slice(0, 50))}
            placeholder="e.g., Morning Freestyle Practice"
            placeholderTextColor="#9ca3af"
            maxLength={50}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={[styles.input, errors.date ? styles.inputError : null]}
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
          />
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Duration (minutes) *</Text>
          <TextInput
            style={[styles.input, errors.duration ? styles.inputError : null]}
            value={formData.duration}
            onChangeText={(value) => handleInputChange('duration', value)}
            placeholder="e.g., 60"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />
          {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Distance (meters)</Text>
          <TextInput
            style={[styles.input, errors.distance ? styles.inputError : null]}
            value={formData.distance}
            onChangeText={(value) => handleInputChange('distance', value)}
            placeholder="e.g., 2000"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
          />
          {errors.distance && <Text style={styles.errorText}>{errors.distance}</Text>}
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
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.charCounter}>{formData.description.length}/200</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(value) => handleInputChange('description', value.slice(0, 200))}
            placeholder="Additional notes about your session..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={200}
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
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  successMessage: {
    backgroundColor: '#10b981',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    color: '#6b7280',
  },
});

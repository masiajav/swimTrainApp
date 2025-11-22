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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { WorkoutType, Stroke, Intensity } from '../../../shared/types';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocale } from '../../contexts/LocaleContext';

export default function CreateSession() {
  const { isDarkMode, colors } = useTheme();
  const { t } = useLocale();
  const navigation = useNavigation();
  React.useEffect(() => {
    // Hide the small back label (e.g. 'session/create') shown next to the back arrow
    // so only the arrow is visible. This keeps the header clean.
    try {
      // navigation may not expose setOptions in some environments; guard it.
      (navigation as any).setOptions && (navigation as any).setOptions({ headerBackTitleVisible: false, headerTitle: '' });
    } catch (e) {
      // ignore
    }
  }, [navigation]);
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
      newErrors.title = t('sessions.titleRequired');
    } else if (formData.title.trim().length < 3) {
      newErrors.title = t('sessions.titleMinLength');
    }
    
    if (!formData.duration.trim()) {
      newErrors.duration = t('sessions.durationRequired');
    } else if (isNaN(Number(formData.duration)) || Number(formData.duration) <= 0) {
      newErrors.duration = t('sessions.durationPositive');
    }
    
    if (formData.distance && (isNaN(Number(formData.distance)) || Number(formData.distance) < 0)) {
      newErrors.distance = t('sessions.distancePositive');
    }
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    // Allow future dates for scheduling purposes. Only enforce reasonable lower bound.
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    if (selectedDate < oneYearAgo) {
      newErrors.date = t('sessions.dateOld');
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
        setSuccessMessage(t('sessions.sessionCreated'));
        setTimeout(() => {
          router.replace('/(tabs)/sessions');
        }, 1500); // Show success message for 1.5 seconds
      } else {
        console.error('API Error:', response.error);
        if (typeof window !== 'undefined') {
          window.alert(response.error || t('sessions.createFailed'));
        }
      }
    } catch (error: any) {
      console.error('Create session error:', error);
      let errorMessage = t('sessions.createFailed');
      
      // Handle specific error types
      if (error.message?.includes('fetch')) {
        errorMessage = t('sessions.networkError');
      } else if (error.message?.includes('401')) {
        errorMessage = t('sessions.authError');
        router.replace('/auth/login');
        return;
      } else if (error.message?.includes('400')) {
        errorMessage = t('sessions.invalidData');
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
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.optionsList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  { backgroundColor: colors.background },
                  selectedValue === option && { backgroundColor: colors.primary }
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text style={[
                  styles.optionText,
                  { color: selectedValue === option ? 'white' : colors.text }
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('sessions.newSession')}</Text>
        <TouchableOpacity onPress={resetForm} style={styles.resetButton}>
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Success Message */}
      {successMessage && (
        <View style={[styles.successMessage, { backgroundColor: colors.success }]}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>{t('sessions.sessionTitle')} *</Text>
            <Text style={[styles.charCounter, { color: colors.textSecondary }]}>{formData.title.length}/50</Text>
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }, errors.title ? styles.inputError : null]}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value.slice(0, 50))}
            placeholder={t('sessions.sessionTitlePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            maxLength={50}
          />
          {errors.title && <Text style={[styles.errorText, { color: colors.error }]}>{errors.title}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('sessions.date')} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }, errors.date ? styles.inputError : null]}
            value={formData.date}
            onChangeText={(value) => handleInputChange('date', value)}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textSecondary}
          />
          {errors.date && <Text style={[styles.errorText, { color: colors.error }]}>{errors.date}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('sessions.durationMinutes')} *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }, errors.duration ? styles.inputError : null]}
            value={formData.duration}
            onChangeText={(value) => handleInputChange('duration', value)}
            placeholder={t('sessions.durationPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
          {errors.duration && <Text style={[styles.errorText, { color: colors.error }]}>{errors.duration}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('sessions.distanceMeters')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }, errors.distance ? styles.inputError : null]}
            value={formData.distance}
            onChangeText={(value) => handleInputChange('distance', value)}
            placeholder={t('sessions.distancePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
          />
          {errors.distance && <Text style={[styles.errorText, { color: colors.error }]}>{errors.distance}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('sessions.workoutType')}</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowWorkoutTypePicker(true)}
          >
            <Text style={[styles.pickerText, { color: colors.text }, !formData.workoutType && { color: colors.textSecondary }]}>
              {formData.workoutType ? t(`workoutTypes.${formData.workoutType}`) : t('sessions.selectWorkoutType')}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('sessions.primaryStroke')}</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowStrokePicker(true)}
          >
            <Text style={[styles.pickerText, { color: colors.text }, !formData.stroke && { color: colors.textSecondary }]}>
              {formData.stroke ? t(`strokes.${formData.stroke}`) : t('sessions.selectStroke')}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>{t('sessions.intensity')}</Text>
          <TouchableOpacity
            style={[styles.pickerButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowIntensityPicker(true)}
          >
            <Text style={[styles.pickerText, { color: colors.text }, !formData.intensity && { color: colors.textSecondary }]}>
              {formData.intensity ? t(`intensity.${formData.intensity}`) : t('sessions.selectIntensity')}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.text }]}>{t('sessions.description')}</Text>
            <Text style={[styles.charCounter, { color: colors.textSecondary }]}>{formData.description.length}/500</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            value={formData.description}
              onChangeText={(value) => handleInputChange('description', value.slice(0, 500))}
            placeholder={t('sessions.descriptionPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? t('sessions.creatingSession') : t('sessions.createSession')}
          </Text>
        </TouchableOpacity>
      </View>

      <PickerModal
        visible={showWorkoutTypePicker}
        onClose={() => setShowWorkoutTypePicker(false)}
        title={t('sessions.selectWorkoutType')}
        options={workoutTypes}
        onSelect={(value) => handleInputChange('workoutType', value)}
        selectedValue={formData.workoutType}
      />

      <PickerModal
        visible={showStrokePicker}
        onClose={() => setShowStrokePicker(false)}
        title={t('sessions.selectStroke')}
        options={strokes}
        onSelect={(value) => handleInputChange('stroke', value)}
        selectedValue={formData.stroke}
      />

      <PickerModal
        visible={showIntensityPicker}
        onClose={() => setShowIntensityPicker(false)}
        title={t('sessions.selectIntensity')}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  /* backButton removed: header now relies on navigation header back control */
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
  },
  placeholderText: {
  },
  submitButton: {
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    padding: 16,
    borderBottomWidth: 1,
  },
  selectedOption: {
  },
  optionText: {
    fontSize: 16,
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  resetButton: {
    padding: 8,
    borderRadius: 8,
  },
  successMessage: {
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
  },
});

import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import BackButton from '../../_ui/BackButton';
import PickerModal from '../../_ui/PickerModal';
import { apiService } from '../../../services/api';

// Define enums locally to avoid import issues
enum WorkoutType {
  WARMUP = 'WARMUP',
  MAIN_SET = 'MAIN_SET',
  COOLDOWN = 'COOLDOWN',
  TECHNIQUE = 'TECHNIQUE',
  SPRINT = 'SPRINT',
  ENDURANCE = 'ENDURANCE',
  KICK = 'KICK',
  PULL = 'PULL',
}

enum Stroke {
  FREESTYLE = 'FREESTYLE',
  BACKSTROKE = 'BACKSTROKE',
  BREASTSTROKE = 'BREASTSTROKE',
  BUTTERFLY = 'BUTTERFLY',
  INDIVIDUAL_MEDLEY = 'INDIVIDUAL_MEDLEY',
  MIXED = 'MIXED',
}

enum Intensity {
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  HARD = 'HARD',
  RACE_PACE = 'RACE_PACE',
}

interface Session {
  id: string;
  title: string;
  date: string;
  distance?: number;
  duration: number;
  workoutType?: string;
  stroke?: string;
  intensity?: string;
  description?: string;
}

export default function EditSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalSession, setOriginalSession] = useState<Session | null>(null);
  const [showWorkoutTypePicker, setShowWorkoutTypePicker] = useState(false);
  const [showStrokePicker, setShowStrokePicker] = useState(false);
  const [showIntensityPicker, setShowIntensityPicker] = useState(false);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [workoutType, setWorkoutType] = useState<WorkoutType | ''>('');
  const [stroke, setStroke] = useState<Stroke | ''>('');
  const [intensity, setIntensity] = useState<Intensity | ''>('');

  // Enum options
  const workoutTypes = [
    { label: 'Select workout type...', value: '' },
    { label: 'Warm-up', value: WorkoutType.WARMUP },
    { label: 'Main Set', value: WorkoutType.MAIN_SET },
    { label: 'Cool-down', value: WorkoutType.COOLDOWN },
    { label: 'Technique', value: WorkoutType.TECHNIQUE },
    { label: 'Sprint', value: WorkoutType.SPRINT },
    { label: 'Endurance', value: WorkoutType.ENDURANCE },
    { label: 'Kick', value: WorkoutType.KICK },
    { label: 'Pull', value: WorkoutType.PULL },
  ];

  const strokes = [
    { label: 'Select stroke...', value: '' },
    { label: 'Freestyle', value: Stroke.FREESTYLE },
    { label: 'Backstroke', value: Stroke.BACKSTROKE },
    { label: 'Breaststroke', value: Stroke.BREASTSTROKE },
    { label: 'Butterfly', value: Stroke.BUTTERFLY },
    { label: 'Individual Medley', value: Stroke.INDIVIDUAL_MEDLEY },
    { label: 'Mixed', value: Stroke.MIXED },
  ];

  const intensities = [
    { label: 'Select intensity...', value: '' },
    { label: 'Easy', value: Intensity.EASY },
    { label: 'Moderate', value: Intensity.MODERATE },
    { label: 'Hard', value: Intensity.HARD },
    { label: 'Race Pace', value: Intensity.RACE_PACE },
  ];

  useEffect(() => {
    if (id) {
      loadSession();
    }
  }, [id]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSession(id!);
      if (response.data) {
        const session = response.data as Session;
        setOriginalSession(session);
        
        // Populate form fields
        setTitle(session.title);
        setDescription(session.description || '');
        setDate(session.date.split('T')[0]); // Extract date part
        setDuration(session.duration.toString());
        setDistance(session.distance?.toString() || '');
        setWorkoutType(session.workoutType as WorkoutType || '');
        setStroke(session.stroke as Stroke || '');
        setIntensity(session.intensity as Intensity || '');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      if (typeof window !== 'undefined') {
        window.alert('Failed to load session details');
      }
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      if (typeof window !== 'undefined') {
        window.alert('Please enter a session title');
      }
      return;
    }

    if (!date) {
      if (typeof window !== 'undefined') {
        window.alert('Please select a date');
      }
      return;
    }

    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      if (typeof window !== 'undefined') {
        window.alert('Please enter a valid duration');
      }
      return;
    }

    try {
      setSaving(true);

      const sessionData = {
        title: title.trim(),
        description: description.trim() || undefined,
        date: new Date(date).toISOString(),
        duration: Number(duration),
        distance: distance ? Number(distance) : undefined,
        workoutType: workoutType || undefined,
        stroke: stroke || undefined,
        intensity: intensity || undefined,
      };

      await apiService.updateSession(id!, sessionData);
      
      if (typeof window !== 'undefined') {
        window.alert('Session updated successfully!');
      }
      
      // Navigate back to session details
      router.replace(`/session/${id}`);
    } catch (error) {
      console.error('Error updating session:', error);
      if (typeof window !== 'undefined') {
        window.alert('Failed to update session. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading session...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Edit Session</Text>
          <Text style={styles.headerSubtitle}>Update your training details</Text>
        </View>
      </View>

      <View style={styles.form}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Session Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Morning Freestyle Training"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date *</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
          />
        </View>

        {/* Duration and Distance Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Duration (minutes) *</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="60"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Distance (meters)</Text>
            <TextInput
              style={styles.input}
              value={distance}
              onChangeText={setDistance}
              placeholder="2000"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Workout Type */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Workout Type</Text>
          <Text style={styles.helperText}>Choose one option</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowWorkoutTypePicker(true)}>
            <Text style={styles.pickerText}>{workoutType ? workoutTypes.find(t => t.value === workoutType)?.label : 'Select workout type...'}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Stroke */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Primary Stroke</Text>
          <Text style={styles.helperText}>Choose one option</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowStrokePicker(true)}>
            <Text style={styles.pickerText}>{stroke ? strokes.find(s => s.value === stroke)?.label : 'Select stroke...'}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Intensity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Intensity Level</Text>
          <Text style={styles.helperText}>Choose one option</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => setShowIntensityPicker(true)}>
            <Text style={styles.pickerText}>{intensity ? intensities.find(i => i.value === intensity)?.label : 'Select intensity...'}</Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add session notes, goals, or observations..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.disabledButton]} 
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Updating...' : 'Update Session'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <PickerModal
        visible={showWorkoutTypePicker}
        onClose={() => setShowWorkoutTypePicker(false)}
        title="Select Workout Type"
        options={workoutTypes}
        onSelect={(value) => setWorkoutType(value as WorkoutType)}
        selectedValue={workoutType}
      />

      <PickerModal
        visible={showStrokePicker}
        onClose={() => setShowStrokePicker(false)}
        title="Select Primary Stroke"
        options={strokes}
        onSelect={(value) => setStroke(value as Stroke)}
        selectedValue={stroke}
      />

      <PickerModal
        visible={showIntensityPicker}
        onClose={() => setShowIntensityPicker(false)}
        title="Select Intensity"
        options={intensities}
        onSelect={(value) => setIntensity(value as Intensity)}
        selectedValue={intensity}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backIcon: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  form: {
    padding: 20,
    paddingTop: 10,
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    flex: 0.48,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b7280',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  pickerButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#1f2937',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    marginBottom: 8,
  },
  optionsScroll: {
    marginTop: 8,
  },
  optionChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedChip: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  optionList: {
    marginTop: 8,
    flexDirection: 'column',
    gap: 8,
  },
  optionItem: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedItem: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedText: {
    color: 'white',
  },
});

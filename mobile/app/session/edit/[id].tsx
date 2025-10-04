import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
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
  const [isOwner, setIsOwner] = useState<boolean>(false);
  
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
      // Fetch session and profile together to check ownership
      const [sessionResp, profileResp] = await Promise.all([
        apiService.getSession(id!),
        apiService.getProfile().catch(() => null),
      ]);

      if (sessionResp?.data) {
        const session = sessionResp.data as Session;
        setOriginalSession(session);

        // Resolve current user id
        const currentUser = profileResp && (profileResp as any).user ? (profileResp as any).user : (profileResp as any).data || null;
        if (currentUser && currentUser.id) {
          const owner = currentUser.id === (session as any).user?.id || false;
          setIsOwner(owner);
          if (!owner) {
            // Not allowed to edit other users' sessions
            if (typeof window !== 'undefined') {
              window.alert('You do not have permission to edit this session.');
            } else {
              Alert.alert('Permission denied', 'You do not have permission to edit this session.');
            }
            router.back();
            return;
          }
        } else {
          // If we can't determine current user, be conservative and block editing
          if (typeof window !== 'undefined') {
            window.alert('Unable to verify permissions for editing this session.');
          } else {
            Alert.alert('Permission', 'Unable to verify permissions for editing this session.');
          }
          router.back();
          return;
        }

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

    if (!isOwner) {
      if (typeof window !== 'undefined') {
        window.alert('You do not have permission to edit this session.');
      } else {
        Alert.alert('Permission denied', 'You do not have permission to edit this session.');
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
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
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
          <TouchableOpacity style={styles.pickerButton}>
            <Text style={styles.pickerText}>
              {workoutType ? workoutTypes.find(t => t.value === workoutType)?.label : 'Select workout type...'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Tap to cycle through options</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {workoutTypes.slice(1).map((type) => (
              <TouchableOpacity 
                key={type.value} 
                style={[styles.optionChip, workoutType === type.value && styles.selectedChip]}
                onPress={() => setWorkoutType(type.value as WorkoutType)}
              >
                <Text style={[styles.optionText, workoutType === type.value && styles.selectedText]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stroke */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Primary Stroke</Text>
          <TouchableOpacity style={styles.pickerButton}>
            <Text style={styles.pickerText}>
              {stroke ? strokes.find(s => s.value === stroke)?.label : 'Select stroke...'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Tap to cycle through options</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {strokes.slice(1).map((strokeOption) => (
              <TouchableOpacity 
                key={strokeOption.value} 
                style={[styles.optionChip, stroke === strokeOption.value && styles.selectedChip]}
                onPress={() => setStroke(strokeOption.value as Stroke)}
              >
                <Text style={[styles.optionText, stroke === strokeOption.value && styles.selectedText]}>
                  {strokeOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Intensity */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Intensity Level</Text>
          <TouchableOpacity style={styles.pickerButton}>
            <Text style={styles.pickerText}>
              {intensity ? intensities.find(i => i.value === intensity)?.label : 'Select intensity...'}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>Tap to cycle through options</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll}>
            {intensities.slice(1).map((intensityOption) => (
              <TouchableOpacity 
                key={intensityOption.value} 
                style={[styles.optionChip, intensity === intensityOption.value && styles.selectedChip]}
                onPress={() => setIntensity(intensityOption.value as Intensity)}
              >
                <Text style={[styles.optionText, intensity === intensityOption.value && styles.selectedText]}>
                  {intensityOption.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
  optionText: {
    fontSize: 14,
    color: '#374151',
  },
  selectedText: {
    color: 'white',
  },
});

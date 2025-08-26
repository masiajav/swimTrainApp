export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  members: User[];
}

export interface Session {
  id: string;
  title: string;
  description?: string;
  date: Date;
  duration: number; // in minutes
  distance?: number; // in meters
  userId: string;
  teamId?: string;
  workouts: Workout[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Workout {
  id: string;
  type: WorkoutType;
  distance: number; // in meters
  time?: number; // in seconds
  sets?: number;
  reps?: number;
  restTime?: number; // in seconds
  stroke?: Stroke;
  intensity?: Intensity;
  notes?: string;
  sessionId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum WorkoutType {
  WARMUP = 'WARMUP',
  MAIN_SET = 'MAIN_SET',
  COOLDOWN = 'COOLDOWN',
  TECHNIQUE = 'TECHNIQUE',
  SPRINT = 'SPRINT',
  ENDURANCE = 'ENDURANCE',
  KICK = 'KICK',
  PULL = 'PULL',
}

export enum Stroke {
  FREESTYLE = 'FREESTYLE',
  BACKSTROKE = 'BACKSTROKE',
  BREASTSTROKE = 'BREASTSTROKE',
  BUTTERFLY = 'BUTTERFLY',
  INDIVIDUAL_MEDLEY = 'INDIVIDUAL_MEDLEY',
  MIXED = 'MIXED',
}

export enum Intensity {
  EASY = 'EASY',
  MODERATE = 'MODERATE',
  HARD = 'HARD',
  RACE_PACE = 'RACE_PACE',
  RECOVERY = 'RECOVERY',
}

// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse } from '../../shared/types';
import { Platform } from 'react-native';

// Determine an API base the device can reach. On device, localhost won't work when using
// the emulator or physical device; prefer a runtime override via process.env or Expo Constants.
// Resolve API_BASE_URL with the following precedence:
// 1. If running in production (not __DEV__), prefer a configured value from
//    Expo Constants extra (app.json -> expo.extra.API_BASE_URL) or process.env.
// 2. If running in dev, try the debugger host LAN address so the device can
//    reach the backend on your machine.
// 3. When on Android emulator fall back to 10.0.2.2.
let API_BASE_URL = 'http://localhost:3000/api';
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Constants = require('expo-constants');
  const manifest = Constants?.manifest ?? Constants?.expoConfig ?? {};
  const extra = manifest?.extra ?? {};

  // Production builds (disable dev-only loopbacks)
  // NOTE: for production we prefer a public HTTPS host. If you plan to use
  // Supabase Edge Functions for the token-exchange and user provisioning,
  // point this at your Supabase project URL (we will call the function
  // /functions/v1/google-auth from the mobile app).
  const defaultProdUrl = 'https://pkrtqzsudfeehwufyduy.supabase.co';
  if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    API_BASE_URL = extra?.API_BASE_URL || process.env?.API_BASE_URL || defaultProdUrl;
  } else {
    // Dev: prefer debuggerHost LAN address when present (so device uses machine IP)
    const debuggerHost = manifest?.debuggerHost as string | undefined;
    if (debuggerHost) {
      const host = debuggerHost.split(':')[0];
      API_BASE_URL = `http://${host}:3000/api`;
    }

    // Android emulator fallback
    try {
      if (Platform.OS === 'android') {
        if (!API_BASE_URL || API_BASE_URL.includes('localhost')) {
          API_BASE_URL = 'http://10.0.2.2:3000/api';
        }
      }
    } catch (e) {
      // ignore if Platform is unavailable
    }
  }
} catch (e) {
  // If anything goes wrong reading Constants, keep the default localhost dev URL
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const defaultHeaders = {
        'Content-Type': 'application/json',
      };

      const url = `${API_BASE_URL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response as AuthResponse;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response as AuthResponse;
  }

  async googleAuth(token: string): Promise<AuthResponse> {
    // Debug: log token being exchanged and response from backend
    // eslint-disable-next-line no-console
    console.log('[ApiService] googleAuth exchanging token:', token?.slice ? token.slice(0, 8) + '...' : token);
    // If we're targeting Supabase in production, prefer the Edge Function
    // endpoint which lives under /functions/v1/google-auth
    try {
      if (API_BASE_URL.includes('supabase.co')) {
        const fnUrl = `${API_BASE_URL.replace(/\/$/, '')}/functions/v1/google-auth`;
        // Supabase Functions require the 'Content-Type' header and typically
        // accept JSON bodies.
        const res = await fetch(fnUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Function request failed');
        // eslint-disable-next-line no-console
        console.log('[ApiService] googleAuth response =', data);
        return data as AuthResponse;
      }
    } catch (e) {
      // Fall back to existing backend path if function call fails
      // eslint-disable-next-line no-console
      console.warn('[ApiService] Supabase function call failed, falling back to /auth/google', e);
    }

    const response = await this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    // eslint-disable-next-line no-console
    console.log('[ApiService] googleAuth response =', response);
    return response as AuthResponse;
  }

  // Helper to set auth token for authenticated requests
  setAuthToken(token: string) {
    this.authToken = token;
    // Persist token to localStorage for web
    try {
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        (window as any).localStorage.setItem('authToken', token);
      }
    } catch (e) {
      // localStorage not available (React Native). Token stays in-memory.
    }
  }

  // Helper to get auth token from storage
  getStoredAuthToken(): string | null {
    if (this.authToken) return this.authToken;
    
    // Try to get from localStorage for web (safe accessor)
    try {
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        const storedToken = (window as any).localStorage.getItem('authToken');
        if (storedToken) {
          this.authToken = storedToken;
          return storedToken;
        }
      }
    } catch (e) {
      // localStorage not available (React Native)
    }
    return null;
  }

  // Helper to clear auth token
  clearAuthToken() {
    this.authToken = null;
    try {
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        (window as any).localStorage.removeItem('authToken');
      }
    } catch (e) {
      // localStorage not available
    }
  }

  // Helper to get current auth token
  getAuthToken(): string | null {
    return this.getStoredAuthToken();
  }

  private authToken: string | null = null;

  private getAuthHeaders(): Record<string, string> {
    const token = this.getStoredAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Sessions endpoints
  async getSessions() {
    const response = await this.request('/sessions', {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
      },
    });
    return response;
  }

  async createSession(sessionData: {
    title: string;
    description?: string;
    date: string;
    duration: number;
    distance?: number;
    workoutType?: string;
    stroke?: string;
    intensity?: string;
  }) {
    console.log('Creating session with data:', sessionData);
    console.log('Auth token:', this.authToken ? 'Present' : 'Missing');
    
    const response = await this.request('/sessions', {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(sessionData),
    });
    
    console.log('Create session response:', response);
    return response;
  }

  async getSession(id: string) {
    const response = await this.request(`/sessions/${id}`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
      },
    });
    return response;
  }

  async updateSession(id: string, sessionData: {
    title: string;
    description?: string;
    date: string;
    duration: number;
    distance?: number;
    workoutType?: string;
    stroke?: string;
    intensity?: string;
  }) {
    const response = await this.request(`/sessions/${id}`, {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(sessionData),
    });
    return response;
  }

  async deleteSession(id: string) {
    const response = await this.request(`/sessions/${id}`, {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    });
    return response;
  }

  // Team endpoints
  async getTeam() {
    const response = await this.request('/teams', {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
      },
    });
    return response;
  }

  async createTeam(teamData: {
    name: string;
    description?: string;
    avatar?: string;
  }) {
    const response = await this.request('/teams', {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(teamData),
    });
    return response;
  }

  async joinTeam(inviteCode: string) {
    const response = await this.request('/teams/join', {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify({ inviteCode }),
    });
    return response;
  }

  async leaveTeam() {
    const response = await this.request('/teams/leave', {
      method: 'DELETE',
      headers: {
        ...this.getAuthHeaders(),
      },
    });
    return response;
  }

  async getTeamStats() {
    const response = await this.request('/teams/stats', {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
      },
    });
    return response;
  }

  // Profile endpoints
  async getProfile() {
    const response = await this.request('/auth/profile', {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
      },
    });
    return response;
  }

  async updateProfile(profileData: {
    firstName?: string;
    lastName?: string;
    username: string;
    avatar?: string;
  }) {
    const response = await this.request('/auth/profile', {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(profileData),
    });
    return response;
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    const response = await this.request('/auth/change-password', {
      method: 'PUT',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(passwordData),
    });
    return response;
  }

  // User profile endpoints
  async getTeamMemberProfile(userId: string) {
    const response = await this.request(`/users/${userId}/profile`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
      },
    });
    return response;
  }

  async logout() {
    // Clear stored token
    try {
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        (window as any).localStorage.removeItem('authToken');
      }
    } catch (e) {
      // localStorage not available
    }
    // You could also call a logout endpoint if needed
    return Promise.resolve();
  }
}

export const apiService = new ApiService();

// Debug: print resolved API base for emulator/dev-client visibility
try {
  // eslint-disable-next-line no-console
  console.log('[ApiService] API_BASE_URL =', API_BASE_URL);
} catch (e) {}

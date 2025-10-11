import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse } from '../../shared/types';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Determine an API base the device can reach. On device, localhost won't work when using
// the emulator or physical device; prefer a runtime override via process.env or Expo Constants.
// Resolve API_BASE_URL with the following precedence:
// 1. If running in production (not __DEV__), prefer a configured value from
//    Expo Constants extra (app.json -> expo.extra.API_BASE_URL) or process.env.
// 2. If running in dev, try the debugger host LAN address so the device can
//    reach the backend on your machine.
// 3. When on Android emulator fall back to 10.0.2.2.
// TODO: make a refactor to centralize this logic with Supabase client init
let API_BASE_URL = 'https://swimtrainapp-production.up.railway.app/api';
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
  const defaultProdUrl = 'https://swimtrainapp-production.up.railway.app/api';

  // Allow an explicit override coming from app.json (Expo Constants extra)
  // or process.env to take precedence even when running in dev. This is
  // useful for testing the published backend (Railway) while running the
  // app locally with Expo/Metro.
  const explicitApi = extra?.API_BASE_URL || process.env?.API_BASE_URL;
  if (explicitApi) {
    API_BASE_URL = explicitApi;
  } else if (typeof __DEV__ !== 'undefined' && !__DEV__) {
    API_BASE_URL = defaultProdUrl;
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

const AUTH_TOKEN_KEY = 'authToken';
const AUTO_LOGIN_KEY = 'autoLoginEnabled';
const DID_LOGOUT_KEY = 'didLogout';

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
  // eslint-disable-next-line no-console
  console.log('[ApiService] request ->', options.method || 'GET', url);

  const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if token is expired/invalid - auto-logout and redirect
        if (response.status === 403 && data.error?.toLowerCase().includes('token')) {
          console.warn('⚠️ [ApiService] Token expired or invalid - auto logging out');
          await this.logout();
          // Dynamic import to avoid circular dependency
          const { router } = await import('expo-router');
          router.replace('/auth/login');
        }
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
    // Debug: token set
    // eslint-disable-next-line no-console
    console.log('[ApiService] setAuthToken called, token present:', !!token);
    // Clear the "did logout" flag when the user explicitly logs in
    try {
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        (window as any).localStorage.removeItem(DID_LOGOUT_KEY);
      }
      // Persist token only if auto-login is enabled
      (async () => {
        try {
          if (Platform.OS === 'web') {
            const auto = (typeof window !== 'undefined' && (window as any).localStorage)
              ? (window as any).localStorage.getItem(AUTO_LOGIN_KEY) === 'true'
              : false;
            if (auto) {
              (window as any).localStorage.setItem(AUTH_TOKEN_KEY, token);
              // eslint-disable-next-line no-console
              console.log('[ApiService] persisted auth token to localStorage (web)');
            }
          } else {
            const auto = await AsyncStorage.getItem(AUTO_LOGIN_KEY);
            if (auto === 'true') {
              await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
              // eslint-disable-next-line no-console
              console.log('[ApiService] persisted auth token to AsyncStorage (native)');
            }
            // Clear didLogout flag
            await AsyncStorage.removeItem(DID_LOGOUT_KEY);
            // eslint-disable-next-line no-console
            console.log('[ApiService] cleared DID_LOGOUT flag in AsyncStorage');
          }
        } catch (e) {
          // ignore persistence errors
        }
      })();
    } catch (e) {
      // ignore
    }
  }

  // Helper to get auth token from storage
  getStoredAuthToken(): string | null {
    // Prefer in-memory token
    if (this.authToken) return this.authToken;

    // For web, only return stored token if auto-login is enabled and user did not explicitly logout
    try {
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        const didLogout = (window as any).localStorage.getItem(DID_LOGOUT_KEY) === 'true';
        const auto = (window as any).localStorage.getItem(AUTO_LOGIN_KEY) === 'true';
        // eslint-disable-next-line no-console
        console.log('[ApiService] getStoredAuthToken (web) didLogout=', didLogout, 'auto=', auto);
        if (!didLogout && auto) {
          const storedToken = (window as any).localStorage.getItem(AUTH_TOKEN_KEY);
          if (storedToken) {
            this.authToken = storedToken;
            // eslint-disable-next-line no-console
            console.log('[ApiService] loaded token from localStorage (web)');
            return storedToken;
          }
        }
      }
    } catch (e) {
      // localStorage not available (React Native)
    }

    // On native platforms we rely on explicit initialization that loads
    // the token into memory at app startup (apiService.initialize()).
    return null;
  }

  // Helper to clear auth token
  clearAuthToken() {
    this.authToken = null;
    try {
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        (window as any).localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    } catch (e) {
      // ignore
    }
    // Also remove from AsyncStorage (native)
    (async () => {
      try {
        await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      } catch (e) {
        // ignore
      }
    })();
  }

  // Helper to get current auth token
  getAuthToken(): string | null {
    return this.getStoredAuthToken();
  }

  private authToken: string | null = null;

  private getAuthHeaders(): Record<string, string> {
    const token = this.getStoredAuthToken();
    // eslint-disable-next-line no-console
    console.log('[ApiService] getAuthHeaders — token present:', !!token);
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

  // Request a password reset email (backend will call Supabase)
  async requestPasswordReset(email: string) {
    if (!email) throw new Error('Email is required');
    const response = await this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
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
    // When the user explicitly logs out we must:
    // - clear any stored token
    // - remember that the user explicitly logged out (so auto-login won't re-auth)
  this.authToken = null;
  // eslint-disable-next-line no-console
  console.log('[ApiService] logout called — cleared in-memory token and will mark DID_LOGOUT');
    try {
      if (typeof window !== 'undefined' && (window as any).localStorage) {
        (window as any).localStorage.removeItem(AUTH_TOKEN_KEY);
        (window as any).localStorage.setItem(DID_LOGOUT_KEY, 'true');
      }
    } catch (e) {
      // ignore
    }
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
      await AsyncStorage.setItem(DID_LOGOUT_KEY, 'true');
      // eslint-disable-next-line no-console
      console.log('[ApiService] logout: removed token and set DID_LOGOUT in AsyncStorage');
    } catch (e) {
      // ignore
    }

    return Promise.resolve();
  }

  // Initialize apiService on app startup: load persisted token into memory
  async initialize() {
    try {
      // eslint-disable-next-line no-console
      console.log('[ApiService] initialize: starting');
      if (Platform.OS === 'web') {
        const didLogout = (typeof window !== 'undefined' && (window as any).localStorage)
          ? (window as any).localStorage.getItem(DID_LOGOUT_KEY) === 'true'
          : true;
        const auto = (typeof window !== 'undefined' && (window as any).localStorage)
          ? (window as any).localStorage.getItem(AUTO_LOGIN_KEY) === 'true'
          : false;
        // eslint-disable-next-line no-console
        console.log('[ApiService] initialize (web): didLogout=', didLogout, 'auto=', auto);
        if (!didLogout && auto) {
          const stored = (window as any).localStorage.getItem(AUTH_TOKEN_KEY);
          if (stored) {
            this.authToken = stored;
            // eslint-disable-next-line no-console
            console.log('[ApiService] initialize: loaded token from localStorage (web)');
          }
        }
      } else {
        const [didLogout, auto, stored] = await Promise.all([
          AsyncStorage.getItem(DID_LOGOUT_KEY),
          AsyncStorage.getItem(AUTO_LOGIN_KEY),
          AsyncStorage.getItem(AUTH_TOKEN_KEY),
        ]);
        // eslint-disable-next-line no-console
        console.log('[ApiService] initialize (native): didLogout=', didLogout, 'auto=', auto, 'stored present=', !!stored);
        if (auto === 'true' && didLogout !== 'true' && stored) {
          this.authToken = stored;
          // eslint-disable-next-line no-console
          console.log('[ApiService] initialize: loaded token from AsyncStorage (native)');
        }
      }
      // eslint-disable-next-line no-console
      console.log('[ApiService] initialize: complete. in-memory token present=', !!this.authToken);
    } catch (e) {
      // ignore
    }
  }

  async setAutoLoginEnabled(enabled: boolean) {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && (window as any).localStorage) {
          (window as any).localStorage.setItem(AUTO_LOGIN_KEY, enabled ? 'true' : 'false');
          if (enabled && this.authToken) {
            (window as any).localStorage.setItem(AUTH_TOKEN_KEY, this.authToken);
          }
          if (!enabled) {
            (window as any).localStorage.removeItem(AUTH_TOKEN_KEY);
          }
        }
      } else {
        await AsyncStorage.setItem(AUTO_LOGIN_KEY, enabled ? 'true' : 'false');
        if (enabled && this.authToken) {
          await AsyncStorage.setItem(AUTH_TOKEN_KEY, this.authToken);
        }
        if (!enabled) {
          await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  async getAutoLoginEnabled(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && (window as any).localStorage) {
          return (window as any).localStorage.getItem(AUTO_LOGIN_KEY) === 'true';
        }
        return false;
      } else {
        const v = await AsyncStorage.getItem(AUTO_LOGIN_KEY);
        return v === 'true';
      }
    } catch (e) {
      return false;
    }
  }
}

export const apiService = new ApiService();

// Debug: print resolved API base for emulator/dev-client visibility
try {
  // eslint-disable-next-line no-console
  console.log('[ApiService] API_BASE_URL =', API_BASE_URL);
} catch (e) {}

import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse } from '../../shared/types';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const defaultHeaders = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
    const response = await this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    return response as AuthResponse;
  }

  // Helper to set auth token for authenticated requests
  setAuthToken(token: string) {
    this.authToken = token;
    // Persist token to localStorage for web
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  // Helper to get auth token from storage
  getStoredAuthToken(): string | null {
    if (this.authToken) return this.authToken;
    
    // Try to get from localStorage for web
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        this.authToken = storedToken;
        return storedToken;
      }
    }
    return null;
  }

  // Helper to clear auth token
  clearAuthToken() {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
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

  async logout() {
    // Clear stored token
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
    // You could also call a logout endpoint if needed
    return Promise.resolve();
  }
}

export const apiService = new ApiService();

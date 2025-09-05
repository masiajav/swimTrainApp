import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse } from '../../shared/types';

const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
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
  }

  private authToken: string | null = null;

  private getAuthHeaders() {
    return this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {};
  }
}

export const apiService = new ApiService();

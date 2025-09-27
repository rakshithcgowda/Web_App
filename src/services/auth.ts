import type { User, LoginCredentials, RegisterData, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/utils/constants';

class AuthService {
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        if (data.data?.token) {
          localStorage.setItem('auth_token', data.data.token);
        }
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async register(registerData: RegisterData): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found',
        };
      }

      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.ME}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.LOGOUT}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.removeToken();
    }
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

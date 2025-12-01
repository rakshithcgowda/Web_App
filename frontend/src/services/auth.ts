import type { User, LoginCredentials, RegisterData, ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/utils/constants';

class AuthService {
  private baseURL: string;

  constructor() {
    // In production on Vercel, use relative paths (same origin)
    // Only use VITE_API_URL if explicitly set (for custom API server)
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && apiUrl !== '') {
      this.baseURL = apiUrl;
    } else {
      // Use relative paths when frontend and backend are on same domain
      this.baseURL = '';
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`;
      console.log('Login request to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        // Try to parse error response
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            success: false,
            message: `Server error: ${response.status} ${response.statusText}`,
          };
        }
        return errorData;
      }

      const data = await response.json();

      if (data.success && data.data?.token) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.data.token);
      }

      return data;
    } catch (error) {
      console.error('Login network error:', error);
      return {
        success: false,
        message: error instanceof Error 
          ? `Network error: ${error.message}. Please check your connection and try again.`
          : 'Network error occurred. Please check your connection and try again.',
      };
    }
  }

  async register(registerData: RegisterData): Promise<ApiResponse<{ user: User }>> {
    try {
      const url = `${this.baseURL}${API_ENDPOINTS.AUTH.REGISTER}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            success: false,
            message: `Server error: ${response.status} ${response.statusText}`,
          };
        }
        return errorData;
      }

      return await response.json();
    } catch (error) {
      console.error('Register network error:', error);
      return {
        success: false,
        message: error instanceof Error 
          ? `Network error: ${error.message}. Please check your connection and try again.`
          : 'Network error occurred. Please check your connection and try again.',
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

      const url = `${this.baseURL}${API_ENDPOINTS.AUTH.ME}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = {
            success: false,
            message: `Server error: ${response.status} ${response.statusText}`,
          };
        }
        return errorData;
      }

      return await response.json();
    } catch (error) {
      console.error('Get current user network error:', error);
      return {
        success: false,
        message: error instanceof Error 
          ? `Network error: ${error.message}. Please check your connection and try again.`
          : 'Network error occurred. Please check your connection and try again.',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        const url = `${this.baseURL}${API_ENDPOINTS.AUTH.LOGOUT}`;
        await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          credentials: 'include',
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

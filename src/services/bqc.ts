import type { BQCData, SavedBQCEntry, ApiResponse, DocumentGenerationRequest } from '@/types';
import { API_ENDPOINTS } from '@/utils/constants';
import { authService } from './auth';

class BQCService {
  private baseURL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://localhost:3002');

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = authService.getToken();
    
    return fetch(`${this.baseURL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });
  }

  async saveBQCData(data: BQCData): Promise<ApiResponse<{ id: number }>> {
    try {
      const response = await this.makeAuthenticatedRequest(API_ENDPOINTS.BQC.SAVE, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async loadBQCData(id: number): Promise<ApiResponse<BQCData>> {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_ENDPOINTS.BQC.LOAD}/${id}`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async listBQCData(): Promise<ApiResponse<SavedBQCEntry[]>> {
    try {
      const response = await this.makeAuthenticatedRequest(API_ENDPOINTS.BQC.LIST);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async deleteBQCData(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await this.makeAuthenticatedRequest(`${API_ENDPOINTS.BQC.DELETE}/${id}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async generateDocument(request: DocumentGenerationRequest): Promise<ApiResponse<{ blob: Blob; filename: string }>> {
    try {
      const response = await this.makeAuthenticatedRequest(API_ENDPOINTS.BQC.GENERATE, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to generate document',
        };
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `BQC_${request.data.refNumber || 'document'}_${new Date().toISOString().split('T')[0]}.docx`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      return {
        success: true,
        data: { blob, filename }
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async downloadDocument(downloadUrl: string, filename: string): Promise<void> {
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download document');
    }
  }
}

export const bqcService = new BQCService();

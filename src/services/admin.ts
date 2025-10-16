import type { ApiResponse } from '@/types';
import { API_ENDPOINTS } from '@/utils/constants';
import { authService } from './auth';

export interface AdminStats {
  totalBQCs: number;
  totalUsers: number;
  totalValue: number;
  avgValue: number;
  goodsCount: number;
  serviceCount: number;
  worksCount: number;
  leastCashOutflowCount: number;
  lotWiseCount: number;
}

export interface GroupStats {
  group_name: string;
  count: number;
  totalValue: number;
  avgValue: number;
  goodsCount: number;
  serviceCount: number;
  worksCount: number;
}

export interface DateRangeStats {
  period: string;
  count: number;
  totalValue: number;
}

export interface UserStats {
  totalUsers: number;
  newUsersLast30Days: number;
  newUsersLast7Days: number;
}

export interface TenderTypeStats {
  tender_type: string;
  count: number;
  totalValue: number;
  avgValue: number;
}

export interface FinancialStats {
  totalValue: number;
  avgValue: number;
  minValue: number;
  maxValue: number;
  under1Lakh: number;
  between1LakhAnd10Lakh: number;
  between10LakhAnd1Crore: number;
  above1Crore: number;
}

export interface BQCEntry {
  id: number;
  ref_number: string;
  group_name: string;
  subject: string;
  tender_description: string;
  tender_type: string;
  cec_estimate_incl_gst: number;
  created_at: string;
  username: string;
  full_name: string;
}

export interface BQCEntriesResponse {
  entries: BQCEntry[];
  total: number;
  totalPages: number;
}

class AdminService {
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

  async getStatsOverview(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
  } = {}): Promise<ApiResponse<AdminStats>> {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.groupName) params.append('groupName', filters.groupName);

      const response = await this.makeAuthenticatedRequest(
        `${API_ENDPOINTS.ADMIN.STATS_OVERVIEW}?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async getGroupStats(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
  } = {}): Promise<ApiResponse<GroupStats[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.groupName) params.append('groupName', filters.groupName);

      const response = await this.makeAuthenticatedRequest(
        `${API_ENDPOINTS.ADMIN.STATS_GROUPS}?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async getDateRangeStats(filters: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  } = {}): Promise<ApiResponse<DateRangeStats[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.groupBy) params.append('groupBy', filters.groupBy);

      const response = await this.makeAuthenticatedRequest(
        `${API_ENDPOINTS.ADMIN.STATS_DATE_RANGE}?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async getUserStats(): Promise<ApiResponse<UserStats>> {
    try {
      const response = await this.makeAuthenticatedRequest(API_ENDPOINTS.ADMIN.STATS_USERS);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async getTenderTypeStats(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
  } = {}): Promise<ApiResponse<TenderTypeStats[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.groupName) params.append('groupName', filters.groupName);

      const response = await this.makeAuthenticatedRequest(
        `${API_ENDPOINTS.ADMIN.STATS_TENDER_TYPES}?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async getFinancialStats(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
  } = {}): Promise<ApiResponse<FinancialStats>> {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.groupName) params.append('groupName', filters.groupName);

      const response = await this.makeAuthenticatedRequest(
        `${API_ENDPOINTS.ADMIN.STATS_FINANCIAL}?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async getBQCEntries(filters: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    groupName?: string;
    tenderType?: string;
    search?: string;
  } = {}): Promise<ApiResponse<BQCEntriesResponse>> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.groupName) params.append('groupName', filters.groupName);
      if (filters.tenderType) params.append('tenderType', filters.tenderType);
      if (filters.search) params.append('search', filters.search);

      const response = await this.makeAuthenticatedRequest(
        `${API_ENDPOINTS.ADMIN.BQC_ENTRIES}?${params.toString()}`
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Network error occurred. Please try again.',
      };
    }
  }

  async exportData(filters: {
    startDate?: string;
    endDate?: string;
    groupName?: string;
    format?: 'csv' | 'excel';
  } = {}): Promise<void> {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.groupName) params.append('groupName', filters.groupName);
      if (filters.format) params.append('format', filters.format);

      const response = await this.makeAuthenticatedRequest(
        `${API_ENDPOINTS.ADMIN.EXPORT}?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bqc-data-${new Date().toISOString().split('T')[0]}.${filters.format || 'csv'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      throw new Error('Failed to export data');
    }
  }
}

export const adminService = new AdminService();

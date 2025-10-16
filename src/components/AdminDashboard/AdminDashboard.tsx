import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { adminService, type AdminStats, type GroupStats, type DateRangeStats, type UserStats, type TenderTypeStats, type FinancialStats } from '@/services/admin';
import { GROUP_OPTIONS } from '@/utils/constants';
import StatsOverview from './StatsOverview';
import GroupStatsChart from './GroupStatsChart';
import DateRangeChart from './DateRangeChart';
import TenderTypeChart from './TenderTypeChart';
import FinancialStatsCard from './FinancialStatsCard';
import BQCEntriesTable from './BQCEntriesTable';
import DateRangeFilter from './DateRangeFilter';
import { LoadingSkeleton } from '../LoadingSkeleton';

interface AdminDashboardProps {
  className?: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ className = '' }) => {
  const [statsOverview, setStatsOverview] = useState<AdminStats | null>(null);
  const [groupStats, setGroupStats] = useState<GroupStats[]>([]);
  const [dateRangeStats, setDateRangeStats] = useState<DateRangeStats[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [tenderTypeStats, setTenderTypeStats] = useState<TenderTypeStats[]>([]);
  const [financialStats, setFinancialStats] = useState<FinancialStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    groupName: '',
    groupBy: 'day' as 'day' | 'week' | 'month'
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [
        overviewResponse,
        groupResponse,
        dateRangeResponse,
        userResponse,
        tenderTypeResponse,
        financialResponse
      ] = await Promise.all([
        adminService.getStatsOverview(filters),
        adminService.getGroupStats(filters),
        adminService.getDateRangeStats({ ...filters, groupBy: filters.groupBy }),
        adminService.getUserStats(),
        adminService.getTenderTypeStats(filters),
        adminService.getFinancialStats(filters)
      ]);

      if (overviewResponse.success && overviewResponse.data) {
        setStatsOverview(overviewResponse.data);
      }

      if (groupResponse.success && groupResponse.data) {
        setGroupStats(groupResponse.data);
      }

      if (dateRangeResponse.success && dateRangeResponse.data) {
        setDateRangeStats(dateRangeResponse.data);
      }

      if (userResponse.success && userResponse.data) {
        setUserStats(userResponse.data);
      }

      if (tenderTypeResponse.success && tenderTypeResponse.data) {
        setTenderTypeStats(tenderTypeResponse.data);
      }

      if (financialResponse.success && financialResponse.data) {
        setFinancialStats(financialResponse.data);
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      await adminService.exportData({ ...filters, format });
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export data');
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">BQC Management and Analytics</p>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">BQC Management and Analytics</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">BQC Management and Analytics</p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <DateRangeFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          groupOptions={GROUP_OPTIONS}
        />
      </div>

      {/* Stats Overview */}
      {statsOverview && (
        <div className="mb-8">
          <StatsOverview stats={statsOverview} userStats={userStats} />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Group Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BQC by Group</h3>
          <GroupStatsChart data={groupStats} />
        </div>

        {/* Date Range Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BQC Over Time</h3>
          <DateRangeChart data={dateRangeStats} groupBy={filters.groupBy} />
        </div>

        {/* Tender Type Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BQC by Tender Type</h3>
          <TenderTypeChart data={tenderTypeStats} />
        </div>

        {/* Financial Statistics */}
        {financialStats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Overview</h3>
            <FinancialStatsCard stats={financialStats} />
          </div>
        )}
      </div>

      {/* BQC Entries Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">BQC Entries</h3>
        </div>
        <BQCEntriesTable filters={filters} />
      </div>
    </div>
  );
};

export default AdminDashboard;

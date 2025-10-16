import React from 'react';
import type { GroupOption } from '@/types';

interface DateRangeFilterProps {
  filters: {
    startDate: string;
    endDate: string;
    groupName: string;
    groupBy: 'day' | 'week' | 'month';
  };
  onFilterChange: (filters: Partial<typeof filters>) => void;
  onExport: (format: 'csv' | 'excel') => void;
  groupOptions: GroupOption[];
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  filters,
  onFilterChange,
  onExport,
  groupOptions
}) => {
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFilterChange({ [field]: value });
  };

  const handleGroupChange = (value: string) => {
    onFilterChange({ groupName: value });
  };

  const handleGroupByChange = (value: 'day' | 'week' | 'month') => {
    onFilterChange({ groupBy: value });
  };

  const setQuickRange = (range: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    switch (range) {
      case 'today':
        startDate = endDate;
        break;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(today.getMonth() - 3);
        startDate = quarterAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(today.getFullYear() - 1);
        startDate = yearAgo.toISOString().split('T')[0];
        break;
    }

    onFilterChange({ startDate, endDate });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters & Export</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Start date for filtering BQC data"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="End date for filtering BQC data"
          />
        </div>

        {/* Group Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group
          </label>
          <select
            value={filters.groupName}
            onChange={(e) => handleGroupChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by BQC group"
          >
            <option value="">All Groups</option>
            {groupOptions.map((group) => (
              <option key={group.key} value={group.value}>
                {group.value}
              </option>
            ))}
          </select>
        </div>

        {/* Group By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Group By
          </label>
          <select
            value={filters.groupBy}
            onChange={(e) => handleGroupByChange(e.target.value as 'day' | 'week' | 'month')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Group data by time period"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      </div>

      {/* Quick Range Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700 mr-2">Quick Range:</span>
        {[
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'Last 7 Days' },
          { key: 'month', label: 'Last Month' },
          { key: 'quarter', label: 'Last 3 Months' },
          { key: 'year', label: 'Last Year' }
        ].map((range) => (
          <button
            key={range.key}
            onClick={() => setQuickRange(range.key as any)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Export Buttons */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 mr-2">Export:</span>
        <button
          onClick={() => onExport('csv')}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
        <button
          onClick={() => onExport('excel')}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel
        </button>
      </div>
    </div>
  );
};

export default DateRangeFilter;

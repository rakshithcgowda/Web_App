import React, { useState, useEffect } from 'react';
import { adminService, type BQCEntriesResponse } from '@/services/admin';
import { LoadingSkeleton } from '../LoadingSkeleton';

interface BQCEntriesTableProps {
  filters: {
    startDate: string;
    endDate: string;
    groupName: string;
    groupBy: 'day' | 'week' | 'month';
  };
}

const BQCEntriesTable: React.FC<BQCEntriesTableProps> = ({ filters }) => {
  const [data, setData] = useState<BQCEntriesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [tenderTypeFilter, setTenderTypeFilter] = useState('');

  const loadData = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await adminService.getBQCEntries({
        page,
        limit: 10,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        groupName: filters.groupName || undefined,
        tenderType: tenderTypeFilter || undefined,
        search: searchTerm || undefined
      });

      if (response.success && response.data) {
        setData(response.data);
        setCurrentPage(page);
      } else {
        setError(response.message || 'Failed to load BQC entries');
      }
    } catch (err) {
      setError('Failed to load BQC entries');
      console.error('BQC entries load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, [filters, searchTerm, tenderTypeFilter]);

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTenderTypeBadge = (tenderType: string) => {
    const colors = {
      'Goods': 'bg-blue-100 text-blue-800',
      'Service': 'bg-green-100 text-green-800',
      'Works': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[tenderType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {tenderType}
      </span>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(1);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => loadData(currentPage)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        No data available
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by ref number, description, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        <select
          value={tenderTypeFilter}
          onChange={(e) => setTenderTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Filter by tender type"
        >
          <option value="">All Tender Types</option>
          <option value="Goods">Goods</option>
          <option value="Service">Service</option>
          <option value="Works">Works</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ref Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tender Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.ref_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {entry.group_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {entry.subject}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTenderTypeBadge(entry.tender_type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(entry.cec_estimate_incl_gst)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    <div className="font-medium">{entry.full_name || entry.username}</div>
                    <div className="text-xs text-gray-400">@{entry.username}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(entry.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, data.total)} of {data.total} entries
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadData(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {currentPage} of {data.totalPages}
            </span>
            <button
              onClick={() => loadData(currentPage + 1)}
              disabled={currentPage === data.totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BQCEntriesTable;

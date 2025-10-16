import React from 'react';
import type { FinancialStats } from '@/services/admin';

interface FinancialStatsCardProps {
  stats: FinancialStats;
}

const FinancialStatsCard: React.FC<FinancialStatsCardProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const valueRanges = [
    {
      label: 'Under ₹1 Lakh',
      count: stats.under1Lakh,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: '₹1 Lakh - ₹10 Lakh',
      count: stats.between1LakhAnd10Lakh,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      label: '₹10 Lakh - ₹1 Crore',
      count: stats.between10LakhAnd1Crore,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      label: 'Above ₹1 Crore',
      count: stats.above1Crore,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ];

  const totalBQCs = valueRanges.reduce((sum, range) => sum + range.count, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.totalValue)}
          </div>
          <div className="text-sm text-gray-600">Total Value</div>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats.avgValue)}
          </div>
          <div className="text-sm text-gray-600">Average Value</div>
        </div>
      </div>

      {/* Min/Max Values */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-lg font-semibold text-green-700">
            {formatCurrency(stats.minValue)}
          </div>
          <div className="text-sm text-green-600">Minimum Value</div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-lg font-semibold text-red-700">
            {formatCurrency(stats.maxValue)}
          </div>
          <div className="text-sm text-red-600">Maximum Value</div>
        </div>
      </div>

      {/* Value Range Distribution */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Value Range Distribution</h4>
        {valueRanges.map((range) => {
          const percentage = totalBQCs > 0 ? (range.count / totalBQCs) * 100 : 0;
          
          return (
            <div key={range.label} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{range.label}</span>
                <span className="text-sm font-medium text-gray-900">{range.count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${range.color} transition-all duration-300`}
                  // eslint-disable-next-line react/forbid-dom-props
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-xs text-gray-500">
                {percentage.toFixed(1)}% of total BQCs
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-gray-50 rounded text-center">
          <div className="font-semibold text-gray-900">{totalBQCs}</div>
          <div className="text-gray-600">Total BQCs</div>
        </div>
        <div className="p-2 bg-gray-50 rounded text-center">
          <div className="font-semibold text-gray-900">
            {formatCurrency(stats.maxValue - stats.minValue)}
          </div>
          <div className="text-gray-600">Value Range</div>
        </div>
      </div>
    </div>
  );
};

export default FinancialStatsCard;

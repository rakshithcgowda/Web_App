import React from 'react';
import type { TenderTypeStats } from '@/services/admin';

interface TenderTypeChartProps {
  data: TenderTypeStats[];
}

const TenderTypeChart: React.FC<TenderTypeChartProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const totalCount = data.reduce((sum, item) => sum + item.count, 0);
  const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);

  const getTenderTypeColor = (tenderType: string) => {
    switch (tenderType) {
      case 'Goods':
        return 'bg-blue-500';
      case 'Service':
        return 'bg-green-500';
      case 'Works':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTenderTypeIcon = (tenderType: string) => {
    switch (tenderType) {
      case 'Goods':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      case 'Service':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
          </svg>
        );
      case 'Works':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No data available for the selected period
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
              <div className="text-sm text-gray-600">Total BQCs</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</div>
              <div className="text-sm text-gray-600">Total Value</div>
            </div>
          </div>

          {/* Chart */}
          <div className="space-y-3">
            {data.map((item) => {
              const percentage = (item.count / totalCount) * 100;
              const colorClass = getTenderTypeColor(item.tender_type);

              return (
                <div key={item.tender_type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${colorClass.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                        <div className={`text-${colorClass.replace('bg-', '').replace('-500', '-600')}`}>
                          {getTenderTypeIcon(item.tender_type)}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {item.tender_type}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{item.count}</div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(item.totalValue)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${colorClass} transition-all duration-300`}
                      // eslint-disable-next-line react/forbid-dom-props
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{percentage.toFixed(1)}% of total</span>
                    <span>Avg: {formatCurrency(item.avgValue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TenderTypeChart;

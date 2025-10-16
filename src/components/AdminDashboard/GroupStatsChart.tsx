import React from 'react';
import type { GroupStats } from '@/services/admin';

interface GroupStatsChartProps {
  data: GroupStats[];
}

const GroupStatsChart: React.FC<GroupStatsChartProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No data available for the selected period
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            const colors = [
              'bg-blue-500',
              'bg-green-500',
              'bg-yellow-500',
              'bg-purple-500',
              'bg-pink-500',
              'bg-indigo-500',
              'bg-red-500',
              'bg-teal-500',
              'bg-orange-500',
              'bg-cyan-500'
            ];
            const colorClass = colors[index % colors.length];

            return (
              <div key={item.group_name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {item.group_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.count} BQCs
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(item.totalValue)} total value
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${colorClass} transition-all duration-300`}
                    // eslint-disable-next-line react/forbid-dom-props
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Goods: {item.goodsCount}</span>
                  <span>Service: {item.serviceCount}</span>
                  <span>Works: {item.worksCount}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupStatsChart;

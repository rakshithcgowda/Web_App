import React from 'react';
import type { DateRangeStats } from '@/services/admin';

interface DateRangeChartProps {
  data: DateRangeStats[];
  groupBy: 'day' | 'week' | 'month';
}

const DateRangeChart: React.FC<DateRangeChartProps> = ({ data, groupBy }) => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else {
      return `₹${amount.toLocaleString()}`;
    }
  };

  const formatPeriod = (period: string) => {
    if (groupBy === 'day') {
      return new Date(period).toLocaleDateString();
    } else if (groupBy === 'week') {
      const [year, week] = period.split('-');
      return `Week ${week}, ${year}`;
    } else if (groupBy === 'month') {
      const [year, month] = period.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
      });
    }
    return period;
  };

  const maxCount = Math.max(...data.map(item => item.count));
  const maxValue = Math.max(...data.map(item => item.totalValue));

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No data available for the selected period
        </div>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 10).map((item) => {
            const countPercentage = (item.count / maxCount) * 100;
            const valuePercentage = (item.totalValue / maxValue) * 100;

            return (
              <div key={item.period} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {formatPeriod(item.period)}
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">{item.count} BQCs</div>
                    <div className="text-xs text-gray-500">
                      {formatCurrency(item.totalValue)}
                    </div>
                  </div>
                </div>
                
                {/* Count Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${countPercentage}%` }}
                  />
                </div>
                
                {/* Value Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-green-500 transition-all duration-300"
                    style={{ width: `${valuePercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          
          {data.length > 10 && (
            <div className="text-center text-sm text-gray-500 pt-2">
              Showing first 10 of {data.length} periods
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangeChart;

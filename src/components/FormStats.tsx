import { 
  CheckCircleIcon, 
  ClockIcon, 
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface FormStatsProps {
  completedSections: number;
  totalSections: number;
  estimatedValue?: number;
  lastSaved?: string;
}

export function FormStats({ 
  completedSections, 
  totalSections, 
  estimatedValue, 
  lastSaved,
  ...props
}: FormStatsProps) {
  const completionPercentage = Math.round((completedSections / totalSections) * 100);
  
  const stats = [
    {
      name: 'Completion',
      value: `${completionPercentage}%`,
      subValue: `${completedSections}/${totalSections} sections`,
      icon: CheckCircleIcon,
      color: completionPercentage === 100 ? 'emerald' : completionPercentage >= 50 ? 'blue' : 'amber',
      bgColor: completionPercentage === 100 ? 'from-emerald-500 to-green-600' : completionPercentage >= 50 ? 'from-blue-500 to-indigo-600' : 'from-amber-500 to-orange-600',
    },
    {
      name: 'Estimated Value',
      value: estimatedValue ? `₹${estimatedValue.toFixed(2)}L` : '₹0.00L',
      subValue: 'Contract value',
      icon: ChartBarIcon,
      color: 'purple',
      bgColor: 'from-purple-500 to-violet-600',
    },
    {
      name: 'Last Saved',
      value: lastSaved ? new Date(lastSaved).toLocaleDateString() : 'Never',
      subValue: lastSaved ? new Date(lastSaved).toLocaleTimeString() : 'Not saved yet',
      icon: ClockIcon,
      color: 'gray',
      bgColor: 'from-gray-500 to-slate-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10" {...props}>
      {stats.map((stat) => (
        <div key={stat.name} className="card hover-lift animate-fade-in">
          <div className="card-body p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-600 mb-2 tracking-wide">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.subValue}</p>
              </div>
              <div className={`h-16 w-16 bg-gradient-to-br ${stat.bgColor} rounded-2xl flex items-center justify-center shadow-xl float`}>
                <stat.icon className="h-8 w-8 text-white" />
              </div>
            </div>
            
            {/* Enhanced Progress bar for completion */}
            {stat.name === 'Completion' && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-600">Progress</span>
                  <span className="text-sm font-bold text-gray-900">{completionPercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-3 rounded-full bg-gradient-to-r ${stat.bgColor} transition-all duration-700 ease-out progress-${Math.round(completionPercentage / 10) * 10} shadow-inner`}
                    role="progressbar"
                    aria-label={`Form completion: ${completionPercentage}%`}
                    title={`${completionPercentage}% complete`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

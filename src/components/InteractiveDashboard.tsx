import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardStats {
  totalProjects: number;
  completedProjects: number;
  activeProjects: number;
  totalValue: number;
}

interface InteractiveDashboardProps {
  stats: DashboardStats;
  onQuickAction: (action: string) => void;
}

export function InteractiveDashboard({ stats, onQuickAction }: InteractiveDashboardProps) {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardVariants = {
    initial: { scale: 1, rotateY: 0 },
    hover: { 
      scale: 1.05, 
      rotateY: 5,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    tap: { scale: 0.95 }
  };

  const statsCards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
      change: "+12%",
      trend: "up",
      color: "from-blue-500 to-cyan-500",
      bgPattern: "bg-gradient-to-br from-blue-50 to-cyan-50",
      icon: "📊"
    },
    {
      title: "Completed",
      value: stats.completedProjects,
      change: "+8%",
      trend: "up",
      color: "from-emerald-500 to-green-500",
      bgPattern: "bg-gradient-to-br from-emerald-50 to-green-50",
      icon: "✅"
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
      change: "+15%",
      trend: "up",
      color: "from-amber-500 to-orange-500",
      bgPattern: "bg-gradient-to-br from-amber-50 to-orange-50",
      icon: "🚀"
    },
    {
      title: "Total Value",
      value: `₹${stats.totalValue.toFixed(2)}L`,
      change: "+23%",
      trend: "up",
      color: "from-purple-500 to-pink-500",
      bgPattern: "bg-gradient-to-br from-purple-50 to-pink-50",
      icon: "💰"
    }
  ];

  const quickActions = [
    { label: "New BQC", action: "new-bqc", icon: "➕", color: "bg-gradient-to-r from-blue-600 to-blue-700" },
    { label: "Templates", action: "templates", icon: "📋", color: "bg-gradient-to-r from-purple-600 to-purple-700" },
    { label: "Analytics", action: "analytics", icon: "📈", color: "bg-gradient-to-r from-emerald-600 to-emerald-700" },
    { label: "Export", action: "export", icon: "📤", color: "bg-gradient-to-r from-amber-600 to-amber-700" }
  ];

  return (
    <div className="space-y-8">
      {/* Interactive Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            onHoverStart={() => setActiveCard(index)}
            onHoverEnd={() => setActiveCard(null)}
            className={`
              relative overflow-hidden rounded-2xl p-6 cursor-pointer
              ${card.bgPattern} border border-white/50 shadow-lg backdrop-blur-sm
              hover:shadow-2xl transition-all duration-300
            `}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/20 to-transparent" />
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/10 translate-y-12 -translate-x-12" />
            </div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{card.icon}</div>
                <div className={`
                  px-2 py-1 rounded-full text-xs font-semibold
                  ${card.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}
                `}>
                  {card.change}
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>

              {/* Animated Progress Bar */}
              <motion.div 
                className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: activeCard === index ? 1 : 0.3 }}
              >
                <motion.div
                  className={`h-full bg-gradient-to-r ${card.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: activeCard === index ? "75%" : "45%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Panel */}
      <motion.div 
        className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="flex space-x-2">
            {[1, 2, 3].map((dot) => (
              <div key={dot} className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.action}
              onClick={() => onQuickAction(action.action)}
              className={`
                ${action.color} text-white p-4 rounded-xl font-semibold
                hover:shadow-lg transform transition-all duration-200
                flex flex-col items-center space-y-2
              `}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-sm">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Interactive Timeline */}
      <motion.div 
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 shadow-xl border border-gray-100"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
        
        <div className="space-y-4">
          {[
            { time: "2 min ago", action: "BQC Document Generated", status: "success" },
            { time: "15 min ago", action: "Form Data Saved", status: "info" },
            { time: "1 hour ago", action: "Template Updated", status: "warning" },
            { time: "3 hours ago", action: "Project Completed", status: "success" }
          ].map((activity, index) => (
            <motion.div
              key={index}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-white/60 transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <div className={`
                w-3 h-3 rounded-full
                ${activity.status === 'success' ? 'bg-emerald-500' : ''}
                ${activity.status === 'info' ? 'bg-blue-500' : ''}
                ${activity.status === 'warning' ? 'bg-amber-500' : ''}
              `} />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
              <div className="w-2 h-2 bg-gray-300 rounded-full opacity-50" />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

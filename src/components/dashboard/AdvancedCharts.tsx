import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  ScatterChart,
  Scatter,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  Treemap,
} from 'recharts';

// Advanced interactive data
const realtimeData = [
  { time: '00:00', users: 120, revenue: 2400, conversion: 3.2 },
  { time: '04:00', users: 89, revenue: 1890, conversion: 2.8 },
  { time: '08:00', users: 234, revenue: 4680, conversion: 4.1 },
  { time: '12:00', users: 456, revenue: 9120, conversion: 5.2 },
  { time: '16:00', users: 378, revenue: 7560, conversion: 4.8 },
  { time: '20:00', users: 289, revenue: 5780, conversion: 3.9 },
];

const heatmapData = [
  { day: 'Mon', hour: '9AM', value: 45, color: '#ff4444' },
  { day: 'Mon', hour: '12PM', value: 78, color: '#ff8800' },
  { day: 'Mon', hour: '3PM', value: 92, color: '#ffaa00' },
  { day: 'Tue', hour: '9AM', value: 67, color: '#88ff44' },
  { day: 'Tue', hour: '12PM', value: 89, color: '#44ff88' },
  { day: 'Tue', hour: '3PM', value: 95, color: '#00ff44' },
];

const funnelData = [
  { name: 'Website Visits', value: 10000, fill: '#8884d8' },
  { name: 'Product Views', value: 7500, fill: '#83a6ed' },
  { name: 'Add to Cart', value: 3200, fill: '#8dd1e1' },
  { name: 'Checkout', value: 1800, fill: '#82ca9d' },
  { name: 'Purchase', value: 1200, fill: '#ffc658' },
];

const treemapData = [
  { name: 'Electronics', size: 4500, fill: '#8884d8' },
  { name: 'Clothing', size: 3200, fill: '#82ca9d' },
  { name: 'Books', size: 2100, fill: '#ffc658' },
  { name: 'Home & Garden', size: 1800, fill: '#ff7300' },
  { name: 'Sports', size: 1200, fill: '#00ff88' },
];

const bubbleData = [
  { x: 25, y: 85, z: 150, category: 'Tech' },
  { x: 45, y: 92, z: 200, category: 'Fashion' },
  { x: 65, y: 78, z: 120, category: 'Food' },
  { x: 35, y: 88, z: 180, category: 'Health' },
  { x: 55, y: 95, z: 220, category: 'Travel' },
];

const AnimatedMetric = ({ title, value, target, color }: any) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedValue(value), 500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div className="relative w-24 h-24 mx-auto mb-4">
        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(animatedValue / target) * 251.2} 251.2`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>
            {animatedValue}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Target: {target}%
        </span>
      </div>
    </div>
  );
};

const InteractiveCard = ({ title, children, height = 300 }: any) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-all duration-300 border border-gray-200 dark:border-gray-700 ${
        isHovered ? 'shadow-2xl scale-105' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>
      <div style={{ height: `${height}px` }} className="w-full">
        {children}
      </div>
    </div>
  );
};

export default function AdvancedCharts() {
  const [activeChart, setActiveChart] = useState('realtime');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Interactive Chart Selector */}
        <div className="flex flex-wrap gap-2 mb-8">
          {['realtime', 'funnel', 'treemap', 'bubble'].map((chart) => (
            <button
              key={chart}
              onClick={() => setActiveChart(chart)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeChart === chart
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              {chart.charAt(0).toUpperCase() + chart.slice(1)}
            </button>
          ))}
        </div>

        {/* Animated Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AnimatedMetric
            title="Sales Performance"
            value={87}
            target={100}
            color="#3b82f6"
          />
          <AnimatedMetric
            title="Customer Satisfaction"
            value={94}
            target={100}
            color="#10b981"
          />
          <AnimatedMetric
            title="Revenue Growth"
            value={76}
            target={100}
            color="#f59e0b"
          />
        </div>

        {/* Dynamic Chart Display */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {activeChart === 'realtime' && (
            <>
              <InteractiveCard title="Real-time User Activity" height={350}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={realtimeData}>
                    <defs>
                      <linearGradient
                        id="realtimeGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fill="url(#realtimeGradient)"
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </InteractiveCard>

              <InteractiveCard title="Revenue vs Conversion" height={350}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={realtimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis yAxisId="left" stroke="#9ca3af" />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#9ca3af"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar
                      yAxisId="left"
                      dataKey="revenue"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="conversion"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </InteractiveCard>
            </>
          )}

          {activeChart === 'funnel' && (
            <>
              <InteractiveCard title="Sales Funnel Analysis" height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <FunnelChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Funnel dataKey="value" data={funnelData} isAnimationActive>
                      <LabelList position="center" fill="#fff" stroke="none" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </InteractiveCard>

              <InteractiveCard title="Customer Journey Heatmap" height={400}>
                <div className="grid grid-cols-3 gap-2 h-full">
                  {heatmapData.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-lg flex items-center justify-center text-white font-bold transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: item.color }}
                    >
                      <div className="text-center">
                        <div className="text-xs">{item.day}</div>
                        <div className="text-lg">{item.value}</div>
                        <div className="text-xs">{item.hour}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </InteractiveCard>
            </>
          )}

          {activeChart === 'treemap' && (
            <div className="xl:col-span-2">
              <InteractiveCard
                title="Product Category Performance"
                height={400}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treemapData}
                    dataKey="size"
                    aspectRatio={4 / 3}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                </ResponsiveContainer>
              </InteractiveCard>
            </div>
          )}

          {activeChart === 'bubble' && (
            <div className="xl:col-span-2">
              <InteractiveCard title=" Market Segment Analysis" height={400}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={bubbleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="x" name="Market Share" stroke="#9ca3af" />
                    <YAxis dataKey="y" name="Growth Rate" stroke="#9ca3af" />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Scatter
                      name="Categories"
                      dataKey="z"
                      fill="#8b5cf6"
                      fillOpacity={0.8}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </InteractiveCard>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

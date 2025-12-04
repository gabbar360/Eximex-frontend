import React, { useState } from 'react';
import {
  MdTrendingUp,
  MdTrendingDown,
  MdShoppingCart,
  MdPeople,
  MdAttachMoney,
  MdInventory,
  MdMoreVert,
  MdDownload,
  MdFullscreen,
  MdPrint,
} from 'react-icons/md';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  RadialBarChart,
  RadialBar,
} from 'recharts';

// Professional HD Sample Data
const salesData = [
  { month: 'Jan', sales: 45000, revenue: 52000 },
  { month: 'Feb', sales: 38000, revenue: 48000 },
  { month: 'Mar', sales: 52000, revenue: 65000 },
  { month: 'Apr', sales: 48000, revenue: 58000 },
  { month: 'May', sales: 61000, revenue: 72000 },
  { month: 'Jun', sales: 55000, revenue: 68000 },
  { month: 'Jul', sales: 67000, revenue: 78000 },
  { month: 'Aug', sales: 59000, revenue: 71000 },
  { month: 'Sep', sales: 64000, revenue: 75000 },
  { month: 'Oct', sales: 58000, revenue: 69000 },
  { month: 'Nov', sales: 72000, revenue: 85000 },
  { month: 'Dec', sales: 68000, revenue: 82000 },
];

const orderData = [
  { name: 'Delivered', value: 45, color: '#10b981' },
  { name: 'Processing', value: 25, color: '#3b82f6' },
  { name: 'Shipped', value: 20, color: '#8b5cf6' },
  { name: 'Pending', value: 10, color: '#f59e0b' },
];

const revenueData = [
  { month: 'Jan', revenue: 52000, target: 50000, growth: 4.2 },
  { month: 'Feb', revenue: 48000, target: 52000, growth: -7.7 },
  { month: 'Mar', revenue: 65000, target: 55000, growth: 35.4 },
  { month: 'Apr', revenue: 58000, target: 58000, growth: -10.8 },
  { month: 'May', revenue: 72000, target: 60000, growth: 24.1 },
  { month: 'Jun', revenue: 68000, target: 65000, growth: -5.6 },
  { month: 'Jul', revenue: 78000, target: 70000, growth: 14.7 },
  { month: 'Aug', revenue: 71000, target: 72000, growth: -9.0 },
  { month: 'Sep', revenue: 75000, target: 75000, growth: 5.6 },
  { month: 'Oct', revenue: 69000, target: 78000, growth: -8.0 },
  { month: 'Nov', revenue: 85000, target: 80000, growth: 23.2 },
  { month: 'Dec', revenue: 82000, target: 85000, growth: -3.5 },
];

// Advanced Analytics Data
const customerProspectData = [
  { type: 'Customers', active: 1245, inactive: 156, total: 1401 },
  { type: 'Vendors', active: 89, inactive: 23, total: 112 },
  { type: 'Suppliers', active: 67, inactive: 18, total: 85 },
  { type: 'Prospects', active: 234, inactive: 45, total: 279 },
];

const categoryData = [
  { category: 'Electronics', sales: 45000, profit: 12000, margin: 26.7 },
  { category: 'Clothing', sales: 38000, profit: 15200, margin: 40.0 },
  { category: 'Home & Garden', sales: 32000, profit: 9600, margin: 30.0 },
  { category: 'Sports', sales: 28000, profit: 8400, margin: 30.0 },
  { category: 'Books', sales: 22000, profit: 4400, margin: 20.0 },
  { category: 'Automotive', sales: 35000, profit: 7000, margin: 20.0 },
];

const weeklyData = [
  { day: 'Mon', orders: 120, revenue: 15400, customers: 89 },
  { day: 'Tue', orders: 98, revenue: 12800, customers: 76 },
  { day: 'Wed', orders: 145, revenue: 18900, customers: 112 },
  { day: 'Thu', orders: 132, revenue: 17200, customers: 98 },
  { day: 'Fri', orders: 189, revenue: 24500, customers: 145 },
  { day: 'Sat', orders: 234, revenue: 31200, customers: 189 },
  { day: 'Sun', orders: 156, revenue: 20800, customers: 123 },
];

const MetricCard = ({ title, value, change, icon, bgColor }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 p-4 h-full group">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
          {title}
        </p>
        <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {value}
        </p>
        <div className="flex items-center space-x-1">
          {change > 0 ? (
            <MdTrendingUp className="w-3 h-3 text-emerald-500" />
          ) : (
            <MdTrendingDown className="w-3 h-3 text-red-500" />
          )}
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded ${
              change > 0
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {change > 0 ? '+' : ''}
            {change}%
          </span>
        </div>
      </div>
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ml-3 group-hover:scale-105 transition-transform duration-200 ${bgColor}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children, height = 400 }: any) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleExport = async () => {
    const chartElement = document.querySelector(`[data-chart="${title}"]`);
    if (chartElement) {
      try {
        // Create canvas from the chart element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgElement = chartElement.querySelector('svg');

        if (svgElement) {
          // Get SVG dimensions
          const rect = svgElement.getBoundingClientRect();
          canvas.width = rect.width;
          canvas.height = rect.height;

          // Convert SVG to canvas
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const svgBlob = new Blob([svgData], {
            type: 'image/svg+xml;charset=utf-8',
          });
          const url = URL.createObjectURL(svgBlob);

          const img = new Image();
          img.onload = () => {
            ctx?.drawImage(img, 0, 0);

            // Download as PNG
            canvas.toBlob((blob) => {
              if (blob) {
                const link = document.createElement('a');
                link.download = `${title.replace(/\s+/g, '_')}_chart.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
              }
            });

            URL.revokeObjectURL(url);
          };

          img.src = url;
        }
      } catch (error) {
        console.error('Export failed:', error);
      }
    }
    setShowMenu(false);
  };

  const handleFullscreen = () => {
    setIsFullscreen(true);
    setShowMenu(false);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  const handlePrint = () => {
    const chartElement = document.querySelector(`[data-chart="${title}"]`);
    if (chartElement) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                .chart-container { width: 100%; height: 600px; }
                .chart-title { font-size: 24px; font-weight: bold; margin-bottom: 20px; text-align: center; }
                @media print {
                  body { margin: 0; padding: 10px; }
                  .chart-container { width: 100%; height: 500px; page-break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="chart-title">${title}</div>
              <div class="chart-container">
                ${chartElement.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
    setShowMenu(false);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MdMoreVert className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 w-48 z-10">
                <button
                  onClick={handleExport}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <MdDownload className="w-4 h-4" />
                  Export Chart
                </button>
                <button
                  onClick={handleFullscreen}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <MdFullscreen className="w-4 h-4" />
                  Fullscreen
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300"
                >
                  <MdPrint className="w-4 h-4" />
                  Print Chart
                </button>
              </div>
            )}
          </div>
        </div>
        <div
          style={{ height: `${height}px` }}
          className="w-full"
          data-chart={title}
        >
          {children}
        </div>
      </div>

      {/* Custom Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full h-full max-w-7xl max-h-full p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
              <button
                onClick={closeFullscreen}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
            <div className="w-full h-5/6">{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default function MaterialDashboard() {
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      // This will be handled by individual ChartCard components
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <MetricCard
            title="Total Revenue"
            value="$847,239"
            change={12.5}
            icon={<MdAttachMoney className="w-5 h-5" />}
            bgColor="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <MetricCard
            title="Total Orders"
            value="3,429"
            change={-2.3}
            icon={<MdShoppingCart className="w-5 h-5" />}
            bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <MetricCard
            title="Total Customers"
            value="12,745"
            change={18.1}
            icon={<MdPeople className="w-5 h-5" />}
            bgColor="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <MetricCard
            title="Products"
            value="4,847"
            change={5.7}
            icon={<MdInventory className="w-5 h-5" />}
            bgColor="bg-gradient-to-br from-slate-500 to-slate-600"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <ChartCard title="Sales & Revenue Trend" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={salesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient
                    id="salesGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
                    name === 'sales' ? 'Sales' : 'Revenue',
                  ]}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: '#3b82f6',
                    strokeWidth: 2,
                    fill: 'white',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: '#10b981',
                    strokeWidth: 2,
                    fill: 'white',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ color: '#374151', fontWeight: '500' }}>
                      {value === 'sales' ? 'Sales' : 'Revenue'}
                    </span>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Order Status Distribution" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={orderData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient
                    id="orderGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                  formatter={(value) => [`${value}%`, 'Orders']}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#orderGradient)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 - Monthly Revenue vs Target */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <ChartCard title="Monthly Revenue vs Target" height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={revenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient
                    id="revenueAreaGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  fontSize={11}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                  formatter={(value, name) => [
                    name === 'growth'
                      ? `${value}%`
                      : `$${Number(value).toLocaleString()}`,
                    name === 'revenue'
                      ? 'Revenue'
                      : name === 'target'
                        ? 'Target'
                        : 'Growth %',
                  ]}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  fill="url(#revenueAreaGradient)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                />
                <Bar
                  dataKey="target"
                  fill="#e2e8f0"
                  radius={[2, 2, 0, 0]}
                  opacity={0.6}
                />
                <Line
                  type="monotone"
                  dataKey="growth"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }}
                  yAxisId="right"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 3 - Performance Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <ChartCard title="Customer Prospects Analytics" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={customerProspectData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient
                    id="activeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient
                    id="inactiveGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="type"
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                  formatter={(value, name) => [
                    value,
                    name === 'active' ? 'Active' : 'Inactive',
                  ]}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Bar
                  dataKey="active"
                  fill="url(#activeGradient)"
                  radius={[4, 4, 0, 0]}
                  name="active"
                />
                <Bar
                  dataKey="inactive"
                  fill="url(#inactiveGradient)"
                  radius={[4, 4, 0, 0]}
                  name="inactive"
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '15px',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                  formatter={(value) => (
                    <span style={{ color: '#374151' }}>
                      {value === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Weekly Performance" height={320}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={weeklyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient
                    id="weeklyGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="day"
                  stroke="#6b7280"
                  fontSize={11}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={11}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={11}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '13px',
                    fontWeight: '500',
                  }}
                  formatter={(value, name) => [
                    name === 'revenue'
                      ? `$${Number(value).toLocaleString()}`
                      : value,
                    name === 'orders'
                      ? 'Orders'
                      : name === 'revenue'
                        ? 'Revenue'
                        : 'Customers',
                  ]}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  fill="url(#weeklyGradient)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
                <Bar
                  yAxisId="left"
                  dataKey="orders"
                  fill="#10b981"
                  radius={[2, 2, 0, 0]}
                  opacity={0.8}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="customers"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 4 - Category Analysis */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <ChartCard title="Category Performance Analysis" height={350}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={categoryData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient
                    id="salesBarGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient
                    id="profitBarGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.5}
                />
                <XAxis
                  dataKey="category"
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={12}
                  fontWeight={500}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}
                  formatter={(value, name) => [
                    name === 'margin'
                      ? `${value}%`
                      : `$${Number(value).toLocaleString()}`,
                    name === 'sales'
                      ? 'Sales'
                      : name === 'profit'
                        ? 'Profit'
                        : 'Margin %',
                  ]}
                  labelStyle={{ color: '#374151', fontWeight: '600' }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="sales"
                  fill="url(#salesBarGradient)"
                  radius={[4, 4, 0, 0]}
                  name="sales"
                />
                <Bar
                  yAxisId="left"
                  dataKey="profit"
                  fill="url(#profitBarGradient)"
                  radius={[4, 4, 0, 0]}
                  name="profit"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="margin"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 5 }}
                  activeDot={{
                    r: 7,
                    stroke: '#f59e0b',
                    strokeWidth: 2,
                    fill: 'white',
                  }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => (
                    <span style={{ color: '#374151', fontWeight: '500' }}>
                      {value === 'sales'
                        ? 'Sales'
                        : value === 'profit'
                          ? 'Profit'
                          : 'Margin %'}
                    </span>
                  )}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

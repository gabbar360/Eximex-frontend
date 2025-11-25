import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  AttachMoney,
  Inventory,
} from '@mui/icons-material';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Sample data
const salesData = [
  { month: 'Jan', sales: 4000, revenue: 2400 },
  { month: 'Feb', sales: 3000, revenue: 1398 },
  { month: 'Mar', sales: 2000, revenue: 9800 },
  { month: 'Apr', sales: 2780, revenue: 3908 },
  { month: 'May', sales: 1890, revenue: 4800 },
  { month: 'Jun', sales: 2390, revenue: 3800 },
];

const orderData = [
  { name: 'Pending', value: 400, color: '#ff9800' },
  { name: 'Processing', value: 300, color: '#2196f3' },
  { name: 'Shipped', value: 300, color: '#4caf50' },
  { name: 'Delivered', value: 200, color: '#9c27b0' },
];

const MobileMetricCard = ({ title, value, change, icon, color }: any) => (
  <div
    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4"
    style={{ borderLeftColor: color }}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
          {title}
        </p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
        <div className="flex items-center mt-2">
          {change > 0 ? (
            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
          )}
          <span
            className={`text-xs font-semibold ${
              change > 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white ml-3`}
        style={{ backgroundColor: color }}
      >
        {React.cloneElement(icon, { className: 'w-5 h-5' })}
      </div>
    </div>
  </div>
);

const MobileChartCard = ({ title, children, height = 250 }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
      {title}
    </h3>
    <div style={{ height: `${height}px` }} className="w-full">
      {children}
    </div>
  </div>
);

export default function MobileOptimizedDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Business Overview
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Metrics Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
          <MobileMetricCard
            title="Revenue"
            value="$54.2K"
            change={12.5}
            icon={<AttachMoney />}
            color="#1976d2"
          />
          <MobileMetricCard
            title="Orders"
            value="1,429"
            change={-2.3}
            icon={<ShoppingCart />}
            color="#4caf50"
          />
          <MobileMetricCard
            title="Customers"
            value="9.7K"
            change={8.1}
            icon={<People />}
            color="#2196f3"
          />
          <MobileMetricCard
            title="Products"
            value="2,847"
            change={5.7}
            icon={<Inventory />}
            color="#ff9800"
          />
        </div>

        {/* Mobile Charts */}
        <div className="space-y-4">
          {/* Sales Trend - Mobile */}
          <MobileChartCard title="Sales Trend" height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="mobileSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#1976d2"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#mobileSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </MobileChartCard>

          {/* Order Status - Mobile */}
          <MobileChartCard title="Order Status" height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {orderData.map((item, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs font-medium text-white rounded"
                  style={{ backgroundColor: item.color }}
                >
                  {item.name}
                </span>
              ))}
            </div>
          </MobileChartCard>

          {/* Recent Activity - Mobile */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3">
              Recent Orders
            </h3>
            <div className="space-y-3">
              {[
                {
                  id: '#12345',
                  customer: 'John Doe',
                  amount: '$299.00',
                  status: 'Completed',
                },
                {
                  id: '#12346',
                  customer: 'Jane Smith',
                  amount: '$199.50',
                  status: 'Processing',
                },
                {
                  id: '#12347',
                  customer: 'Bob Johnson',
                  amount: '$449.99',
                  status: 'Shipped',
                },
              ].map((order, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {order.id}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {order.customer}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {order.amount}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        order.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'Processing'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import {
  MdTrendingUp,
  MdTrendingDown,
  MdShoppingCart,
  MdPeople,
  MdAttachMoney,
  MdInventory,
  MdMoreVert,
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
} from 'recharts';

// Sample data
const salesData = [
  { month: 'Jan', sales: 4000, revenue: 2400 },
  { month: 'Feb', sales: 3000, revenue: 1398 },
  { month: 'Mar', sales: 2000, revenue: 9800 },
  { month: 'Apr', sales: 2780, revenue: 3908 },
  { month: 'May', sales: 1890, revenue: 4800 },
  { month: 'Jun', sales: 2390, revenue: 3800 },
  { month: 'Jul', sales: 3490, revenue: 4300 },
];

const orderData = [
  { name: 'Pending', value: 400, color: '#f79009' },
  { name: 'Processing', value: 300, color: '#465fff' },
  { name: 'Shipped', value: 300, color: '#12b76a' },
  { name: 'Delivered', value: 200, color: '#7a5af8' },
];

const revenueData = [
  { month: 'Jan', revenue: 65000 },
  { month: 'Feb', revenue: 59000 },
  { month: 'Mar', revenue: 80000 },
  { month: 'Apr', revenue: 81000 },
  { month: 'May', revenue: 56000 },
  { month: 'Jun', revenue: 55000 },
  { month: 'Jul', revenue: 40000 },
];

const MetricCard = ({ title, value, change, icon, bgColor }: any) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-theme-sm hover:shadow-theme-md transition-all duration-300 p-4 sm:p-6 h-full">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
          {title}
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {value}
        </p>
        <div className="flex items-center space-x-2">
          {change > 0 ? (
            <MdTrendingUp className="w-4 h-4 text-success-500" />
          ) : (
            <MdTrendingDown className="w-4 h-4 text-error-500" />
          )}
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              change > 0
                ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                : 'bg-error-50 text-error-700 dark:bg-error-900/20 dark:text-error-400'
            }`}
          >
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center text-white ml-4 ${bgColor}`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children, height = 300 }: any) => (
  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-theme-sm p-4 sm:p-6 h-full">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <button className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
        <MdMoreVert className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
    <div style={{ height: `${height}px` }} className="w-full">
      {children}
    </div>
  </div>
);

export default function MaterialDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <MetricCard
            title="Total Revenue"
            value="$54,239"
            change={12.5}
            icon={<MdAttachMoney className="w-6 h-6" />}
            bgColor="bg-success-500"
          />
          <MetricCard
            title="Total Orders"
            value="1,429"
            change={-2.3}
            icon={<MdShoppingCart className="w-6 h-6" />}
            bgColor="bg-brand-500"
          />
          <MetricCard
            title="Total Customers"
            value="9,745"
            change={8.1}
            icon={<MdPeople className="w-6 h-6" />}
            bgColor="bg-orange-500"
          />
          <MetricCard
            title="Products"
            value="2,847"
            change={5.7}
            icon={<MdInventory className="w-6 h-6" />}
            bgColor="bg-gray-600"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div>
            <ChartCard title="Sales & Revenue Trend" height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#465fff" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#465fff"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#12b76a" stopOpacity={0.8} />
                      <stop
                        offset="95%"
                        stopColor="#12b76a"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#465fff"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#12b76a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div>
            <ChartCard title="Order Status" height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={100}
                    paddingAngle={5}
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
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="mb-6 sm:mb-8">
          <ChartCard title="Monthly Revenue Analysis" height={400}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={revenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a5af8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#7a5af8" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => [
                    `$${value.toLocaleString()}`,
                    'Revenue',
                  ]}
                />
                <Bar
                  dataKey="revenue"
                  fill="url(#colorBar)"
                  radius={[6, 6, 0, 0]}
                  stroke="#7a5af8"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-theme-sm p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Orders
            </h3>
            <div className="space-y-4">
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
                {
                  id: '#12348',
                  customer: 'Alice Brown',
                  amount: '$89.00',
                  status: 'Pending',
                },
              ].map((order, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {order.id}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {order.customer}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">
                      {order.amount}
                    </p>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ml-2 sm:ml-0 sm:mt-1 ${
                        order.status === 'Completed'
                          ? 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-400'
                          : order.status === 'Processing'
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400'
                            : order.status === 'Shipped'
                              ? 'bg-theme-purple-500/10 text-theme-purple-500 dark:bg-theme-purple-500/20'
                              : 'bg-warning-50 text-warning-700 dark:bg-warning-900/20 dark:text-warning-400'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-theme-sm p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Top Products
            </h3>
            <div className="space-y-4">
              {[
                {
                  name: 'Wireless Headphones',
                  sales: 1234,
                  revenue: '$24,680',
                },
                { name: 'Smart Watch', sales: 987, revenue: '$19,740' },
                { name: 'Laptop Stand', sales: 756, revenue: '$15,120' },
                { name: 'USB-C Cable', sales: 543, revenue: '$10,860' },
              ].map((product, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {product.name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {product.sales} units sold
                    </p>
                  </div>
                  <p className="font-semibold text-brand-600 dark:text-brand-400 text-sm ml-4">
                    {product.revenue}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

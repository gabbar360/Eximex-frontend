import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  AttachMoney,
  Inventory,
  MoreVert,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  { name: 'Pending', value: 400, color: '#ff9800' },
  { name: 'Processing', value: 300, color: '#2196f3' },
  { name: 'Shipped', value: 300, color: '#4caf50' },
  { name: 'Delivered', value: 200, color: '#9c27b0' },
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

const MetricCard = ({ title, value, change, icon, color }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 sm:p-6 h-full">
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
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
            change > 0 
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {Math.abs(change)}%
          </span>
        </div>
      </div>
      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white ml-4`} style={{ backgroundColor: color }}>
        {icon}
      </div>
    </div>
  </div>
);

const ChartCard = ({ title, children, height = 300 }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 h-full">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <MoreVert className="w-5 h-5 text-gray-500" />
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
          />
          <MetricCard
            title="Total Orders"
            value="1,429"
            change={-2.3}
          />
          <MetricCard
            title="Total Customers"
            value="9,745"
            change={8.1}
          />
          <MetricCard
            title="Products"
            value="2,847"
            change={5.7}
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
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
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
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#1976d2"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4caf50"
                    strokeWidth={3}
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
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
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
              <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#9c27b0" stopOpacity={0.3}/>
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
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#colorBar)" 
                  radius={[8, 8, 0, 0]}
                  stroke="#9c27b0"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Orders
            </h3>
            <div className="space-y-4">
              {[
                { id: '#12345', customer: 'John Doe', amount: '$299.00', status: 'Completed' },
                { id: '#12346', customer: 'Jane Smith', amount: '$199.50', status: 'Processing' },
                { id: '#12347', customer: 'Bob Johnson', amount: '$449.99', status: 'Shipped' },
                { id: '#12348', customer: 'Alice Brown', amount: '$89.00', status: 'Pending' },
              ].map((order, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="mb-2 sm:mb-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{order.id}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{order.customer}</p>
                  </div>
                  <div className="flex items-center justify-between sm:flex-col sm:items-end">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{order.amount}</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ml-2 sm:ml-0 sm:mt-1 ${
                      order.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      order.status === 'Processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                      order.status === 'Shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4">
              Top Products
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Wireless Headphones', sales: 1234, revenue: '$24,680' },
                { name: 'Smart Watch', sales: 987, revenue: '$19,740' },
                { name: 'Laptop Stand', sales: 756, revenue: '$15,120' },
                { name: 'USB-C Cable', sales: 543, revenue: '$10,860' },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{product.name}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{product.sales} units sold</p>
                  </div>
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-sm ml-4">
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
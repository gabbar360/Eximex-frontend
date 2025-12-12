import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { fetchOrders } from '../../features/orderSlice';
import { fetchProducts } from '../../features/productSlice';
import { fetchParties } from '../../features/partySlice';
import { toast } from 'react-toastify';

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
  const dispatch = useDispatch();
  const { orders, loading: ordersLoading } = useSelector((state: any) => state.order);
  const { products, loading: productsLoading } = useSelector((state: any) => state.product);
  const { parties, loading: partiesLoading } = useSelector((state: any) => state.party);
  
  const loading = ordersLoading || productsLoading || partiesLoading;

  const fetchStats = async () => {
    try {
      await Promise.all([
        dispatch(fetchOrders()),
        dispatch(fetchProducts()),
        dispatch(fetchParties())
      ]);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dispatch]);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum: number, order: any) => {
      return sum + (parseFloat(order.totalAmount) || 0);
    }, 0);

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalParties: parties.length
    };
  }, [orders, products, parties]); 

  // Generate chart data using useMemo for performance
  const generateChartData = (value: number, multipliers: number[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => ({
      month,
      sales: index === 5 ? value : Math.max(0, Math.floor(value * multipliers[index])),
    }));
  };

  const salesData = useMemo(() => {
    if (!orders.length) return generateChartData(
      stats.totalRevenue || 0,
      [0.3, 0.4, 0.5, 0.6, 0.8, 1]
    );

    const monthlyData = orders.reduce((acc: any, order: any) => {
      const date = new Date(order.createdAt || order.orderDate);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!acc[month]) {
        acc[month] = { month, revenue: 0 };
      }
      
      acc[month].revenue += parseFloat(order.totalAmount) || 0;
      return acc;
    }, {});

    return Object.values(monthlyData).slice(-6);
  }, [orders, stats.totalRevenue]);

  const orderData = useMemo(() => {
    if (!orders.length) return [
      { name: 'Pending', value: 0, color: '#ff9800' },
      { name: 'Processing', value: 0, color: '#2196f3' },
      { name: 'Shipped', value: 0, color: '#4caf50' },
      { name: 'Delivered', value: 0, color: '#9c27b0' },
    ];

    const statusCounts = orders.reduce((acc: any, order: any) => {
      const status = order.status || 'Pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const colors = ['#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#f44336'];
    return Object.entries(statusCounts).map(([status, count], index) => ({
      name: status,
      value: count as number,
      color: colors[index % colors.length],
    }));
  }, [orders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            value={`₹${((stats.totalRevenue || 0) / 1000).toFixed(1)}K`}
            change={12.5}
            icon={<AttachMoney />}
            color="#1976d2"
          />
          <MobileMetricCard
            title="Orders"
            value={(stats.totalOrders || 0).toLocaleString()}
            change={-2.3}
            icon={<ShoppingCart />}
            color="#4caf50"
          />
          <MobileMetricCard
            title="Parties"
            value={`${((stats.totalParties || 0) / 1000).toFixed(1)}K`}
            change={8.1}
            icon={<People />}
            color="#2196f3"
          />
          <MobileMetricCard
            title="Products"
            value={(stats.totalProducts || 0).toLocaleString()}
            change={5.7}
            icon={<Inventory />}
            color="#ff9800"
          />
        </div>

        {/* Mobile Charts */}
        <div className="space-y-4">
          {/* Sales Trend - Mobile */}
          <MobileChartCard title="Revenue Trend" height={200}>
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
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
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
        </div>
      </div>
    </div>
  );
}

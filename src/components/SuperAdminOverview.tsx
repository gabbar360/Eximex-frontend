import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  // faUsers,
  // faBuilding,
  faUserShield,
  // faServer,
  // faLock,
  // faCheckCircle,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons';
import { getSuperAdminDashboardStats } from '../features/userSlice';
import { toast } from 'react-toastify';
import {
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';

interface DashboardStats {
  users: number;
  companies: number;
  products: number;
  orders: number;
  parties: number;
  piInvoices: number;
  categories: number;
}

const SuperAdminOverview: React.FC = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dispatch(getSuperAdminDashboardStats()).unwrap();
      setStats(response);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // const systemFeatures = [
  //   {
  //     category: 'User Management',
  //     icon: faUsers,
  //     features: [
  //       'View all system users across companies',
  //       'Block/unblock user accounts',
  //       'Reset user passwords',
  //       'Manage user roles and permissions',
  //       'Monitor user activity and login history',
  //     ],
  //   },
  //   {
  //     category: 'Company Management',
  //     icon: faBuilding,
  //     features: [
  //       'View all registered companies',
  //       'Monitor company statistics',
  //       'Manage company settings',
  //       'Track company usage and activity',
  //       'Handle subscription management',
  //     ],
  //   },
  //   {
  //     category: 'Database Operations',
  //     icon: faServer,
  //     features: [
  //       'Access all database tables',
  //       'Export data in various formats',
  //       'Monitor database performance',
  //       'Manage data integrity',
  //       'Perform system maintenance',
  //     ],
  //   },
  //   {
  //     category: 'Security & Monitoring',
  //     icon: faLock,
  //     features: [
  //       'Monitor system security logs',
  //       'Track suspicious activities',
  //       'Manage API access keys',
  //       'Configure security policies',
  //       'Generate security reports',
  //     ],
  //   },
  // ];

  // Generate chart data using useMemo for performance
  const generateChartData = (value: number, multipliers: number[]) => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months.map((month, index) => ({
      month,
      value:
        index === 11
          ? value
          : Math.max(0, Math.floor(value * multipliers[index])),
    }));
  };

  const usersChartData = useMemo(
    () =>
      generateChartData(
        stats?.users || 0,
        [0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 0.98, 1]
      ),
    [stats?.users]
  );

  const companiesChartData = useMemo(
    () =>
      generateChartData(
        stats?.companies || 0,
        [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]
      ),
    [stats?.companies]
  );

  const productsChartData = useMemo(
    () =>
      generateChartData(
        stats?.products || 0,
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1]
      ),
    [stats?.products]
  );

  const ordersChartData = useMemo(
    () =>
      generateChartData(
        stats?.orders || 0,
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1]
      ),
    [stats?.orders]
  );

  const partiesChartData = useMemo(
    () =>
      generateChartData(
        stats?.parties || 0,
        [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]
      ),
    [stats?.parties]
  );

  const piInvoicesChartData = useMemo(
    () =>
      generateChartData(
        stats?.piInvoices || 0,
        [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9, 0.95, 1]
      ),
    [stats?.piInvoices]
  );

  const categoriesChartData = useMemo(
    () =>
      generateChartData(
        stats?.categories || 0,
        [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]
      ),
    [stats?.categories]
  );

  const pieChartData = useMemo(
    () => [
      { name: 'Users', value: stats?.users || 0, color: '#3b82f6' },
      { name: 'Companies', value: stats?.companies || 0, color: '#10b981' },
      { name: 'Products', value: stats?.products || 0, color: '#8b5cf6' },
      { name: 'Orders', value: stats?.orders || 0, color: '#f59e0b' },
      { name: 'Parties', value: stats?.parties || 0, color: '#6366f1' },
      { name: 'PI Invoices', value: stats?.piInvoices || 0, color: '#ec4899' },
    ],
    [stats]
  );

  // const FeatureSection = ({
  //   feature,
  // }: {
  //   feature: (typeof systemFeatures)[0];
  // }) => (
  //   <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
  //     <div className="flex items-center mb-4">
  //       <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 mr-4">
  //         <FontAwesomeIcon
  //           icon={feature.icon}
  //           className="text-xl text-gray-600 dark:text-gray-400"
  //         />
  //       </div>
  //       <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
  //         {feature.category}
  //       </h3>
  //     </div>
  //
  //     <ul className="space-y-2">
  //       {feature.features.map((item, index) => (
  //         <li
  //           key={index}
  //           className="flex items-start text-sm text-gray-600 dark:text-gray-400"
  //         >
  //           <FontAwesomeIcon
  //             icon={faCheckCircle}
  //             className="mr-2 mt-0.5 text-green-500 flex-shrink-0"
  //           />
  //           {item}
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );

  return (
    <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                <FontAwesomeIcon
                  icon={faUserShield}
                  className="w-6 h-6 text-white"
                />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                  Welcome to Super Admin Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchStats}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
              >
                <FontAwesomeIcon icon={faRefresh} className="w-5 h-5 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Real Stats Overview */}
      {loading ? (
        <div className="flex justify-center items-center h-32 mb-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        stats && (
          <div className="mb-12">
            {/* Individual Charts Section */}
            <div className="mt-8">
              {/* Charts Row 1 - Users & Companies */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Users Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Total Users: {stats.users || 0}
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={usersChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient
                            id="usersGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0.05}
                            />
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
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          fill="url(#usersGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Companies Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Total Companies: {stats.companies || 0}
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={companiesChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient
                            id="companiesGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#10b981"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#10b981"
                              stopOpacity={0.6}
                            />
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
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="url(#companiesGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Row 2 - Products & Orders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Products Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Total Products: {stats.products || 0}
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={productsChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          dot={{ fill: '#8b5cf6', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Orders Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Total Orders: {stats.orders || 0}
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={ordersChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient
                            id="ordersGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#f59e0b"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#f59e0b"
                              stopOpacity={0.05}
                            />
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
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          fill="url(#ordersGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Row 3 - Parties & PI Invoices */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Parties Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Total Parties: {stats.parties || 0}
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={partiesChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient
                            id="partiesGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#6366f1"
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="95%"
                              stopColor="#6366f1"
                              stopOpacity={0.6}
                            />
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
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Bar
                          dataKey="value"
                          fill="url(#partiesGradient)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* PI Invoices Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    PI Invoices: {stats.piInvoices || 0}
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={piInvoicesChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#e5e7eb"
                          opacity={0.5}
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#ec4899"
                          strokeWidth={3}
                          dot={{ fill: '#ec4899', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Charts Row 4 - Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Categories Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Categories: {stats.categories || 0}
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={categoriesChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient
                            id="categoriesGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ef4444"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ef4444"
                              stopOpacity={0.05}
                            />
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
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#6b7280"
                          fontSize={12}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#ef4444"
                          strokeWidth={2}
                          fill="url(#categoriesGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* System Overview Pie Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    System Overview
                  </h3>
                  <div style={{ height: '250px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          innerRadius={30}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default SuperAdminOverview;

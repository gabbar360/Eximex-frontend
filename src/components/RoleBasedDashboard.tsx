import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { useAuth, RoleGuard, PermissionGuard } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getUserDataSummary, getSuperAdminDashboardStats, getCompanyDashboardStats, getUserStats, getActivityLogs } from '../features/userSlice';

import {
  FiUsers,
  FiPackage,
  FiFileText,
  FiTruck,
  FiTool,
  FiUserCheck,
  FiSettings,
  FiActivity,
  FiArrowRight,
} from 'react-icons/fi';

import { toast } from 'react-toastify';
import Chart from 'react-apexcharts';

interface DashboardStats {
  parties: number;
  products: number;
  piInvoices: number;
  orders: number;
  staff?: number; // Only for admins
}

const RoleBasedDashboard: React.FC = () => {
  const { user, permissions } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = async () => {
    try {
      const dashboardStats: DashboardStats = {
        parties: 0,
        products: 0,
        piInvoices: 0,
        orders: 0,
      };

      console.log('Fetching dashboard stats...');

      // For staff, show only their own data
      if (user?.role === 'STAFF') {
        try {
          const summary = await dispatch(getUserDataSummary(user.id)).unwrap();
          console.log('Staff data summary:', summary);
          dashboardStats.parties = summary.parties || 0;
          dashboardStats.products = summary.products || 0;
          dashboardStats.piInvoices = summary.piInvoices || 0;
          dashboardStats.orders = summary.orders || 0;
        } catch (error) {
          console.error('Failed to fetch user data summary:', error);
        }
      } else if (user?.role === 'SUPER_ADMIN') {
        // For super admin, get global stats across all companies
        try {
          const superAdminStats =
            await dispatch(getSuperAdminDashboardStats()).unwrap();
          console.log('Super admin dashboard stats:', superAdminStats);
          dashboardStats.parties = superAdminStats.parties || 0;
          dashboardStats.products = superAdminStats.products || 0;
          dashboardStats.piInvoices = superAdminStats.piInvoices || 0;
          dashboardStats.orders = superAdminStats.orders || 0;
        } catch (error) {
          console.error('Failed to fetch super admin dashboard stats:', error);
        }
      } else {
        // For admins, get company-wide stats (includes admin + all staff data)
        try {
          const companyStats = await dispatch(getCompanyDashboardStats()).unwrap();
          console.log('Company dashboard stats:', companyStats);
          dashboardStats.parties = companyStats.parties || 0;
          dashboardStats.products = companyStats.products || 0;
          dashboardStats.piInvoices = companyStats.piInvoices || 0;
          dashboardStats.orders = companyStats.orders || 0;
        } catch (error) {
          console.error('Failed to fetch company dashboard stats:', error);
        }
      }

      if (permissions.canManageStaff) {
        try {
          const userStats = await dispatch(getUserStats()).unwrap();
          dashboardStats.staff = userStats.totalUsers || 0;
        } catch (error) {
          console.error('Failed to fetch user stats:', error);
          dashboardStats.staff = 0;
        }
      }
      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error(error.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user, permissions]);

  if (loading) {
    return (
      <div className="flex justify-center p-8 text-gray-900 dark:text-gray-100">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Welcome Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
          {user?.role === 'ADMIN'
            ? 'Manage your company operations and staff'
            : 'Manage your export operations'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard
          title="Parties"
          value={stats?.parties || 0}
          icon={<FiUsers />}
          color="bg-blue-500"
          link="/parties"
        />
        <StatCard
          title="Products"
          value={stats?.products || 0}
          icon={<FiPackage />}
          color="bg-green-500"
          link="/products"
        />
        <StatCard
          title="PI Invoices"
          value={stats?.piInvoices || 0}
          icon={<FiFileText />}
          color="bg-purple-500"
          link="/pi-invoices"
        />
        <StatCard
          title="Orders"
          value={stats?.orders || 0}
          icon={<FiTruck />}
          color="bg-orange-500"
          link="/orders"
        />

        {/* Staff card only for admins */}
        <PermissionGuard permission="canManageStaff">
          <StatCard
            title="Staff Members"
            value={stats?.staff || 0}
            icon={<FiUserCheck />}
            color="bg-indigo-500"
            link="/staff-management"
          />
        </PermissionGuard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
        <StatsChart stats={stats} />
        <ActivityChart stats={stats} />
      </div>

      {/* Role-specific sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Admin-specific section */}
        <RoleGuard allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
          <AdminDashboardSection />
        </RoleGuard>

        {/* Staff-specific section */}
        <RoleGuard allowedRoles={['STAFF']}>
          <StaffDashboardSection />
        </RoleGuard>

        {/* Recent Activity - visible to all */}
        <RecentActivitySection />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  link: string;
}> = ({ title, value, icon, color, link }) => {
  const navigate = useNavigate();

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(link)}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
        <div
          className={`${color} rounded-full p-2 sm:p-3 text-white text-lg sm:text-xl lg:text-2xl flex-shrink-0 ml-2`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Section
const AdminDashboardSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
        Admin Tools
      </h2>
      <div className="space-y-3">
        <DashboardLink
          title="Staff Management"
          description="Manage staff accounts and permissions"
          link="/staff-management"
          icon={<FiUserCheck />}
        />
        <DashboardLink
          title="Activity Logs"
          description="View system activity and audit trail"
          link="/activity-logs"
          icon={<FiActivity />}
        />
        <DashboardLink
          title="Company Settings"
          description="Manage company information and settings"
          link="/company-settings"
          icon={<FiSettings />}
        />
      </div>
    </div>
  );
};

// Staff Dashboard Section
const StaffDashboardSection: React.FC = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
        Quick Actions
      </h2>
      <div className="space-y-3">
        <DashboardLink
          title="Create New Party"
          description="Add a new customer or supplier"
          link="/parties/create"
          icon={<FiUsers />}
        />
        <DashboardLink
          title="Add Product"
          description="Add a new product to catalog"
          link="/products/create"
          icon={<FiPackage />}
        />
        <DashboardLink
          title="Create PI Invoice"
          description="Generate a new proforma invoice"
          link="/pi-invoices/create"
          icon={<FiFileText />}
        />
      </div>
    </div>
  );
};

// Recent Activity Section
const RecentActivitySection: React.FC = () => {
  const { permissions } = useAuth();
  const dispatch = useDispatch();
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch recent activity based on user role
    const fetchRecentActivity = async () => {
      try {
        if (permissions.canViewActivityLogs) {
          const data = await dispatch(getActivityLogs({ limit: 5 })).unwrap();
          setRecentActivity(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
      }
    };

    fetchRecentActivity();
  }, [permissions]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
        {permissions.canViewActivityLogs
          ? 'Recent Company Activity'
          : 'Your Recent Activity'}
      </h2>
      <div className="space-y-3">
        {recentActivity.length > 0 ? (
          recentActivity.map((activity: any) => (
            <div
              key={activity.id}
              className="flex items-center space-x-2 sm:space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {activity.description ||
                    `${activity.action} ${activity.entityType}`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No recent activity
          </p>
        )}
      </div>
    </div>
  );
};

// Dashboard Link Component
const DashboardLink: React.FC<{
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}> = ({ title, description, link, icon }) => {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
      onClick={() => navigate(link)}
    >
      <div className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
          {description}
        </p>
      </div>
      <div className="text-gray-400 dark:text-gray-500 flex-shrink-0">
        <FiArrowRight className="text-sm sm:text-base" />
      </div>
    </div>
  );
};

// Stats Chart Component
const StatsChart: React.FC<{ stats: DashboardStats | null }> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
          Data Overview
        </h2>
        <div className="flex items-center justify-center h-60 sm:h-80">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading chart data...
          </p>
        </div>
      </div>
    );
  }

  // Filter out zero values for better chart display
  const dataItems = [
    { label: 'Parties', value: stats.parties, color: '#3B82F6' },
    { label: 'Products', value: stats.products, color: '#10B981' },
    { label: 'PI Invoices', value: stats.piInvoices, color: '#8B5CF6' },
    { label: 'Orders', value: stats.orders, color: '#F59E0B' },
  ].filter((item) => item.value > 0);

  if (dataItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
          Data Overview
        </h2>
        <div className="flex items-center justify-center h-60 sm:h-80">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No data available
          </p>
        </div>
      </div>
    );
  }

  const chartOptions = {
    chart: {
      type: 'donut' as const,
      height: 300,
    },
    labels: dataItems.map((item) => item.label),
    colors: dataItems.map((item) => item.color),
    legend: {
      position: 'bottom' as const,
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
        },
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };

  const series = dataItems.map((item) => item.value);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
        Data Overview
      </h2>
      <Chart options={chartOptions} series={series} type="donut" height={300} />
    </div>
  );
};

// Activity Chart Component
const ActivityChart: React.FC<{ stats: DashboardStats | null }> = ({
  stats,
}) => {
  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
          Data Summary
        </h2>
        <div className="flex items-center justify-center h-60 sm:h-80">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading data...
          </p>
        </div>
      </div>
    );
  }

  const chartOptions = {
    chart: {
      type: 'bar' as const,
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
    },
    xaxis: {
      categories: ['Parties', 'Products', 'PI Invoices', 'Orders'],
    },
    colors: ['#3B82F6'],
    grid: {
      borderColor: '#f1f5f9',
    },
  };

  const series = [
    {
      name: 'Count',
      data: [
        stats.parties || 0,
        stats.products || 0,
        stats.piInvoices || 0,
        stats.orders || 0,
      ],
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-6">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-gray-100">
        Data Summary
      </h2>
      <Chart options={chartOptions} series={series} type="bar" height={300} />
    </div>
  );
};

export default RoleBasedDashboard;

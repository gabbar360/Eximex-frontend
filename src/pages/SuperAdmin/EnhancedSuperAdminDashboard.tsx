import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuilding,
  faBox,
  faShoppingCart,
  faFileInvoice,
  faChartLine,
  faDatabase,
  faRefresh,
  faEye,
  faEdit,
  faTrash,
  faSearch,
  faFilter,
  faDownload,
  faCog,
  faUserShield,
  faLock,
  faUnlock,
  faBell
} from '@fortawesome/free-solid-svg-icons';

import { getSuperAdminDashboardStats, getAllDatabaseData, getAllUsersForSuperAdmin, getAllCompanies } from '../../features/userSlice';

interface DashboardStats {
  users: number;
  companies: number;
  parties: number;
  products: number;
  piInvoices: number;
  orders: number;
  vgmDocuments: number;
  categories: number;
  packagingUnits: number;
}

interface DatabaseData {
  users: any[];
  companies: any[];
  parties: any[];
  products: any[];
  piInvoices: any[];
  orders: any[];
  vgmDocuments: any[];
  categories: any[];
  packagingUnits: any[];
  counts: DashboardStats;
}

const EnhancedSuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [databaseData, setDatabaseData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTable, setSelectedTable] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const dispatch = useDispatch();


  const fetchDashboardStats = async () => {
    try {
      const response = await dispatch(getSuperAdminDashboardStats()).unwrap();
      setStats(response);
    } catch (error) {
      toast.error('Failed to fetch dashboard stats');
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDatabaseData = async () => {
    try {
      const response = await dispatch(getAllDatabaseData({ limit: 100, page: 1 })).unwrap();
      setDatabaseData(response);
    } catch (error) {
      toast.error('Failed to fetch database data');
      console.error('Error fetching database data:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardStats(), fetchDatabaseData()]);
    setRefreshing(false);
    toast.success('Data refreshed successfully');
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardStats(), fetchDatabaseData()]);
      setLoading(false);
    };
    loadData();
  }, []);



  const StatCard = ({ title, value, icon, color, trend }: {
    title: string;
    value: number;
    icon: any;
    color: string;
    trend?: string;
  }) => (
    <div className={`bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300 min-w-0`}>
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1 mr-3">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1 sm:mt-2">
            {(value || 0).toLocaleString()}
          </p>
          {trend && (
            <p className="text-xs sm:text-sm text-green-600 mt-1">
              <FontAwesomeIcon icon={faChartLine} className="mr-1" />
              <span className="hidden sm:inline">{trend}</span>
              <span className="sm:hidden">+{trend.split('%')[0].replace('+', '')}%</span>
            </p>
          )}
        </div>
        <div className={`text-2xl sm:text-3xl lg:text-4xl ${color.replace('border-l-', 'text-')} opacity-80 flex-shrink-0`}>
          <FontAwesomeIcon icon={icon} />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, onClick, color }: {
    title: string;
    description: string;
    icon: any;
    onClick: () => void;
    color: string;
  }) => (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${color} min-w-0`}
    >
      <div className="flex items-start sm:items-center">
        <div className={`text-xl sm:text-2xl ${color.replace('border-l-', 'text-')} mr-3 sm:mr-4 flex-shrink-0 mt-1 sm:mt-0`}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white mb-1 break-words">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">{description}</p>
        </div>
      </div>
    </div>
  );

  const renderTableData = (tableName: string, data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FontAwesomeIcon icon={faDatabase} className="text-4xl mb-4 opacity-50" />
          <p>No data available for {tableName}</p>
        </div>
      );
    }

    const filteredData = data.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    const firstItem = filteredData[0] || data[0];
    const columns = Object.keys(firstItem).filter(
      key => !['password', 'createdAt', 'updatedAt', 'deletedAt'].includes(key)
    );

    const formatCellValue = (value: any, columnName: string) => {
      if (value === null || value === undefined) return '-';
      
      // Handle arrays (like currencies, allowedUnits)
      if (Array.isArray(value)) {
        return value.length > 0 ? value.join(', ') : '-';
      }
      
      // Handle objects (like _count)
      if (typeof value === 'object') {
        if (columnName === '_count') {
          return Object.values(value).reduce((a: any, b: any) => a + b, 0);
        }
        return Object.keys(value).length > 0 ? JSON.stringify(value) : '-';
      }
      
      // Handle boolean values
      if (typeof value === 'boolean') {
        return value ? '✅ Yes' : '❌ No';
      }
      
      // Handle dates
      if (columnName.toLowerCase().includes('at') && typeof value === 'string') {
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      }
      
      // Handle empty strings
      if (value === '') return '-';
      
      return String(value);
    };

    const getColumnWidth = (columnName: string) => {
      const shortColumns = ['id', 'isActive', '_count'];
      const mediumColumns = ['name', 'email', 'phone', 'gstNumber', 'iecNumber'];
      
      if (shortColumns.includes(columnName)) return 'w-20';
      if (mediumColumns.includes(columnName)) return 'w-32';
      return 'w-40';
    };

    return (
      <div className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed" style={{ minWidth: '1400px' }}>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="w-16 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th className="w-48 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">NAME</th>
                <th className="w-64 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">EMAIL</th>
                <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ROLE</th>
                <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">STATUS</th>
                <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">IS BLOCKED</th>
                <th className="w-48 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">LAST LOGIN</th>
                <th className="w-32 px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">COMPANY ID</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.slice(0, 20).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="w-16 px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.id || '-'}
                  </td>
                  <td className="w-48 px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="truncate" title={item.name || '-'}>
                      {item.name || '-'}
                    </div>
                  </td>
                  <td className="w-64 px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="truncate" title={item.email || '-'}>
                      {item.email || '-'}
                    </div>
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      item.role === 'ADMIN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                    }`}>
                      {item.role || '-'}
                    </span>
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                      'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {item.status || 'Invalid Date'}
                    </span>
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      item.isBlocked ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {item.isBlocked ? '❌ Yes' : '✅ No'}
                    </span>
                  </td>
                  <td className="w-48 px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    <div className="truncate" title={item.lastLogin || '-'}>
                      {item.lastLogin ? new Date(item.lastLogin).toLocaleString() : '-'}
                    </div>
                  </td>
                  <td className="w-32 px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {item.companyId || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 break-words">
                Super Admin Dashboard
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Complete system overview and database management
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <FontAwesomeIcon 
                  icon={faRefresh} 
                  className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} 
                />
                <span className="whitespace-nowrap">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('database')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'database'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Database
              </button>
            </nav>
          </div>
        </div>



        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <StatCard
                title="Total Users"
                value={stats.users}
                icon={faUsers}
                color="border-l-blue-500"
                trend="+12% this month"
              />
              <StatCard
                title="Companies"
                value={stats.companies}
                icon={faBuilding}
                color="border-l-green-500"
                trend="+5% this month"
              />
              <StatCard
                title="Products"
                value={stats.products}
                icon={faBox}
                color="border-l-purple-500"
                trend="+18% this month"
              />
              <StatCard
                title="Orders"
                value={stats.orders}
                icon={faShoppingCart}
                color="border-l-orange-500"
                trend="+25% this month"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <StatCard
                title="PI Invoices"
                value={stats.piInvoices}
                icon={faFileInvoice}
                color="border-l-indigo-500"
              />
              <StatCard
                title="Categories"
                value={stats.categories}
                icon={faBox}
                color="border-l-pink-500"
              />
              <StatCard
                title="VGM Documents"
                value={stats.vgmDocuments}
                icon={faFileInvoice}
                color="border-l-red-500"
              />
              <StatCard
                title="Packaging Units"
                value={stats.packagingUnits}
                icon={faBox}
                color="border-l-yellow-500"
              />
            </div>




          </div>
        )}

        {/* Database Management Tab */}
        {activeTab === 'database' && databaseData && (
          <div className="space-y-4 sm:space-y-6">
            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    Select Table:
                  </label>
                  <select
                    value={selectedTable}
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className="w-full sm:w-auto min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                  >
                    {Object.entries(databaseData.counts).map(([key, count]) => (
                      <option key={key} value={key}>
                        {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1">
                    <FontAwesomeIcon 
                      icon={faSearch} 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                    />
                    <input
                      type="text"
                      placeholder="Search data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                    />
                  </div>
                  <button className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm whitespace-nowrap">
                    <FontAwesomeIcon icon={faDownload} className="mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* Table Data */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {selectedTable.replace(/([A-Z])/g, ' $1').trim()} Data
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Showing records from {selectedTable} table
                </p>
              </div>
              {renderTableData(
                selectedTable,
                databaseData[selectedTable as keyof DatabaseData] as any[]
              )}
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              User Management
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Comprehensive user management features coming soon...
            </p>
          </div>
        )}

        {/* Company Management Tab */}
        {activeTab === 'companies' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Company Management
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Company management features coming soon...
            </p>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'system' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
              System Settings
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              System configuration options coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedSuperAdminDashboard;
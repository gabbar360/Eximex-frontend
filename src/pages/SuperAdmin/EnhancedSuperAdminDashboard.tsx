import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
  faUnlock
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
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {(value || 0).toLocaleString()}
          </p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              <FontAwesomeIcon icon={faChartLine} className="mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`text-4xl ${color.replace('border-l-', 'text-')} opacity-80`}>
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
      className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${color}`}
    >
      <div className="flex items-center">
        <div className={`text-2xl ${color.replace('border-l-', 'text-')} mr-4`}>
          <FontAwesomeIcon icon={icon} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
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
      key => !['password', 'createdAt', 'updatedAt'].includes(key)
    );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                >
                  {column.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.slice(0, 20).map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                  >
                    {typeof item[column] === 'object' && item[column] !== null
                      ? JSON.stringify(item[column])
                      : String(item[column] || 'N/A')}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete system overview and database management
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FontAwesomeIcon 
              icon={faRefresh} 
              className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} 
            />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <nav className="flex space-x-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'overview', label: 'Overview', icon: faChartLine },
            { id: 'database', label: 'Database Management', icon: faDatabase },
            { id: 'users', label: 'User Management', icon: faUsers },
            { id: 'companies', label: 'Company Management', icon: faBuilding },
            { id: 'system', label: 'System Settings', icon: faCog }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FontAwesomeIcon icon={tab.icon} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6 sm:space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
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
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <QuickActionCard
              title="User Management"
              description="Manage all system users"
              icon={faUserShield}
              onClick={() => setActiveTab('users')}
              color="border-l-blue-500"
            />
            <QuickActionCard
              title="Company Management"
              description="Manage registered companies"
              icon={faBuilding}
              onClick={() => setActiveTab('companies')}
              color="border-l-green-500"
            />
            <QuickActionCard
              title="Database View"
              description="View all database tables"
              icon={faDatabase}
              onClick={() => setActiveTab('database')}
              color="border-l-purple-500"
            />
            <QuickActionCard
              title="System Settings"
              description="Configure system settings"
              icon={faCog}
              onClick={() => setActiveTab('system')}
              color="border-l-orange-500"
            />
          </div>
        </div>
      )}

      {/* Database Management Tab */}
      {activeTab === 'database' && databaseData && (
        <div className="space-y-6">
          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Table:
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  {Object.entries(databaseData.counts).map(([key, count]) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <FontAwesomeIcon 
                    icon={faSearch} 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  />
                  <input
                    type="text"
                    placeholder="Search data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Table Data */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {selectedTable.replace(/([A-Z])/g, ' $1').trim()} Data
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            User Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive user management features coming soon...
          </p>
        </div>
      )}

      {/* Company Management Tab */}
      {activeTab === 'companies' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Company Management
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Company management features coming soon...
          </p>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'system' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            System Settings
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            System configuration options coming soon...
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedSuperAdminDashboard;
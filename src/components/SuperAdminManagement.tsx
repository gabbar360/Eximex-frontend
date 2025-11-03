import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBuilding,
  faDatabase,
  faShield,
  faChartLine,
  faCog,
  faSearch,
  faFilter,
  faDownload,
  faUpload,
  faRefresh,
  faEye,
  faEdit,
  faTrash,
  faLock,
  faUnlock,
  faUserPlus,
  faFileExport,
  faServer,
  faHistory,
  faExclamationTriangle,
  faCheckCircle,
  faTimesCircle,
  faBan,
  faPlay
} from '@fortawesome/free-solid-svg-icons';
import { 
  getAllUsersForSuperAdmin, 
  getAllCompanies, 
  getAllDatabaseData,
  toggleUserBlock,
  resetUserPassword
} from '../features/userSlice';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  isBlocked: boolean;
  lastLogin: string;
  createdAt: string;
  company?: { name: string };
}

interface Company {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
  _count: {
    users: number;
    parties: number;
    products: number;
  };
}

const SuperAdminManagement: React.FC = () => {
  const [activeSection, setActiveSection] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const dispatch = useDispatch();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await dispatch(getAllUsersForSuperAdmin({
        search: searchTerm,
        role: filterRole,
        status: filterStatus,
        limit: 100
      })).unwrap();
      setUsers(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await dispatch(getAllCompanies({
        search: searchTerm,
        limit: 100
      })).unwrap();
      setCompanies(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch companies');
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserBlock = async (userId: number) => {
    try {
      await dispatch(toggleUserBlock(userId)).unwrap();
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Error toggling user block:', error);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('Enter new password for user:');
    if (!newPassword) return;

    try {
      await dispatch(resetUserPassword({ userId, newPassword })).unwrap();
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error('Failed to reset password');
      console.error('Error resetting password:', error);
    }
  };

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers();
    } else if (activeSection === 'companies') {
      fetchCompanies();
    }
  }, [activeSection, searchTerm, filterRole, filterStatus]);

  const SectionButton = ({ id, label, icon, count }: {
    id: string;
    label: string;
    icon: any;
    count?: number;
  }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center justify-between w-full p-4 rounded-lg transition-all duration-200 ${
        activeSection === id
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-800'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-center">
        <FontAwesomeIcon icon={icon} className="mr-3 text-lg" />
        <span className="font-medium">{label}</span>
      </div>
      {count !== undefined && (
        <span className={`px-2 py-1 text-xs rounded-full ${
          activeSection === id
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const StatusBadge = ({ status, isBlocked }: { status: string; isBlocked?: boolean }) => {
    if (isBlocked) {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
          <FontAwesomeIcon icon={faBan} className="mr-1" />
          Blocked
        </span>
      );
    }

    const statusConfig = {
      ACTIVE: { color: 'green', icon: faCheckCircle },
      INACTIVE: { color: 'yellow', icon: faTimesCircle },
      PENDING: { color: 'blue', icon: faHistory },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-300`}>
        <FontAwesomeIcon icon={config.icon} className="mr-1" />
        {status}
      </span>
    );
  };

  const RoleBadge = ({ role }: { role: string }) => {
    const roleConfig = {
      ADMIN: { color: 'purple', label: 'Admin' },
      STAFF: { color: 'blue', label: 'Staff' },
      SUPER_ADMIN: { color: 'red', label: 'Super Admin' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || { color: 'gray', label: role };

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${config.color}-100 text-${config.color}-800 dark:bg-${config.color}-900/30 dark:text-${config.color}-300`}>
        {config.label}
      </span>
    );
  };

  const renderUsersSection = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Staff</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchUsers}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon={faRefresh} className="mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FontAwesomeIcon icon={faFileExport} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            System Users ({users.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.status} isBlocked={user.isBlocked} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {user.company?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleToggleUserBlock(user.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.isBlocked
                              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                          title={user.isBlocked ? 'Unblock User' : 'Block User'}
                        >
                          <FontAwesomeIcon icon={user.isBlocked ? faUnlock : faLock} />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <FontAwesomeIcon icon={faLock} />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCompaniesSection = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchCompanies}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FontAwesomeIcon icon={faRefresh} className="mr-2" />
              Refresh
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <FontAwesomeIcon icon={faFileExport} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : companies.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No companies found
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {company.email}
                  </p>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <FontAwesomeIcon icon={faEye} />
                </button>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Users:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{company._count.users}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Products:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{company._count.products}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Parties:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{company._count.parties}</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Created: {new Date(company.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen max-w-full overflow-x-hidden">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Super Admin Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive system management and oversight
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Management Sections
            </h2>
            <div className="space-y-3">
              <SectionButton
                id="users"
                label="User Management"
                icon={faUsers}
                count={users.length}
              />
              <SectionButton
                id="companies"
                label="Company Management"
                icon={faBuilding}
                count={companies.length}
              />
              <SectionButton
                id="database"
                label="Database Management"
                icon={faDatabase}
              />
              <SectionButton
                id="security"
                label="Security & Access"
                icon={faShield}
              />
              <SectionButton
                id="analytics"
                label="Analytics & Reports"
                icon={faChartLine}
              />
              <SectionButton
                id="settings"
                label="System Settings"
                icon={faCog}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 min-w-0">
          {activeSection === 'users' && renderUsersSection()}
          {activeSection === 'companies' && renderCompaniesSection()}
          {activeSection === 'database' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Database Management
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Database management features are available in the main dashboard.
              </p>
            </div>
          )}
          {activeSection === 'security' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Security & Access Control
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Security management features coming soon...
              </p>
            </div>
          )}
          {activeSection === 'analytics' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Analytics & Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Analytics and reporting features coming soon...
              </p>
            </div>
          )}
          {activeSection === 'settings' && (
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
      </div>
    </div>
  );
};

export default SuperAdminManagement;
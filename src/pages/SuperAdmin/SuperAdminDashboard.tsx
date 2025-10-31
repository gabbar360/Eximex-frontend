import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { getSuperAdminDashboardStats, getAllDatabaseData } from '../../features/userSlice';
import { toast } from 'react-toastify';

interface DashboardStats {
  users: number;
  companies: number;
  parties: number;
  products: number;
  piInvoices: number;
  orders: number;
  vgmDocuments: number;
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
  counts: {
    users: number;
    companies: number;
    parties: number;
    products: number;
    piInvoices: number;
    orders: number;
    vgmDocuments: number;
    categories: number;
    packagingUnits: number;
  };
}

const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [databaseData, setDatabaseData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTable, setSelectedTable] = useState('users');

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
      const response = await dispatch(getAllDatabaseData({ limit: 50, page: 1 })).unwrap();
      setDatabaseData(response);
    } catch (error) {
      toast.error('Failed to fetch database data');
      console.error('Error fetching database data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDashboardStats(), fetchDatabaseData()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const StatCard = ({
    title,
    value,
    icon,
    color,
  }: {
    title: string;
    value: number;
    icon: string;
    color: string;
  }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`text-4xl ${color.replace('border-l-', 'text-')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const renderTableData = (tableName: string, data: any[]) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No data available for {tableName}
        </div>
      );
    }

    const firstItem = data[0];
    const columns = Object.keys(firstItem).filter(
      (key) => !['password', 'createdAt', 'updatedAt'].includes(key)
    );

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.replace(/([A-Z])/g, ' $1').trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 10).map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                  >
                    {typeof item[column] === 'object' && item[column] !== null
                      ? JSON.stringify(item[column])
                      : String(item[column] || 'N/A')}
                  </td>
                ))}
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Complete system overview and database management
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'database'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Database View
          </button>
        </nav>
      </div>

      {activeTab === 'overview' && stats && (
        <div>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.users}
              icon="👥"
              color="border-l-blue-500"
            />
            <StatCard
              title="Companies"
              value={stats.companies}
              icon="🏢"
              color="border-l-green-500"
            />
            <StatCard
              title="Products"
              value={stats.products}
              icon="📦"
              color="border-l-purple-500"
            />
            <StatCard
              title="Orders"
              value={stats.orders}
              icon="📋"
              color="border-l-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Parties"
              value={stats.parties}
              icon="🤝"
              color="border-l-indigo-500"
            />
            <StatCard
              title="PI Invoices"
              value={stats.piInvoices}
              icon="📄"
              color="border-l-pink-500"
            />
            <StatCard
              title="VGM Documents"
              value={stats.vgmDocuments}
              icon="📊"
              color="border-l-red-500"
            />
          </div>
        </div>
      )}

      {activeTab === 'database' && databaseData && (
        <div>
          {/* Table Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Table to View
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="users">Users ({databaseData.counts.users})</option>
              <option value="companies">
                Companies ({databaseData.counts.companies})
              </option>
              <option value="parties">
                Parties ({databaseData.counts.parties})
              </option>
              <option value="products">
                Products ({databaseData.counts.products})
              </option>
              <option value="piInvoices">
                PI Invoices ({databaseData.counts.piInvoices})
              </option>
              <option value="orders">
                Orders ({databaseData.counts.orders})
              </option>
              <option value="vgmDocuments">
                VGM Documents ({databaseData.counts.vgmDocuments})
              </option>
              <option value="categories">
                Categories ({databaseData.counts.categories})
              </option>
              <option value="packagingUnits">
                Packaging Units ({databaseData.counts.packagingUnits})
              </option>
            </select>
          </div>

          {/* Table Data */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {selectedTable.replace(/([A-Z])/g, ' $1').trim()} Data
              </h3>
              <p className="text-sm text-gray-500">
                Showing first 10 records out of{' '}
                {
                  databaseData.counts[
                    selectedTable as keyof typeof databaseData.counts
                  ]
                }{' '}
                total
              </p>
            </div>
            {renderTableData(
              selectedTable,
              databaseData[selectedTable as keyof DatabaseData] as any[]
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;

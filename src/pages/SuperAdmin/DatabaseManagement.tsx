import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDatabase,
  faRefresh,
  faSearch,
  faDownload,
  faEye,
  faEdit,
  faTrash
} from '@fortawesome/free-solid-svg-icons';
import { getAllDatabaseData } from '../../features/userSlice';

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

const DatabaseManagement: React.FC = () => {
  const [databaseData, setDatabaseData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const dispatch = useDispatch();

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
    await fetchDatabaseData();
    setRefreshing(false);
    toast.success('Database data refreshed successfully');
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDatabaseData();
      setLoading(false);
    };
    loadData();
  }, []);

  const formatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined) return '-';
    
    if (Array.isArray(value)) {
      return value.length > 0 ? value.join(', ') : '-';
    }
    
    if (typeof value === 'object') {
      if (columnName === '_count') {
        return Object.values(value).reduce((a: any, b: any) => a + b, 0);
      }
      return Object.keys(value).length > 0 ? JSON.stringify(value) : '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? '✅ Yes' : '❌ No';
    }
    
    if (columnName.toLowerCase().includes('at') && typeof value === 'string') {
      try {
        return new Date(value).toLocaleDateString();
      } catch {
        return value;
      }
    }
    
    if (value === '') return '-';
    
    return String(value);
  };

  const handleViewDetails = (item: any) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const renderCardView = (tableName: string, data: any[]) => {
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

    const getCardTitle = (item: any) => {
      return item.name || item.title || item.email || `${tableName} #${item.id}`;
    };

    const getCardSubtitle = (item: any) => {
      if (item.email && item.name) return item.email;
      if (item.role) return item.role;
      if (item.status) return item.status;
      return `ID: ${item.id}`;
    };

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredData.slice(0, 50).map((item, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700 p-4 sm:p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  {getCardTitle(item)}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                  {getCardSubtitle(item)}
                </p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                #{item.id}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              {Object.entries(item)
                .filter(([key]) => !['password', 'createdAt', 'updatedAt', 'deletedAt', 'id'].includes(key))
                .slice(0, 3)
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}:
                    </span>
                    <span className="text-xs text-gray-900 dark:text-white truncate ml-2 max-w-[120px]">
                      {formatCellValue(value, key)}
                    </span>
                  </div>
                ))
              }
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleViewDetails(item)}
                className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faEye} className="mr-1" />
                View
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors">
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button className="flex items-center justify-center px-3 py-2 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors">
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const DetailModal = () => {
    if (!showDetailModal || !selectedItem) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedItem.name || selectedItem.title || `${selectedTable} Details`}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(selectedItem)
                .filter(([key]) => !['password'].includes(key))
                .map(([key, value]) => (
                  <div key={key} className="">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                    </label>
                    <div className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-2 rounded border">
                      {formatCellValue(value, key)}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
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
                Database Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                View and manage all database tables and records
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

        {databaseData && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
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
              {renderCardView(
                selectedTable,
                databaseData[selectedTable as keyof DatabaseData] as any[]
              )}
              <DetailModal />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManagement;
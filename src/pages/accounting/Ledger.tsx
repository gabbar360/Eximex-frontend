import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ComponentCard from '../../components/common/ComponentCard';
import {
  fetchLedger,
  clearAccountingError,
} from '../../features/accountingSlice';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';

const Ledger = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { ledger, loading, error } = useSelector((state) => state.accounting);
  const [filters, setFilters] = useState({
    entryType: '',
    partyName: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    dispatch(fetchLedger(filters));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchLedgerData();
  };

  const clearFilters = () => {
    setFilters({
      entryType: '',
      partyName: '',
      dateFrom: '',
      dateTo: '',
    });
    setTimeout(() => fetchLedgerData(), 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEntryTypeColor = (type) => {
    const isDark = theme === 'dark';
    switch (type) {
      case 'SALES':
        return isDark
          ? 'bg-green-900/30 text-green-300 border-green-700'
          : 'bg-green-50 text-green-700 border-green-200';
      case 'RECEIPT':
        return isDark
          ? 'bg-blue-900/30 text-blue-300 border-blue-700'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'PURCHASE':
        return isDark
          ? 'bg-orange-900/30 text-orange-300 border-orange-700'
          : 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return isDark
          ? 'bg-gray-800 text-gray-300 border-gray-600'
          : 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const totalAmount = (ledger || []).reduce(
    (sum, entry) => sum + entry.amount,
    0
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1
            className={`text-2xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Ledger Entries
          </h1>
          <div
            className={`text-lg font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Total: {formatCurrency(totalAmount)}
          </div>
        </div>

        {/* Filters */}
        <ComponentCard
          title="Filters"
          desc="Filter ledger entries by various criteria"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Entry Type
              </label>
              <select
                value={filters.entryType}
                onChange={(e) =>
                  handleFilterChange('entryType', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Types</option>
                <option value="SALES">Sales</option>
                <option value="RECEIPT">Receipt</option>
                <option value="PURCHASE">Purchase</option>
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Party Name
              </label>
              <input
                type="text"
                value={filters.partyName}
                onChange={(e) =>
                  handleFilterChange('partyName', e.target.value)
                }
                placeholder="Search by party name"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-slate-700 text-white rounded-lg transition-colors font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                theme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </ComponentCard>

        {/* Ledger Table */}
        <ComponentCard
          title="Ledger Entries"
          desc={`${(ledger || []).length} entries found`}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Date
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Type
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Reference
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Party
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Description
                    </th>
                    <th
                      className={`text-right py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(ledger || []).map((entry) => (
                    <tr
                      key={entry.id}
                      className={`border-b transition-colors ${
                        theme === 'dark'
                          ? 'border-gray-800 hover:bg-gray-800/50'
                          : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <td
                        className={`py-3 px-4 text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getEntryTypeColor(entry.entryType)}`}
                        >
                          {entry.entryType}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-4 text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        <div>
                          <div className="font-medium">
                            {entry.referenceNumber}
                          </div>
                          <div
                            className={`text-xs ${
                              theme === 'dark'
                                ? 'text-gray-500'
                                : 'text-gray-500'
                            }`}
                          >
                            {entry.referenceType}
                          </div>
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 text-sm font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {entry.partyName}
                      </td>
                      <td
                        className={`py-3 px-4 text-sm max-w-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        <div className="truncate" title={entry.description}>
                          {entry.description}
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 text-sm font-medium text-right ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {formatCurrency(entry.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {(ledger || []).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No ledger entries found
                </div>
              )}
            </div>
          )}
        </ComponentCard>
      </div>
    </div>
  );
};

export default Ledger;

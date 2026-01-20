import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ComponentCard from '../../components/common/ComponentCard';
import accountingService from '../../service/accountingService';
import { toast } from 'react-toastify';
import { Ledger, ProfitLoss, BalanceSheet } from './index';

const AccountingDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ledgerData, setLedgerData] = useState([]);
  const [profitLossData, setProfitLossData] = useState(null);
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current user from Redux store
  const currentUser = useSelector((state) => state.user.user);
  const userRole = currentUser?.role?.name;

  // Define roles that can access accounting data
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT', 'MANAGER'];
  const hasAccess = allowedRoles.includes(userRole);

  const tabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'ledger', label: 'Ledger' },
    { id: 'profit-loss', label: 'Profit & Loss' },
    { id: 'balance-sheet', label: 'Balance Sheet' },
  ];

  useEffect(() => {
    if (hasAccess) {
      fetchAccountingData();
    } else {
      // Set default empty data for users without access
      setLedgerData([]);
      setProfitLossData({
        revenue: 0,
        expenses: 0,
        grossProfit: 0,
        cashFlow: 0,
        cashReceived: 0,
        outstandingReceivables: 0,
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
      });
      setBalanceSheetData({
        accountsReceivable: 0,
        totalAssets: 0,
        asOfDate: new Date().toISOString().split('T')[0],
      });
      setLoading(false);
    }
  }, [hasAccess]);

  const fetchAccountingData = async () => {
    try {
      const [ledger, profitLoss, balanceSheet] = await Promise.all([
        accountingService.getLedger().catch(() => ({ data: [] })),
        accountingService.getProfitLoss().catch(() => ({
          data: {
            revenue: 0,
            expenses: 0,
            grossProfit: 0,
            cashFlow: 0,
            cashReceived: 0,
            outstandingReceivables: 0,
            fromDate: new Date().toISOString().split('T')[0],
            toDate: new Date().toISOString().split('T')[0],
          },
        })),
        accountingService.getBalanceSheet().catch(() => ({
          data: {
            accountsReceivable: 0,
            totalAssets: 0,
            asOfDate: new Date().toISOString().split('T')[0],
          },
        })),
      ]);

      setLedgerData(ledger.data || []);
      setProfitLossData(profitLoss.data);
      setBalanceSheetData(balanceSheet.data);
    } catch (error) {
      // Set default empty data on error
      setLedgerData([]);
      setProfitLossData({
        revenue: 0,
        expenses: 0,
        grossProfit: 0,
        cashFlow: 0,
        cashReceived: 0,
        outstandingReceivables: 0,
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
      });
      setBalanceSheetData({
        accountsReceivable: 0,
        totalAssets: 0,
        asOfDate: new Date().toISOString().split('T')[0],
      });
    }
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
    });
  };

  const getEntryTypeColor = (type) => {
    switch (type) {
      case 'SALES':
        return 'bg-success-50 text-success-700 border-success-200';
      case 'RECEIPT':
        return 'bg-blue-light-50 text-blue-light-700 border-blue-light-200';
      case 'PURCHASE':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-lg">
        <div className="px-6 py-4">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'dashboard' && (
          <DashboardContent
            ledgerData={ledgerData}
            profitLossData={profitLossData}
            balanceSheetData={balanceSheetData}
            loading={loading}
            fetchAccountingData={fetchAccountingData}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getEntryTypeColor={getEntryTypeColor}
          />
        )}
        {activeTab === 'ledger' && <Ledger />}
        {activeTab === 'profit-loss' && <ProfitLoss />}
        {activeTab === 'balance-sheet' && <BalanceSheet />}
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({
  ledgerData,
  profitLossData,
  balanceSheetData,
  loading,
  fetchAccountingData,
  formatCurrency,
  formatDate,
  getEntryTypeColor,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
          Accounting Dashboard
        </h1>
        <button
          onClick={fetchAccountingData}
          className="px-4 py-2 bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Refresh Data
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {profitLossData && (
          <>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Revenue
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(profitLossData.revenue)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-slate-700  rounded-full">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Expenses
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(profitLossData.expenses)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-slate-700 rounded-full">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Gross Profit
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(profitLossData.grossProfit)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-slate-700 rounded-full">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cash Flow
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(profitLossData.cashFlow)}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-slate-700 rounded-full">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Ledger Entries */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 sm:p-6">
            <div className="flex items-start justify-between mb-3 sm:mb-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg
                    className="w-4 h-4 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    Recent Ledger Entries
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Latest accounting transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">
                  Live Data
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Date
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Type
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Party
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm hidden sm:table-cell">
                      Description
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ledgerData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        <div className="flex flex-col items-center">
                          <svg
                            className="w-12 h-12 mb-2 text-gray-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p>No accounting entries found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    ledgerData.slice(0, 10).map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(entry.date)}
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getEntryTypeColor(entry.entryType)}`}
                          >
                            {entry.entryType}
                          </span>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-900 dark:text-white font-medium">
                          <div className="max-w-[120px] sm:max-w-none truncate">
                            {entry.partyName}
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate hidden sm:table-cell">
                          {entry.description}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-xs sm:text-sm font-medium text-right text-gray-900 dark:text-white">
                          {formatCurrency(entry.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Balance Sheet & P&L Summary */}
        <div className="space-y-4 sm:space-y-6">
          {/* Balance Sheet */}
          {balanceSheetData && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg
                      className="w-4 h-4 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      Balance Sheet
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      As of {formatDate(balanceSheetData.asOfDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">
                    Live
                  </span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Accounts Receivable
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(balanceSheetData.accountsReceivable)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Assets
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white">
                    {formatCurrency(balanceSheetData.totalAssets)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* P&L Additional Details */}
          {profitLossData && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 sm:p-6">
              <div className="flex items-start justify-between mb-3 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <svg
                      className="w-4 h-4 sm:w-6 sm:h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      P&L Details
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(profitLossData.fromDate)} to{' '}
                      {formatDate(profitLossData.toDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">
                    Live
                  </span>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cash Received
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-success-600 dark:text-success-400">
                    {formatCurrency(profitLossData.cashReceived)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                    Outstanding Receivables
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(profitLossData.outstandingReceivables)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountingDashboard;

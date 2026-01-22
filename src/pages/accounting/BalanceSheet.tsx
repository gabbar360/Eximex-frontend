import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ComponentCard from '../../components/common/ComponentCard';
import { fetchBalanceSheet } from '../../features/accountingSlice';

const BalanceSheet = () => {
  const dispatch = useDispatch();
  const { balanceSheet, loading } = useSelector((state) => state.accounting);
  const [asOfDate, setAsOfDate] = useState('');

  useEffect(() => {
    fetchBalanceSheetData();
  }, []);

  const fetchBalanceSheetData = async () => {
    const params = asOfDate ? { asOfDate } : {};
    dispatch(fetchBalanceSheet(params));
  };

  const handleDateChange = (value) => {
    setAsOfDate(value);
  };

  const applyDate = () => {
    fetchBalanceSheetData();
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
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Balance Sheet
        </h1>
        {balanceSheet && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            As of: {formatDate(balanceSheet.asOfDate)}
          </div>
        )}
      </div>

      {/* Date Filter */}
      <ComponentCard title="Report Date" desc="Select date for balance sheet">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              As of Date
            </label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <button
              onClick={applyDate}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors border border-gray-600"
            >
              Generate Balance Sheet
            </button>
          </div>
        </div>
      </ComponentCard>

      {balanceSheet && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Total Assets</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(balanceSheet.totalAssets)}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <svg
                    className="w-8 h-8"
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
              </div>
            </div>

            <div className="bg-slate-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">
                    Accounts Receivable
                  </p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(balanceSheet.accountsReceivable)}
                  </p>
                  <p className="text-white text-xs mt-1">
                    {(
                      (balanceSheet.accountsReceivable /
                        balanceSheet.totalAssets) *
                      100
                    ).toFixed(1)}
                    % of Total Assets
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <svg
                    className="w-8 h-8"
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
              </div>
            </div>
          </div>

          {/* Detailed Balance Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assets */}
            <ComponentCard title="Assets" desc="Current and non-current assets">
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Current Assets
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Accounts Receivable
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Outstanding customer payments
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(balanceSheet.accountsReceivable)}
                      </span>
                    </div>

                    {/* Placeholder for other current assets */}
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-50">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Cash & Cash Equivalents
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Bank accounts and liquid assets
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-50">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Inventory
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Stock and raw materials
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">
                      Total Assets
                    </span>
                    <span className="text-lg font-bold text-white">
                      {formatCurrency(balanceSheet.totalAssets)}
                    </span>
                  </div>
                </div>
              </div>
            </ComponentCard>

            {/* Liabilities & Equity */}
            <ComponentCard
              title="Liabilities & Equity"
              desc="Financial obligations and owner's equity"
            >
              <div className="space-y-4">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Current Liabilities
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-50">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Accounts Payable
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Outstanding supplier payments
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg opacity-50">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Short-term Loans
                        </span>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Bank loans and credit facilities
                        </div>
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Owner's Equity
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
                      <div>
                        <span className="font-medium text-white">
                          Retained Earnings
                        </span>
                        <div className="text-sm text-white">
                          Accumulated profits
                        </div>
                      </div>
                      <span className="font-semibold text-white">
                        {formatCurrency(balanceSheet.totalAssets)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">
                      Total Liabilities & Equity
                    </span>
                    <span className="text-lg font-bold text-white">
                      {formatCurrency(balanceSheet.totalAssets)}
                    </span>
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>

          {/* Financial Ratios */}
          <ComponentCard
            title="Key Financial Ratios"
            desc="Important financial health indicators"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-white">
                  {(
                    (balanceSheet.accountsReceivable /
                      balanceSheet.totalAssets) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-sm font-medium text-white mt-1">
                  Receivables to Assets Ratio
                </div>
                <div className="text-xs text-white mt-1">
                  Liquidity indicator
                </div>
              </div>

              <div className="text-center p-4 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-white">100%</div>
                <div className="text-sm font-medium text-white mt-1">
                  Equity Ratio
                </div>
                <div className="text-xs text-white mt-1">
                  Financial stability
                </div>
              </div>

              <div className="text-center p-4 bg-slate-700 rounded-lg">
                <div className="text-2xl font-bold text-white">0%</div>
                <div className="text-sm font-medium text-white mt-1">
                  Debt Ratio
                </div>
                <div className="text-xs text-white mt-1">
                  Leverage indicator
                </div>
              </div>
            </div>
          </ComponentCard>
        </>
      )}
    </div>
  );
};

export default BalanceSheet;

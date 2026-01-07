import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ComponentCard from '../../components/common/ComponentCard';
import { fetchProfitLoss } from '../../features/accountingSlice';
import { toast } from 'react-toastify';

const ProfitLoss = () => {
  const dispatch = useDispatch();
  const { profitLoss, loading } = useSelector(state => state.accounting);
  const [dateRange, setDateRange] = useState({
    fromDate: '',
    toDate: '',
  });

  useEffect(() => {
    fetchProfitLossData();
  }, []);

  const fetchProfitLossData = async () => {
    dispatch(fetchProfitLoss(dateRange));
  };

  const handleDateRangeChange = (key, value) => {
    setDateRange((prev) => ({ ...prev, [key]: value }));
  };

  const applyDateRange = () => {
    fetchProfitLossData();
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

  const calculateProfitMargin = () => {
    if (!profitLoss || profitLoss.revenue === 0) return 0;
    return (
      (profitLoss.grossProfit / profitLoss.revenue) *
      100
    ).toFixed(2);
  };

  const calculateCollectionRatio = () => {
    if (!profitLoss || profitLoss.revenue === 0) return 0;
    return (
      (profitLoss.cashReceived / profitLoss.revenue) *
      100
    ).toFixed(2);
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
          Profit & Loss Statement
        </h1>
        {profitLoss && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Period: {formatDate(profitLoss.fromDate)} -{' '}
            {formatDate(profitLoss.toDate)}
          </div>
        )}
      </div>

      {/* Date Range Filter */}
      <ComponentCard
        title="Date Range"
        desc="Select custom date range for P&L report"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.fromDate}
              onChange={(e) =>
                handleDateRangeChange('fromDate', e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.toDate}
              onChange={(e) => handleDateRangeChange('toDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <button
              onClick={applyDateRange}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors border border-gray-600"
            >
              Generate Report
            </button>
          </div>
        </div>
      </ComponentCard>

      {profitLoss && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(profitLoss.revenue)}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <svg
                    className="w-6 h-6"
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

            <div className="bg-slate-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(profitLoss.expenses)}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <svg
                    className="w-6 h-6"
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

            <div className="bg-slate-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Gross Profit</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(profitLoss.grossProfit)}
                  </p>
                  <p className="text-white text-xs">
                    Margin: {calculateProfitMargin()}%
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <svg
                    className="w-6 h-6"
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

            <div className="bg-slate-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">Cash Flow</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(profitLoss.cashFlow)}
                  </p>
                </div>
                <div className="p-3 bg-white/20 rounded-full">
                  <svg
                    className="w-6 h-6"
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
          </div>

          {/* Detailed P&L Statement */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComponentCard
              title="Profit & Loss Statement"
              desc="Detailed financial breakdown"
            >
              <div className="space-y-4">
                {/* Revenue Section */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Revenue
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Sales
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(profitLoss.revenue)}
                    </span>
                  </div>
                </div>

                {/* Expenses Section */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Expenses
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Purchases
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(profitLoss.expenses)}
                    </span>
                  </div>
                </div>

                {/* Profit Section */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">
                      Gross Profit
                    </span>
                    <span className="text-lg font-bold text-white">
                      {formatCurrency(profitLoss.grossProfit)}
                    </span>
                  </div>
                  <div className="text-sm text-white mt-1">
                    Profit Margin: {calculateProfitMargin()}%
                  </div>
                </div>
              </div>
            </ComponentCard>

            <ComponentCard
              title="Cash Flow Analysis"
              desc="Cash collection and outstanding amounts"
            >
              <div className="space-y-4">
                {/* Cash Received */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">
                      Cash Received
                    </span>
                    <span className="font-bold text-white">
                      {formatCurrency(profitLoss.cashReceived)}
                    </span>
                  </div>
                  <div className="text-sm text-white mt-1">
                    Collection Rate: {calculateCollectionRatio()}%
                  </div>
                </div>

                {/* Outstanding Receivables */}
                <div className="bg-slate-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-white">
                      Outstanding Receivables
                    </span>
                    <span className="font-bold text-white">
                      {formatCurrency(profitLoss.outstandingReceivables)}
                    </span>
                  </div>
                  <div className="text-sm text-white mt-1">
                    Pending Collection:{' '}
                    {(100 - calculateCollectionRatio()).toFixed(2)}%
                  </div>
                </div>

                {/* Net Cash Flow */}
                <div className="bg-slate-700 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">
                      Net Cash Flow
                    </span>
                    <span className="font-bold text-white">
                      {formatCurrency(profitLoss.cashFlow)}
                    </span>
                  </div>
                  <div className="text-sm text-white mt-1">
                    Cash Received - Expenses
                  </div>
                </div>
              </div>
            </ComponentCard>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfitLoss;

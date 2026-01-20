import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  MdTrendingUp,
  MdTrendingDown,
  MdShoppingCart,
  MdPeople,
  MdAttachMoney,
  MdInventory,
  MdMoreVert,
  MdDownload,
  MdFullscreen,
  MdPrint,
  MdRefresh,
} from 'react-icons/md';

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { fetchOrders } from '../../features/orderSlice';
import { fetchProducts } from '../../features/productSlice';
import { fetchParties } from '../../features/partySlice';
import { fetchPiInvoices } from '../../features/piSlice';
import { getShipments } from '../../features/shipmentSlice';
import { fetchPackingLists } from '../../features/packingListSlice';
import { fetchVgmDocuments } from '../../features/vgmSlice';
import { fetchPurchaseOrders } from '../../features/purchaseOrderSlice';
import { toast } from 'react-toastify';

// ---------------------- Metric Card ---------------------------
const MetricCard = ({ title, value, icon }) => {
  return (
    <div className="dashboard-metric-card bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200 p-2 sm:p-3 h-16 sm:h-20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="dashboard-metric-title text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="dashboard-metric-value text-sm sm:text-xl font-bold text-gray-900 dark:text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-700 rounded-lg flex items-center justify-center text-white ml-2">
          {icon}
        </div>
      </div>
    </div>
  );
};

// ---------------------- Chart Wrapper -------------------------
const ChartCard = ({ title, description, icon, height = 400, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-3 sm:p-6">
      <div className="flex items-start justify-between mb-3 sm:mb-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-12 sm:h-12 bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg">
            {icon}
          </div>
          <div>
            <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 sm:space-x-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium hidden sm:inline">
            Live Data
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium sm:hidden">
            Live
          </span>
        </div>
      </div>

      <div
        style={{
          height:
            window.innerWidth < 640 ? Math.max(250, height * 0.6) : height,
        }}
        className="dashboard-chart-container w-full"
        data-chart={title}
      >
        {children}
      </div>
    </div>
  );
};

// ---------------------- Main Dashboard -------------------------
export default function UserDashboard() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.user);

  const { orders = [] } = useSelector((s) => s.order);
  const { products = [] } = useSelector((s) => s.product);
  const { parties = [] } = useSelector((s) => s.party);
  const { piInvoices = [] } = useSelector((s) => s.pi);
  const { shipments = [] } = useSelector((s) => s.shipment);
  const { packingLists = [] } = useSelector((s) => s.packingList);
  const { vgmDocuments = [] } = useSelector((s) => s.vgm);
  const { purchaseOrders = [] } = useSelector((s) => s.purchaseOrder);

  useEffect(() => {
    // Dispatch all slices individually - each handles its own errors
    dispatch(fetchOrders());
    dispatch(fetchProducts());
    dispatch(fetchParties());
    dispatch(fetchPiInvoices());
    dispatch(getShipments({}));
    dispatch(fetchPackingLists());
    // dispatch(fetchVgmDocuments()); // Temporarily disabled due to 500 error
    dispatch(fetchPurchaseOrders());
  }, []); // Empty dependency array to run only once

  // ----------------------- Stats ----------------------------
  const stats = useMemo(
    () => ({
      totalOrders: orders.length,
      totalProducts: products.length,
      totalParties: parties.length,
      totalPiInvoices: piInvoices.length,
      totalShipments: shipments.length,
      totalPackingLists: packingLists.length,
      totalVgmDocuments: vgmDocuments.length,
      totalPurchaseOrders: purchaseOrders.length,
    }),
    [
      orders,
      products,
      parties,
      piInvoices,
      shipments,
      packingLists,
      vgmDocuments,
      purchaseOrders,
    ]
  );

  // ---------------------- Chart Data ----------------------
  const chart1Data = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months.map((m, i) => ({
      month: m,
      contacts: Math.round(stats.totalParties * (i / 12)),
      products: Math.round(stats.totalProducts * (i / 12)),
      piInvoices: Math.round(stats.totalPiInvoices * (i / 12)),
      orders: Math.round(stats.totalOrders * (i / 12)),
    }));
  }, [
    stats.totalParties,
    stats.totalProducts,
    stats.totalPiInvoices,
    stats.totalOrders,
  ]);

  const chart2Data = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months.map((m, i) => ({
      month: m,
      packing: Math.round(stats.totalPackingLists * (i / 12)),
      purchaseOrders: Math.round(stats.totalPurchaseOrders * (i / 12)),
      shipments: Math.round(stats.totalShipments * (i / 12)),
      vgm: Math.round(stats.totalVgmDocuments * (i / 12)),
    }));
  }, [
    stats.totalPackingLists,
    stats.totalPurchaseOrders,
    stats.totalShipments,
    stats.totalVgmDocuments,
  ]);

  return (
    <div className="p-2 sm:p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-4 sm:p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Welcome Back,{' '}
              {currentUser?.name
                ?.split(' ')
                .map(
                  (word) =>
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                )
                .join(' ') || 'User'}
              !
            </h1>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800  text-white rounded-lg flex items-center gap-2 transition-colors duration-200 text-sm font-medium"
          >
            <MdRefresh size={16} /> Refresh Data
          </button>
        </div>

        {/* METRIC BOXES */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <MetricCard
            title="Contacts"
            value={stats.totalParties}
            icon={<MdPeople className="w-4 h-4" />}
          />
          <MetricCard
            title="PI Invoices"
            value={stats.totalPiInvoices}
            icon={<MdAttachMoney className="w-4 h-4" />}
          />
          <MetricCard
            title="Products"
            value={stats.totalProducts}
            icon={<MdInventory className="w-4 h-4" />}
          />
          <MetricCard
            title="Orders"
            value={stats.totalOrders}
            icon={<MdShoppingCart className="w-4 h-4" />}
          />
          <MetricCard
            title="Shipments"
            value={stats.totalShipments}
            icon={<MdShoppingCart className="w-4 h-4" />}
          />
          <MetricCard
            title="Packing Lists"
            value={stats.totalPackingLists}
            icon={<MdInventory className="w-4 h-4" />}
          />

          <MetricCard
            title="VGM Documents"
            value={stats.totalVgmDocuments}
            icon={<MdAttachMoney className="w-4 h-4" />}
          />
          <MetricCard
            title="Purchase Orders"
            value={stats.totalPurchaseOrders}
            icon={<MdShoppingCart className="w-4 h-4" />}
          />
        </div>

        {/* TWO CHARTS IN SINGLE COLUMN */}
        <div className="space-y-4 sm:space-y-6">
          {/* FIRST CHART */}
          <ChartCard
            title="Core Business Metrics"
            description="Track contacts, products, invoices and orders performance"
            icon={<MdPeople className="w-6 h-6" />}
            height={400}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chart1Data}
                margin={{ top: 10, right: 10, left: 5, bottom: 10 }}
              >
                <defs>
                  <linearGradient
                    id="contactsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient
                    id="productsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis
                  domain={[0, (dataMax) => Math.ceil(dataMax + dataMax * 0.1)]}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />

                <Bar
                  dataKey="contacts"
                  fill="url(#contactsGradient)"
                  name="Contacts"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="products"
                  fill="url(#productsGradient)"
                  name="Products"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={30}
                />
                <Line
                  dataKey="piInvoices"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="PI Invoices"
                  type="monotone"
                  dot={{ r: 3 }}
                />
                <Line
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Orders"
                  type="monotone"
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* SECOND CHART */}
          <ChartCard
            title="Operations & Logistics"
            description="Monitor shipments, packing, purchases and documentation"
            icon={<MdInventory className="w-6 h-6" />}
            height={400}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chart2Data}
                margin={{ top: 10, right: 10, left: 5, bottom: 10 }}
              >
                <defs>
                  <linearGradient
                    id="packingGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient
                    id="purchaseGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient
                    id="shipmentsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                  </linearGradient>
                  <linearGradient id="vgmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  opacity={0.6}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <YAxis
                  domain={[0, (dataMax) => Math.ceil(dataMax + dataMax * 0.1)]}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />

                <Bar
                  dataKey="packing"
                  fill="url(#packingGradient)"
                  name="Packing Lists"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="purchaseOrders"
                  fill="url(#purchaseGradient)"
                  name="Purchase Orders"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="shipments"
                  fill="url(#shipmentsGradient)"
                  name="Shipments"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={30}
                />
                <Bar
                  dataKey="vgm"
                  fill="url(#vgmGradient)"
                  name="VGM Documents"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={30}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

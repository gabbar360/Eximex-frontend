import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  People,
  AttachMoney,
  Inventory,
} from '@mui/icons-material';
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

const MobileMetricCard = ({ title, value, icon }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-3 h-16">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center text-white ml-2">
          {icon}
        </div>
      </div>
    </div>
  );
};

const MobileChartCard = ({ title, description, icon, children, height = 250 }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white shadow-md">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Live</span>
      </div>
    </div>
    <div style={{ height: `${height}px` }} className="w-full">
      {children}
    </div>
  </div>
);

export default function MobileOptimizedDashboard() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.user.user);
  const { orders = [] } = useSelector((state: any) => state.order);
  const { products = [] } = useSelector((state: any) => state.product);
  const { parties = [] } = useSelector((state: any) => state.party);
  const { piInvoices = [] } = useSelector((state: any) => state.pi);
  const { shipments = [] } = useSelector((state: any) => state.shipment);
  const { packingLists = [] } = useSelector((state: any) => state.packingList);
  const { vgmDocuments = [] } = useSelector((state: any) => state.vgm);
  const { purchaseOrders = [] } = useSelector((state: any) => state.purchaseOrder);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchProducts());
    dispatch(fetchParties());
    dispatch(fetchPiInvoices());
    dispatch(getShipments({}));
    dispatch(fetchPackingLists());
    // dispatch(fetchVgmDocuments()); // Temporarily disabled due to 500 error
    dispatch(fetchPurchaseOrders());
  }, []); // Empty dependency array to run only once

  const stats = useMemo(() => ({
    totalOrders: orders.length,
    totalProducts: products.length,
    totalParties: parties.length,
    totalPiInvoices: piInvoices.length,
    totalShipments: shipments.length,
    totalPackingLists: packingLists.length,
    totalVgmDocuments: vgmDocuments.length,
    totalPurchaseOrders: purchaseOrders.length,
  }), [
    orders,
    products,
    parties,
    piInvoices,
    shipments,
    packingLists,
    vgmDocuments,
    purchaseOrders
  ]); 

  const chart1Data = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.map((m, i) => ({
      month: m,
      contacts: Math.round(stats.totalParties * (i / 12)),
      products: Math.round(stats.totalProducts * (i / 12)),
      piInvoices: Math.round(stats.totalPiInvoices * (i / 12)),
      orders: Math.round(stats.totalOrders * (i / 12)),
    }));
  }, [stats.totalParties, stats.totalProducts, stats.totalPiInvoices, stats.totalOrders]);

  const chart2Data = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months.map((m, i) => ({
      month: m,
      packing: Math.round(stats.totalPackingLists * (i / 12)),
      purchaseOrders: Math.round(stats.totalPurchaseOrders * (i / 12)),
      shipments: Math.round(stats.totalShipments * (i / 12)),
      vgm: Math.round(stats.totalVgmDocuments * (i / 12)),
  
    }));
  }, [stats.totalPackingLists, stats.totalPurchaseOrders, stats.totalShipments, stats.totalVgmDocuments]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Welcome Back, {currentUser?.name?.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ') || 'User'}!
            </h1>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 rounded-xl flex items-center justify-center">
            <div className="w-4 h-4 sm:w-6 sm:h-6 bg-white rounded opacity-90"></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Metrics Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <MobileMetricCard title="Contacts" value={stats.totalParties} icon={<People className="w-3 h-3" />} />
          <MobileMetricCard title="PI Invoices" value={stats.totalPiInvoices} icon={<AttachMoney className="w-3 h-3" />} />
          <MobileMetricCard title="Products" value={stats.totalProducts} icon={<Inventory className="w-3 h-3" />} />
          <MobileMetricCard title="Orders" value={stats.totalOrders} icon={<ShoppingCart className="w-3 h-3" />} />
          <MobileMetricCard title="Shipments" value={stats.totalShipments} icon={<ShoppingCart className="w-3 h-3" />} />
          <MobileMetricCard title="Packing Lists" value={stats.totalPackingLists} icon={<Inventory className="w-3 h-3" />} />

          <MobileMetricCard title="VGM Documents" value={stats.totalVgmDocuments} icon={<AttachMoney className="w-3 h-3" />} />
          <MobileMetricCard title="Purchase Orders" value={stats.totalPurchaseOrders} icon={<ShoppingCart className="w-3 h-3" />} />
        </div>

        {/* Mobile Charts - Two Separate Charts */}
        <div className="space-y-4">
          {/* First Mobile Chart */}
          <MobileChartCard 
            title="Core Business Metrics" 
            description="Contacts, products, invoices & orders"
            icon={<People className="w-5 h-5" />}
            height={280}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart1Data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="mobileContactsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="mobileProductsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis domain={[0, (dataMax) => Math.ceil(dataMax + dataMax * 0.1)]} allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={35} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />

                <Bar dataKey="contacts" fill="url(#mobileContactsGradient)" name="Contacts" radius={[2, 2, 0, 0]} maxBarSize={20} />
                <Bar dataKey="products" fill="url(#mobileProductsGradient)" name="Products" radius={[2, 2, 0, 0]} maxBarSize={20} />
                <Line dataKey="piInvoices" stroke="#10b981" strokeWidth={2} name="PI Invoices" type="monotone" dot={{ r: 2 }} />
                <Line dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" type="monotone" dot={{ r: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </MobileChartCard>

          {/* Second Mobile Chart */}
          <MobileChartCard 
            title="Operations & Logistics" 
            description="Shipments, packing & documentation"
            icon={<Inventory className="w-5 h-5" />}
            height={280}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chart2Data} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="mobilePackingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="mobilePurchaseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="mobileShipmentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="mobileVgmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  </linearGradient>

                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.6} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                <YAxis domain={[0, (dataMax) => Math.ceil(dataMax + dataMax * 0.1)]} allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} width={35} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '10px' }} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />

                <Bar dataKey="packing" fill="url(#mobilePackingGradient)" name="Packing Lists" radius={[2, 2, 0, 0]} maxBarSize={20} />
                <Bar dataKey="purchaseOrders" fill="url(#mobilePurchaseGradient)" name="Purchase Orders" radius={[2, 2, 0, 0]} maxBarSize={20} />
                <Bar dataKey="shipments" fill="url(#mobileShipmentsGradient)" name="Shipments" radius={[2, 2, 0, 0]} maxBarSize={20} />
                <Bar dataKey="vgm" fill="url(#mobileVgmGradient)" name="VGM Documents" radius={[2, 2, 0, 0]} maxBarSize={20} />

              </ComposedChart>
            </ResponsiveContainer>
          </MobileChartCard>
        </div>
      </div>
    </div>
  );
}

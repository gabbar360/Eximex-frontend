import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "react-icons/md";

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
} from "recharts";

import { fetchOrders } from "../../features/orderSlice";
import { fetchProducts } from "../../features/productSlice";
import { fetchParties } from "../../features/partySlice";
import { fetchPiInvoices } from "../../features/piSlice";
import { getShipments } from "../../features/shipmentSlice";
import { fetchPackingLists } from "../../features/packingListSlice";
import { fetchVgmDocuments } from "../../features/vgmSlice";
import { fetchPurchaseOrders } from "../../features/purchaseOrderSlice";
import { toast } from "react-toastify";


// ---------------------- Metric Card ---------------------------
const MetricCard = ({ title, value, change, icon, bgColor }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm p-4 h-full">
    <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>

    <div className="flex items-center space-x-1 mt-1">
      {change > 0 ? (
        <MdTrendingUp className="text-green-500 text-sm" />
      ) : (
        <MdTrendingDown className="text-red-500 text-sm" />
      )}

      <span className="text-xs">
        {change > 0 ? "+" : ""}
        {change}%
      </span>
    </div>
  </div>
);


// ---------------------- Chart Wrapper -------------------------
const ChartCard = ({ title, height = 400, children }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{title}</h3>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-200 rounded-lg"
            >
              <MdMoreVert size={20} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 bg-white shadow-md border rounded-lg w-40 z-10">
                <button className="block px-4 py-2 w-full text-left hover:bg-gray-100 flex gap-2">
                  <MdDownload /> Export
                </button>
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="block px-4 py-2 w-full text-left hover:bg-gray-100 flex gap-2"
                >
                  <MdFullscreen /> Fullscreen
                </button>
                <button className="block px-4 py-2 w-full text-left hover:bg-gray-100 flex gap-2">
                  <MdPrint /> Print
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ height }} data-chart={title}>
          {children}
        </div>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-6xl h-[90%]">
            <div className="flex justify-between mb-4">
              <h2 className="text-2xl font-bold">{title}</h2>
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg"
              >
                Close
              </button>
            </div>
            <div className="h-[85%]">{children}</div>
          </div>
        </div>
      )}
    </>
  );
};


// ---------------------- Main Dashboard -------------------------
export default function UserDashboard() {
  const dispatch = useDispatch();

  const { orders = [] } = useSelector((s) => s.order);
  const { products = [] } = useSelector((s) => s.product);
  const { parties = [] } = useSelector((s) => s.party);
  const { piInvoices = [] } = useSelector((s) => s.pi);
  const { shipments = [] } = useSelector((s) => s.shipment);
  const { packingLists = [] } = useSelector((s) => s.packingList);
  const { vgmDocuments = [] } = useSelector((s) => s.vgm);
  const { purchaseOrders = [] } = useSelector((s) => s.purchaseOrder);

  useEffect(() => {
    dispatch(fetchOrders());
    dispatch(fetchProducts());
    dispatch(fetchParties());
    dispatch(fetchPiInvoices());
    dispatch(getShipments({}));
    dispatch(fetchPackingLists());
    dispatch(fetchVgmDocuments());
    dispatch(fetchPurchaseOrders());
  }, [dispatch]);

  // ----------------------- Stats ----------------------------
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

  // ---------------------- Single Combined Chart Data ----------------------
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

 const combinedData = months.map((m, i) => ({
  month: m,

  contacts: Math.round(stats.totalParties * (i / 12)),
  products: Math.round(stats.totalProducts * (i / 12)),
  orders: Math.round(stats.totalOrders * (i / 12)),
  piInvoices: Math.round(stats.totalPiInvoices * (i / 12)),
  shipments: Math.round(stats.totalShipments * (i / 12)),
  packing: Math.round(stats.totalPackingLists * (i / 12)),
  vgm: Math.round(stats.totalVgmDocuments * (i / 12)),
  purchaseOrders: Math.round(stats.totalPurchaseOrders * (i / 12)),

}));



  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white border rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg flex items-center gap-2"
          >
            <MdRefresh /> Refresh
          </button>
        </div>

        {/* METRIC BOXES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          <MetricCard title="Contacts" value={stats.totalParties} change={5.7} icon={<MdPeople />} />
          <MetricCard title="PI Invoices" value={stats.totalPiInvoices} change={8.2} icon={<MdAttachMoney />} />
          <MetricCard title="Products" value={stats.totalProducts} change={18.1} icon={<MdInventory />} />
          <MetricCard title="Orders" value={stats.totalOrders} change={-2.3} icon={<MdShoppingCart />} />

          <MetricCard title="Shipments" value={stats.totalShipments} change={12.4} icon={<MdShoppingCart />} />
          <MetricCard title="Packing Lists" value={stats.totalPackingLists} change={6.8} icon={<MdInventory />} />
          <MetricCard title="VGM Documents" value={stats.totalVgmDocuments} change={4.2} icon={<MdAttachMoney />} />
          <MetricCard title="Purchase Orders" value={stats.totalPurchaseOrders} change={9.1} icon={<MdShoppingCart />} />

        </div>

        {/* ONLY ONE COMBINED CHART BELOW */}
        <ChartCard title="All Metrics Single Combined Chart" height={450}>
          <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
  data={combinedData}
  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
>
  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
  <XAxis dataKey="month" />

<YAxis  
  domain={[0, (dataMax) => Math.ceil(dataMax + dataMax * 0.2)]}
  allowDecimals={false}
  tickFormatter={(v) => Math.round(v)}
/>


  <Tooltip />
  <Legend />

  {/* Bars */}
  <Bar dataKey="contacts" fill="#6366f1" name="Contacts" />
  <Bar dataKey="products" fill="#8b5cf6" name="Products" />
  <Bar dataKey="shipments" fill="#f97316" name="Shipments" />

  {/* Lines */}
  <Line dataKey="orders" stroke="#3b82f6" strokeWidth={2} name="Orders" />
  <Line dataKey="piInvoices" stroke="#10b981" strokeWidth={2} name="PI Invoices" />
  <Line dataKey="packing" stroke="#14b8a6" strokeWidth={2} name="Packing" />
  <Line dataKey="vgm" stroke="#6366f1" strokeWidth={2} name="VGM" />
  <Line dataKey="purchaseOrders" stroke="#ec4899" strokeWidth={2} name="Purchase Orders" />
</ComposedChart>

          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}

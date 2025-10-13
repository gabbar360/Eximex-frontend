import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faDownload,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import orderService from '../../service/orderService';
import packingListService from '../../service/packingListService';
import piService from '../../service/piService';
import vgmService from '../../service/vgmService';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import OrderCard from '../../components/order/OrderCard';
import FilterBar from '../../components/order/FilterBar';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [customerFilter, setCustomerFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeletePacking, setConfirmDeletePacking] = useState(null);
  const [downloadingOrder, setDownloadingOrder] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  // Helper function to fetch packing list data for an order
  const fetchPackingListForOrder = async (order) => {
    // Only proceed if order has a valid packingListId or piInvoiceId
    if (!order.packingListId && !order.piInvoiceId) {
      console.log(
        `Order ${order.id} has no packingListId or piInvoiceId, skipping packing list fetch`
      );
      return order;
    }

    // Use packingListId if available, otherwise use piInvoiceId
    const packingId = order.packingListId || order.piInvoiceId;

    console.log(
      `Checking order ${order.id} for packing list with ID: ${packingId}`
    );

    try {
      console.log(
        `Fetching packing list for order ${order.id}, PackingList ID: ${packingId}`
      );

      // Try to fetch detailed packaging steps first
      let packingData = null;
      let containers = [];

      try {
        const packagingResponse =
          await packingListService.getPackingListById(packingId);
        console.log(
          `Packaging steps response for order ${order.id}:`,
          packagingResponse
        );

        if (packagingResponse && packagingResponse.data) {
          // Use the single packing list data object
          const packingData = packagingResponse.data;

          // Extract container data directly from the packing list
          if (packingData.containers && Array.isArray(packingData.containers)) {
            containers = packingData.containers.map((container) => ({
              containerNumber: container.containerNumber || '',
              descriptionOfGoods:
                container.products?.map((p) => p.productName).join(', ') ||
                'Mixed goods',
              noOfBoxes: parseInt(container.totalNoOfBoxes) || 0,
              netWeight: parseFloat(container.totalNetWeight) || 0,
              grossWeight: parseFloat(container.totalGrossWeight) || 0,
              volume: parseFloat(container.totalMeasurement) || 0,
              dimensions: null,
              sealNumber: container.sealNumber || '',
              products: container.products || [],
            }));
          }

          // packingData is already set above
        }
      } catch (packagingError) {
        console.log(
          `Could not fetch packaging steps for order ${order.id}:`,
          packagingError.message
        );
      }

      // Fallback to packing list API
      const packingResponse =
        await packingListService.getPackingListById(packingId);
      console.log(`Packing response for order ${order.id}:`, packingResponse);

      if (packingResponse && packingResponse.data) {
        packingData = packingResponse.data;
        console.log(`Raw packing data for order ${order.id}:`, packingData);

        // Extract container data from packagingSteps.notes (where actual data is stored)
        if (
          containers.length === 0 &&
          packingData.pi &&
          packingData.pi.packagingSteps &&
          packingData.pi.packagingSteps.length > 0
        ) {
          const packagingStep = packingData.pi.packagingSteps[0];
          if (packagingStep.notes) {
            try {
              // Handle both string and object cases
              let detailedPackingData = packagingStep.notes;
              if (typeof detailedPackingData === 'string') {
                detailedPackingData = JSON.parse(detailedPackingData);
              }
              console.log(
                `📦 Parsed packaging data from notes for order ${order.id}:`,
                detailedPackingData
              );

              if (
                detailedPackingData.containers &&
                Array.isArray(detailedPackingData.containers)
              ) {
                containers = detailedPackingData.containers.map(
                  (container) => ({
                    containerNumber: container.containerNumber || '',
                    descriptionOfGoods:
                      container.products
                        ?.map((p) => p.productName)
                        .join(', ') || 'Mixed goods',
                    noOfBoxes: parseInt(container.totalNoOfBoxes) || 0,
                    netWeight: parseFloat(container.totalNetWeight) || 0,
                    grossWeight: parseFloat(container.totalGrossWeight) || 0,
                    volume: parseFloat(container.totalMeasurement) || 0,
                    dimensions: null,
                    sealNumber: container.sealNumber || '',
                    products: container.products || [],
                  })
                );
                console.log(
                  `✅ Extracted ${containers.length} containers from notes for order ${order.id}`
                );
              }
            } catch (e) {
              console.error(
                `Failed to parse packaging notes for order ${order.id}:`,
                e
              );
            }
          }
        }

        // If no containers from packaging steps, try to create from available data
        if (containers.length === 0) {
          // Check if containers field exists and parse it
          if (packingData.containers) {
            let containerData = packingData.containers;
            if (typeof containerData === 'string') {
              try {
                containerData = JSON.parse(containerData);
              } catch (e) {
                containerData = [];
              }
            }

            if (Array.isArray(containerData) && containerData.length > 0) {
              containers = containerData.map((container) => ({
                containerNumber: container.containerNumber || '',
                descriptionOfGoods:
                  container.products?.map((p) => p.productName).join(', ') ||
                  container.descriptionOfGoods ||
                  'Mixed goods',
                noOfBoxes:
                  parseInt(container.totalNoOfBoxes) ||
                  container.noOfBoxes ||
                  container.products?.reduce(
                    (sum, p) => sum + (parseInt(p.noOfBoxes) || 0),
                    0
                  ) ||
                  0,
                netWeight:
                  parseFloat(container.totalNetWeight) ||
                  container.netWeight ||
                  container.products?.reduce(
                    (sum, p) => sum + (parseFloat(p.netWeight) || 0),
                    0
                  ) ||
                  0,
                grossWeight:
                  parseFloat(container.totalGrossWeight) ||
                  container.grossWeight ||
                  container.products?.reduce(
                    (sum, p) => sum + (parseFloat(p.grossWeight) || 0),
                    0
                  ) ||
                  0,
                volume:
                  parseFloat(container.totalMeasurement) ||
                  container.volume ||
                  container.products?.reduce(
                    (sum, p) => sum + (parseFloat(p.measurement) || 0),
                    0
                  ) ||
                  0,
                dimensions: container.dimensions || null,
                sealNumber: container.sealNumber || '',
                products: container.products || [],
              }));
            }
          }
        }

        // Create packing list if we have container data OR basic totals
        if (containers.length > 0 || packingData.totalBoxes > 0) {
          const finalPackingList = {
            totalContainers:
              containers.length > 0
                ? containers.length
                : packingData.totalContainers || 1,
            totalBoxes:
              containers.length > 0
                ? containers.reduce((sum, c) => sum + (c.noOfBoxes || 0), 0)
                : packingData.totalBoxes || 0,
            totalNetWeight:
              containers.length > 0
                ? containers.reduce((sum, c) => sum + (c.netWeight || 0), 0)
                : packingData.totalNetWeight || 0,
            totalGrossWeight:
              containers.length > 0
                ? containers.reduce((sum, c) => sum + (c.grossWeight || 0), 0)
                : packingData.totalGrossWeight || 0,
            totalVolume:
              containers.length > 0
                ? containers.reduce((sum, c) => sum + (c.volume || 0), 0)
                : packingData.totalVolume || 0,
            containers: containers,
            lastUpdated: packingData.updatedAt || packingData.createdAt,
            exportInvoiceNo: packingData.exportInvoiceNo,
            buyerReference: packingData.buyerReference,
            status: packingData.status,
          };

          console.log(
            `✅ Final packing list created for order ${order.id}:`,
            finalPackingList
          );

          return {
            ...order,
            packingList: finalPackingList,
          };
        }
      } else {
        console.log(`❌ No packing list data found for order ${order.id}`);
      }
    } catch (error) {
      console.error(
        `❌ Could not fetch packing list for order ${order.id}:`,
        error.message
      );
      console.error(`Error details:`, error);
    }

    console.log(`⚠️ Returning order ${order.id} without packing list`);
    return order;
  };

  const fetchOrders = async (
    page = 1,
    search = '',
    status = '',
    dateStart = '',
    dateEnd = '',
    customer = ''
  ) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(status && { status }),
        ...(dateStart && { dateStart }),
        ...(dateEnd && { dateEnd }),
        ...(customer && { customer }),
      };
      const response = await orderService.getAllOrders(params);
      const orders = response.orders || [];

      // Fetch packing list data only for orders that might have packing lists
      const ordersWithPackingList = await Promise.all(
        orders.map((order) => {
          // Only fetch packing list if order has packingListId or has meaningful indicators
          if (
            order.packingListId ||
            (order.piInvoiceId && order.orderStatus !== 'pending')
          ) {
            return fetchPackingListForOrder(order);
          }
          return Promise.resolve(order);
        })
      );

      setOrders(ordersWithPackingList);
      setPagination(
        response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        }
      );

      // Don't auto-select first order if we already have a selection
      if (ordersWithPackingList.length > 0 && !selectedOrderId) {
        const savedOrderId = localStorage.getItem('selectedOrderId');
        if (savedOrderId) {
          const orderExists = ordersWithPackingList.find(
            (order) => order.id === parseInt(savedOrderId)
          );
          if (orderExists) {
            setSelectedOrderId(parseInt(savedOrderId));
          } else {
            setSelectedOrderId(ordersWithPackingList[0].id);
          }
        } else {
          setSelectedOrderId(ordersWithPackingList[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]); // Ensure orders is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = () => {
    // Don't reset selection when searching - preserve current selection
    fetchOrders(
      1,
      searchTerm,
      statusFilter,
      dateRange.start,
      dateRange.end,
      customerFilter
    );
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    // Don't reset selection when filtering - preserve current selection
    fetchOrders(
      1,
      searchTerm,
      status,
      dateRange.start,
      dateRange.end,
      customerFilter
    );
  };

  const handlePageChange = (page: number) => {
    fetchOrders(
      page,
      searchTerm,
      statusFilter,
      dateRange.start,
      dateRange.end,
      customerFilter
    );
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleDeleteClick = (id) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      // Find the order to get PI ID
      const orderToDelete = orders.find((order) => order.id === confirmDelete);
      const piId = orderToDelete?.piInvoiceId || orderToDelete?.piInvoice?.id;

      // Delete VGM documents if they exist
      if (
        orderToDelete?.piInvoice?.vgmDocuments &&
        orderToDelete.piInvoice.vgmDocuments.length > 0
      ) {
        for (const vgm of orderToDelete.piInvoice.vgmDocuments) {
          await vgmService.deleteVgm(vgm.id);
        }
      }

      // Delete packing list if it exists
      const packingId = orderToDelete?.packingListId || piId;
      if (packingId) {
        try {
          await packingListService.deletePackingList(packingId);
        } catch (error) {
          console.log('Packing list not found or already deleted');
        }
      }

      // Delete the order
      const result = await orderService.deleteOrder(confirmDelete);

      // Update PI status to pending if PI ID exists
      if (piId) {
        await piService.updatePiStatus(piId, 'pending');
      }

      toast.success(result.message);
      setConfirmDelete(null);
      // Store current selection before refresh
      const currentSelectedId = selectedOrderId;
      // Refresh the orders list
      fetchOrders(
        pagination.page,
        searchTerm,
        statusFilter,
        dateRange.start,
        dateRange.end,
        customerFilter
      );
      // Restore selection after refresh
      if (currentSelectedId && currentSelectedId !== confirmDelete) {
        setTimeout(() => setSelectedOrderId(currentSelectedId), 100);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.message);
    }
  };

  const handlePackingDeleteClick = (packingId) => {
    setConfirmDeletePacking(packingId);
  };

  const handleConfirmPackingDelete = async () => {
    if (!confirmDeletePacking) return;

    try {
      await packingListService.deletePackingList(confirmDeletePacking);
      toast.success('Packing list deleted successfully!');
      setConfirmDeletePacking(null);
      // Store current selection before refresh
      const currentSelectedId = selectedOrderId;
      // Refresh the orders list
      fetchOrders(
        pagination.page,
        searchTerm,
        statusFilter,
        dateRange.start,
        dateRange.end,
        customerFilter
      );
      // Restore selection after refresh
      if (currentSelectedId) {
        setTimeout(() => setSelectedOrderId(currentSelectedId), 100);
      }
    } catch (error) {
      console.error('Delete packing error:', error);
      toast.error('Failed to delete packing list');
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      setDownloadingOrder(orderId);
      await orderService.downloadOrderInvoicePdf(orderId);
      toast.success('Invoice PDF downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice PDF');
    } finally {
      setDownloadingOrder(null);
    }
  };

  const handleViewInvoice = (orderId) => {
    console.log('ViewInvoice clicked for order:', orderId);
    // alert(`Navigating to invoice for order: ${orderId}`);
    navigate(`/view-invoice/${orderId}`);
  };

  return (
    <>
      <PageMeta
        title="Orders | EximEx Dashboard"
        description="Manage your orders in EximEx Dashboard"
      />
      <PageBreadCrumb pageTitle="Orders" />

      {/* Header with Add Order Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
          Orders ({pagination.total})
        </h1>
        <Link
          to="/add-order"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 text-sm font-medium text-white transition-colors w-full sm:w-auto min-w-0"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2 text-xs sm:text-sm" />
          <span>Add Order</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        dateRange={dateRange}
        setDateRange={setDateRange}
        customerFilter={customerFilter}
        setCustomerFilter={setCustomerFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSearch={handleSearch}
      />

      {/* Order Selection Dropdown */}
      {!loading && orders.length > 0 && viewMode === 'cards' && (
        <div className="mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Order to View:
          </label>
          <select
            value={selectedOrderId || ''}
            onChange={(e) => {
              const newOrderId = parseInt(e.target.value);
              setSelectedOrderId(newOrderId);
              localStorage.setItem('selectedOrderId', newOrderId.toString());
            }}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm overflow-hidden"
          >
            <option value="">Choose an order...</option>
            {orders.map((order) => {
              const orderNumber = order.orderNumber || `#${order.id}`;
              const companyName = order.piInvoice?.party?.companyName || 'N/A';
              const amount = `$${order.totalAmount?.toLocaleString() || '0'}`;

              // Truncate company name for mobile
              const shortCompanyName =
                companyName.length > 15
                  ? companyName.substring(0, 15) + '...'
                  : companyName;
              const displayText = `${orderNumber} - ${shortCompanyName} - ${amount}`;

              return (
                <option key={order.id} value={order.id}>
                  {displayText}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Main Content - Cards or Table View */}
      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-48 sm:h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-gray-500 dark:text-gray-400 text-center text-sm sm:text-base">
            No orders found.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-2 text-center">
            Try adjusting your search or filters.
          </p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-3 sm:space-y-4">
          {selectedOrderId ? (
            (() => {
              const selectedOrder = orders.find(
                (order) => order.id === selectedOrderId
              );
              return selectedOrder ? (
                <OrderCard
                  key={selectedOrder.id}
                  order={selectedOrder}
                  onDelete={handleDeleteClick}
                  onPackingDelete={handlePackingDeleteClick}
                  onDownloadInvoice={handleDownloadInvoice}
                  onViewInvoice={handleViewInvoice}
                  downloadingOrder={downloadingOrder}
                  onOrderSelect={setSelectedOrderId}
                />
              ) : (
                <div className="flex flex-col justify-center items-center h-48 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Selected order not found.
                  </p>
                </div>
              );
            })()
          ) : (
            <div className="flex flex-col justify-center items-center h-48 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Please select an order from the dropdown above.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <Table className="min-w-full">
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-3 sm:px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap min-w-[120px]"
                  >
                    Order Number
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 sm:px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap hidden sm:table-cell min-w-[100px]"
                  >
                    Company
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 sm:px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap min-w-[60px]"
                  >
                    Qty
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 sm:px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap min-w-[80px]"
                  >
                    Amount
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 sm:px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap hidden lg:table-cell min-w-[80px]"
                  >
                    Payment
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 sm:px-4 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 whitespace-nowrap min-w-[80px]"
                  >
                    Status
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-3 sm:px-4 py-3 font-medium text-gray-500 text-end text-xs dark:text-gray-400 whitespace-nowrap min-w-[80px]"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="px-3 sm:px-4 py-3 text-start min-w-[120px]">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-800 dark:text-white/90 text-xs sm:text-sm">
                          {order.orderNumber || 'N/A'}
                        </span>
                        <div className="sm:hidden text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                          {order.piInvoice?.party?.companyName || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 text-gray-500 text-start text-xs sm:text-sm dark:text-gray-400 hidden sm:table-cell min-w-[100px]">
                      <div className="max-w-[100px] truncate">
                        {order.piInvoice?.party?.companyName || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 text-gray-500 text-start text-xs sm:text-sm dark:text-gray-400 min-w-[60px]">
                      {order.productQty || 0}
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 text-gray-500 text-start text-xs sm:text-sm dark:text-gray-400 min-w-[80px]">
                      <div className="font-medium">
                        ${order.totalAmount?.toLocaleString() || '0'}
                      </div>
                      <div className="lg:hidden mt-1">
                        <span
                          className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getPaymentStatusBadge(
                            order.paymentStatus
                          )}`}
                        >
                          {order.paymentStatus || 'pending'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 text-gray-500 text-start text-xs sm:text-sm dark:text-gray-400 hidden lg:table-cell min-w-[80px]">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusBadge(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 text-gray-500 text-start text-xs sm:text-sm dark:text-gray-400 min-w-[80px]">
                      <span
                        className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                    </TableCell>
                    <TableCell className="px-3 sm:px-4 py-3 text-gray-500 text-end text-xs sm:text-sm dark:text-gray-400 min-w-[80px]">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/edit-order/${order.id}`}
                          className="hover:text-primary p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Edit"
                        >
                          <FontAwesomeIcon
                            icon={faEdit}
                            className="text-green-500 hover:text-green-700 text-xs"
                          />
                        </Link>
                        <button
                          onClick={() => handleViewInvoice(order.id)}
                          className="hover:text-primary p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="View"
                        >
                          <FontAwesomeIcon
                            icon={faEye}
                            className="text-blue-500 hover:text-blue-700 text-xs"
                          />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order.id)}
                          disabled={downloadingOrder === order.id}
                          className="hover:text-primary p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                          title="Download"
                        >
                          {downloadingOrder === order.id ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500"></div>
                          ) : (
                            <FontAwesomeIcon
                              icon={faDownload}
                              className="text-purple-500 hover:text-purple-700 text-xs"
                            />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(order.id)}
                          className="hover:text-primary p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Delete"
                        >
                          <FontAwesomeIcon
                            icon={faTrash}
                            className="text-red-500 hover:text-red-700 text-xs"
                          />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left order-2 sm:order-1">
              <span className="hidden sm:inline">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} results
              </span>
              <span className="sm:hidden">
                {pagination.page} of {pagination.pages} pages
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-1 order-1 sm:order-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200"
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">‹</span>
              </button>
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                let page;
                if (pagination.pages <= 5) {
                  page = i + 1;
                } else if (pagination.page <= 3) {
                  page = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  page = pagination.pages - 4 + i;
                } else {
                  page = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-colors min-w-[32px] sm:min-w-[36px] ${
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">›</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <FontAwesomeIcon icon={faTrash} className="text-red-600" />
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-center text-gray-800 dark:text-white">
              Delete Order
            </h3>
            <p className="mb-6 text-sm sm:text-base text-center text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this order? This action cannot be
              undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Packing List Confirmation Modal */}
      {confirmDeletePacking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800 transform transition-all">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <FontAwesomeIcon icon={faTrash} className="text-red-600" />
            </div>
            <h3 className="mb-2 text-lg sm:text-xl font-semibold text-center text-gray-800 dark:text-white">
              Delete Packing List
            </h3>
            <p className="mb-6 text-sm sm:text-base text-center text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this packing list? This action
              cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setConfirmDeletePacking(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPackingDelete}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Packing List
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;

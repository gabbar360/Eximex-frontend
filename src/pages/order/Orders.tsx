import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, deleteOrder } from '../../features/orderSlice';
import { getPackingListById, deletePackingList } from '../../features/packingListSlice';
import { deleteVgm } from '../../features/vgmSlice';
import { updatePiStatus } from '../../features/piSlice';

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
  const dispatch = useDispatch();
  const { orders, loading, pagination: reduxPagination } = useSelector((state: any) => state.order);
  const [localOrders, setLocalOrders] = useState([]);
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
  // Helper function to fetch packing list data using Redux
  const fetchPackingListForOrder = async (order, dispatch) => {
    if (!order.packingListId && !order.piInvoiceId) {
      return order;
    }

    const packingId = order.packingListId || order.piInvoiceId;

    try {
      const response = await dispatch(getPackingListById(packingId)).unwrap();
      const packingData = response?.data || response;

      if (packingData && packingData.containers && Array.isArray(packingData.containers)) {
        const containers = packingData.containers.map((container) => ({
          containerNumber: container.containerNumber || '',
          descriptionOfGoods:
            container.products?.map((p) => p.productName).join(', ') ||
            container.descriptionOfGoods ||
            'Mixed goods',
          noOfBoxes: parseInt(container.totalNoOfBoxes || container.noOfBoxes) || 0,
          netWeight: parseFloat(container.totalNetWeight || container.netWeight) || 0,
          grossWeight: parseFloat(container.totalGrossWeight || container.grossWeight) || 0,
          volume: parseFloat(container.totalMeasurement || container.volume) || 0,
          sealNumber: container.sealNumber || '',
          products: container.products || [],
        }));

        const packingList = {
          totalContainers: containers.length,
          totalBoxes: containers.reduce((sum, c) => sum + (c.noOfBoxes || 0), 0),
          totalNetWeight: containers.reduce((sum, c) => sum + (c.netWeight || 0), 0),
          totalGrossWeight: containers.reduce((sum, c) => sum + (c.grossWeight || 0), 0),
          totalVolume: containers.reduce((sum, c) => sum + (c.volume || 0), 0),
          containers: containers,
        };

        return {
          ...order,
          packingList: packingList,
        };
      }
    } catch (error) {
      console.log(`Could not fetch packing list for order ${order.id}:`, error.message);
    }

    return order;
  };

  const fetchOrdersData = async (
    page = 1,
    search = '',
    status = '',
    dateStart = '',
    dateEnd = '',
    customer = ''
  ) => {
    const params = {
      page,
      limit: pagination.limit,
      ...(search && { search }),
      ...(status && { status }),
      ...(dateStart && { dateStart }),
      ...(dateEnd && { dateEnd }),
      ...(customer && { customer }),
    };
    
    dispatch(fetchOrders(params));
  };

  // Update local orders when Redux orders change
  useEffect(() => {
    const processOrders = async () => {
      if (orders && Array.isArray(orders)) {
        // Fetch packing list data for orders that have packing lists
        const ordersWithPackingList = await Promise.all(
          orders.map((order) => {
            if (order.packingListId || order.piInvoiceId) {
              return fetchPackingListForOrder(order, dispatch);
            }
            return Promise.resolve(order);
          })
        );
        
        setLocalOrders(ordersWithPackingList);
        
        // Auto-select first order if none selected
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
      }
    };
    
    processOrders();
  }, [orders, selectedOrderId, dispatch]);

  // Update pagination from Redux
  useEffect(() => {
    if (reduxPagination) {
      setPagination(reduxPagination);
    }
  }, [reduxPagination]);

  useEffect(() => {
    fetchOrdersData();
  }, [dispatch]);

  const handleSearch = () => {
    fetchOrdersData(
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
    fetchOrdersData(
      1,
      searchTerm,
      status,
      dateRange.start,
      dateRange.end,
      customerFilter
    );
  };

  const handlePageChange = (page: number) => {
    fetchOrdersData(
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
          try {
            await dispatch(deleteVgm(vgm.id)).unwrap();
          } catch (error) {
            console.log('VGM document not found or already deleted');
          }
        }
      }

      // Delete packing list if it exists
      const packingId = orderToDelete?.packingListId || piId;
      if (packingId) {
        try {
          await dispatch(deletePackingList(packingId)).unwrap();
        } catch (error) {
          console.log('Packing list not found or already deleted');
        }
      }

      // Delete the order
      const result = await dispatch(deleteOrder(confirmDelete)).unwrap();

      // Update PI status to pending if PI ID exists
      if (piId) {
        try {
          await dispatch(updatePiStatus({ id: piId, status: 'pending' })).unwrap();
        } catch (error) {
          console.log('Failed to update PI status');
        }
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
const result = await dispatch(deletePackingList(confirmDeletePacking)).unwrap();
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
// Note: Download is handled directly by the service, not through Redux
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
            {localOrders.map((order) => {
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
      ) : localOrders.length === 0 ? (
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
              const selectedOrder = localOrders.find(
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
                {localOrders.map((order) => (
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
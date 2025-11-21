import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { HiEye, HiMagnifyingGlass, HiDocumentText, HiClock, HiCheckCircle, HiXCircle, HiDocument, HiCurrencyDollar, HiBuildingOffice2, HiCalendar, HiEllipsisVertical, HiTruck, HiClipboard, HiScale, HiPlus, HiTrash } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { fetchOrders, deleteOrder } from '../../features/orderSlice';

const AllOrders: React.FC = () => {
  const dispatch = useDispatch();
  const { orders = [], loading = false } = useSelector((state: any) => state.order || {});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteOrder(id)).unwrap();
      toast.success('Order deleted successfully');
      setConfirmDelete(null);
    } catch (error: any) {
      console.log('Delete error:', error);
      toast.error(error || 'Failed to delete order');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (openDropdown && !target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  const filteredOrders = orders.filter((order: any) => {
    if (!order) return false;
    
    const matchesSearch = !searchTerm || 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.piInvoice?.party?.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (order.orderStatus && order.orderStatus.toLowerCase() === filterStatus.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { icon: HiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'pending':
        return { icon: HiClock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'processing':
        return { icon: HiDocument, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
      case 'shipped':
        return { icon: HiTruck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' };
      case 'delivered':
        return { icon: HiCheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
      case 'cancelled':
        return { icon: HiXCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { icon: HiDocument, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                  <HiDocumentText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    All Orders
                  </h1>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 w-full sm:w-40 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm shadow-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                
                <Link
                  to="/add-order"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  New Order
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Display */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No orders found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'No orders available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="grid gap-2 text-sm font-semibold text-slate-700" style={{gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1fr 1fr 1fr 0.8fr'}}>
                  <div className="flex items-center gap-2">
                    <HiDocumentText className="w-4 h-4 text-slate-600" />
                    <span>Order No.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiBuildingOffice2 className="w-4 h-4 text-slate-600" />
                    <span>Client</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCalendar className="w-4 h-4 text-slate-600" />
                    <span>Date</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiClock className="w-4 h-4 text-slate-600" />
                    <span>Status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiDocument className="w-4 h-4 text-slate-600" />
                    <span>PI Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCurrencyDollar className="w-4 h-4 text-slate-600" />
                    <span>Amount</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCurrencyDollar className="w-4 h-4 text-slate-600" />
                    <span>Advance Payment</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <HiDocumentText className="w-4 h-4 text-slate-600" />
                    <span>Actions</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-white/20">
                {filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.orderStatus);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div key={order.id} className="p-4 hover:bg-white/50 transition-all duration-300">
                      <div className="grid gap-2 items-center" style={{gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1fr 1fr 1fr 0.8fr'}}>
                        {/* Order Number */}
                        <div className="flex items-center gap-2">
                          <HiDocumentText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <span className="text-slate-800 font-medium truncate" title={order.orderNumber}>
                            {order.orderNumber}
                          </span>
                        </div>
                        
                        {/* Client */}
                        <div className="text-slate-700 text-sm truncate" title={order.piInvoice?.party?.companyName}>
                          {order.piInvoice?.party?.companyName || '-'}
                        </div>
                        
                        {/* Date */}
                        <div className="text-slate-700 text-sm">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                        
                        {/* Status */}
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                          </span>
                        </div>
                        
                        {/* PI Number */}
                        <div className="text-slate-700 text-sm">
                          {order.piNumber || '-'}
                        </div>
                        
                        {/* Amount */}
                        <div className="text-slate-700 text-sm font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(order.totalAmount || 0)}
                        </div>
                        
                        {/* Advance Payment */}
                        <div className="text-slate-700 text-sm font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(order.piInvoice?.advanceAmount || 0)}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2">
                          {order.piInvoiceId && (
                            <Link
                              to={`/pi-details/${order.piInvoiceId}`}
                              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-blue-600 transition-all duration-300"
                              title="View Order"
                            >
                              <HiEye className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => setConfirmDelete(order.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                            title="Delete Order"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-white/20">
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.orderStatus);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={order.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <HiDocumentText className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        <h3 className="font-semibold text-slate-800">{order.orderNumber}</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-slate-500 text-xs">Client:</span>
                        <div className="text-slate-700 truncate">{order.piInvoice?.party?.companyName || '-'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">Date:</span>
                        <div className="text-slate-700">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">Status:</span>
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">PI Number:</span>
                        <div className="text-slate-700">{order.piNumber || '-'}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-slate-500 text-xs">Amount:</span>
                        <div className="text-slate-700 font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(order.totalAmount || 0)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">Advance Payment:</span>
                        <div className="text-slate-700 font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0,
                          }).format(order.piInvoice?.advanceAmount || 0)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center pt-3 mt-3 border-t border-gray-200">
                      <div className="flex gap-2">
                        <Link
                          to={`/orders/shipments`}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-all duration-300 text-sm font-medium"
                        >
                          <HiTruck className="w-4 h-4" />
                          Shipment
                        </Link>
                        <Link
                          to={`/orders/packing-lists`}
                          className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-all duration-300 text-sm font-medium"
                        >
                          <HiClipboard className="w-4 h-4" />
                          Packing
                        </Link>
                        <Link
                          to={`/orders/vgm`}
                          className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all duration-300 text-sm font-medium"
                        >
                          <HiScale className="w-4 h-4" />
                          VGM
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                <HiTrash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Order</h3>
              <p className="text-slate-600">Are you sure you want to delete this order? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
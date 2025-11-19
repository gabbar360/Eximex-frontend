import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { HiEye, HiPencil, HiTrash, HiPlus, HiMagnifyingGlass, HiTruck, HiCube } from 'react-icons/hi2';
import { Pagination } from 'antd';
import { toast } from 'react-toastify';
import { fetchOrders } from '../../features/orderSlice';
import { deleteShipment } from '../../features/shipmentSlice';

const ShipmentManagement: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders = [], loading = false } = useSelector((state: any) => state.order || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      await dispatch(deleteShipment(confirmDelete)).unwrap();
      toast.success('Shipment deleted successfully');
      setConfirmDelete(null);
      // Refresh orders to update the UI
      dispatch(fetchOrders());
    } catch (error: any) {
      console.log('Delete shipment error:', error);
      toast.error(error || 'Failed to delete shipment');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter orders to show only those with shipment details and match search term
  const filteredOrders = orders.filter((order: any) => {
    // Check if order has shipment details
    const hasShipmentDetails = order.shipment && (
      order.shipment.bookingNumber ||
      order.shipment.bookingDate ||
      order.shipment.vesselVoyageInfo ||
      order.shipment.wayBillNumber ||
      order.shipment.truckNumber
    );
    
    // Only show orders with shipment details
    if (!hasShipmentDetails) return false;
    
    // Apply search filter
    return (
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.piInvoice?.party?.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 lg:p-4">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                  <HiTruck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    Shipment Management
                  </h1>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    className="pl-12 pr-4 py-3 w-full sm:w-64 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                
                <button
                  onClick={() => navigate('/shipment/create')}
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg flex-shrink-0"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  Add Shipment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments Display */}
        {paginatedOrders.length === 0 && !loading ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No shipments found</h3>
            <p className="text-slate-600 mb-6">Create your first shipment to get started</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <HiTruck className="w-4 h-4 text-slate-600" />
                    <span>Order Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-slate-600" />
                    <span>Company</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-slate-600" />
                    <span>Booking Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-slate-600" />
                    <span>Vessel Info</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-slate-600" />
                    <span>Booking Date</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCube className="w-4 h-4 text-slate-600" />
                    <span>Status</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <HiCube className="w-4 h-4 text-slate-600" />
                    <span>Actions</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-white/20">
                {paginatedOrders.map((order: any) => {
                  const hasShipmentDetails = order.shipment && (
                    order.shipment.bookingNumber ||
                    order.shipment.bookingDate ||
                    order.shipment.vesselVoyageInfo ||
                    order.shipment.wayBillNumber ||
                    order.shipment.truckNumber
                  );

                  return (
                    <div key={order.id} className="p-4 hover:bg-white/50 transition-all duration-300">
                      <div className="grid grid-cols-7 gap-3 items-center">
                        {/* Order Number */}
                        <div className="flex items-center gap-2">
                          <HiTruck className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <span className="text-slate-800 font-medium truncate" title={order.orderNumber}>
                            #{order.orderNumber}
                          </span>
                        </div>
                        
                        {/* Company */}
                        <div className="text-slate-700 text-sm">
                          {order.piInvoice?.party?.companyName || '-'}
                        </div>
                        
                        {/* Booking Number */}
                        <div className="text-slate-700 text-sm">
                          {order.shipment?.bookingNumber || 'Not set'}
                        </div>
                        
                        {/* Vessel Info */}
                        <div className="text-slate-700 text-sm">
                          {order.shipment?.vesselVoyageInfo || 'Not set'}
                        </div>
                        
                        {/* Booking Date */}
                        <div className="text-slate-700 text-sm">
                          {formatDate(order.shipment?.bookingDate)}
                        </div>
                        
                        {/* Status */}
                        <div className="text-slate-700 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hasShipmentDetails 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {hasShipmentDetails ? 'Complete' : 'Pending'}
                          </span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/shipment/${order.id}`}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-blue-600 transition-all duration-300"
                            title="View/Edit"
                          >
                            <HiEye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/shipment/${order.id}`}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                            title="Edit"
                          >
                            <HiPencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(order.id)}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                            title="Delete"
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
            
            {/* Mobile Table View */}
            <div className="lg:hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="grid grid-cols-7 gap-3 text-sm font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <HiTruck className="w-4 h-4 text-slate-600" />
                        <span>Order Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-slate-600" />
                        <span>Company</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-slate-600" />
                        <span>Booking Number</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-slate-600" />
                        <span>Vessel Info</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-slate-600" />
                        <span>Booking Date</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <HiCube className="w-4 h-4 text-slate-600" />
                        <span>Status</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <HiCube className="w-4 h-4 text-slate-600" />
                        <span>Actions</span>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-white/20">
                    {paginatedOrders.map((order: any) => {
                      const hasShipmentDetails = order.shipment && (
                        order.shipment.bookingNumber ||
                        order.shipment.bookingDate ||
                        order.shipment.vesselVoyageInfo ||
                        order.shipment.wayBillNumber ||
                        order.shipment.truckNumber
                      );

                      return (
                        <div key={order.id} className="p-4 hover:bg-white/50 transition-all duration-300">
                          <div className="grid grid-cols-7 gap-3 items-center">
                            <div className="flex items-center gap-2">
                              <HiTruck className="w-4 h-4 text-slate-600 flex-shrink-0" />
                              <span className="text-slate-800 font-medium truncate" title={order.orderNumber}>
                                #{order.orderNumber}
                              </span>
                            </div>
                            <div className="text-slate-700 text-sm">
                              {order.piInvoice?.party?.companyName || '-'}
                            </div>
                            <div className="text-slate-700 text-sm">
                              {order.shipment?.bookingNumber || 'Not set'}
                            </div>
                            <div className="text-slate-700 text-sm">
                              {order.shipment?.vesselVoyageInfo || 'Not set'}
                            </div>
                            <div className="text-slate-700 text-sm">
                              {formatDate(order.shipment?.bookingDate)}
                            </div>
                            <div className="text-slate-700 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                hasShipmentDetails 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {hasShipmentDetails ? 'Complete' : 'Pending'}
                              </span>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                              <Link
                                to={`/shipment/${order.id}`}
                                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-blue-600 transition-all duration-300"
                                title="View/Edit"
                              >
                                <HiEye className="w-4 h-4" />
                              </Link>
                              <Link
                                to={`/shipment/${order.id}`}
                                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                                title="Edit"
                              >
                                <HiPencil className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => handleDeleteClick(order.id)}
                                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                                title="Delete"
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
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="flex justify-center mt-6">
            <Pagination 
              current={currentPage} 
              total={filteredOrders.length} 
              pageSize={pageSize}
              onChange={(page) => setCurrentPage(page)}
            />
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Shipment</h3>
              <p className="text-slate-600">Are you sure you want to delete this shipment? This action cannot be undone.</p>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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

export default ShipmentManagement;
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiEye, HiPencil, HiTrash, HiPlus, HiMagnifyingGlass, HiDocumentText, HiClock, HiCheckCircle, HiXCircle, HiDocument, HiCurrencyDollar, HiBuildingOffice2, HiCalendar, HiCreditCard, HiArrowDownTray, HiEnvelope } from 'react-icons/hi2';
import { fetchPurchaseOrders, deletePurchaseOrder, downloadPurchaseOrderPDF } from '../../features/purchaseOrderSlice';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PurchaseOrders: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  const loadPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await dispatch(fetchPurchaseOrders()).unwrap();
      console.log('Purchase Orders API Response:', response);
      
      // Handle different response structures
      let purchaseOrdersData = [];
      if (response?.data?.purchaseOrders) {
        purchaseOrdersData = response.data.purchaseOrders;
      } else if (response?.purchaseOrders) {
        purchaseOrdersData = response.purchaseOrders;
      } else if (Array.isArray(response?.data)) {
        purchaseOrdersData = response.data;
      } else if (Array.isArray(response)) {
        purchaseOrdersData = response;
      }
      
      console.log('Processed Purchase Orders Data:', purchaseOrdersData);
      setPurchaseOrders(purchaseOrdersData);
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      toast.error(error);
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPurchaseOrders();
  }, []);



  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      const result =
        await dispatch(deletePurchaseOrder(confirmDelete)).unwrap();
      toast.success(result.message || 'Purchase order deleted successfully');
      setConfirmDelete(null);
      loadPurchaseOrders();
    } catch (error: any) {
      toast.error(error);
    }
  };

  const handleDownload = async (id: string, poNumber: string) => {
    setDownloadingPdf(id);
    toast.info('Preparing PDF download...', { autoClose: 2000 });
    try {
      const pdfBlob = await dispatch(downloadPurchaseOrderPDF(id)).unwrap();

      // Create download link
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PO-${poNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(error);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const filteredPurchaseOrders = Array.isArray(purchaseOrders)
    ? purchaseOrders.filter(
        (po: any) =>
          po?.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          po?.vendorName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      import: 'bg-blue-100 text-blue-800',
      export: 'bg-green-100 text-green-800',
      domestic: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { icon: HiCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'pending':
        return { icon: HiClock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'rejected':
      case 'cancelled':
        return { icon: HiXCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      case 'completed':
        return { icon: HiCheckCircle, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
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
                    Purchase Orders
                  </h1>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search purchase orders..."
                    className="pl-12 pr-4 py-3 w-full sm:w-72 rounded-lg border border-gray-300 bg-white focus:border-slate-500 focus:ring-2 focus:ring-slate-200 transition-all duration-300 text-sm placeholder-gray-500 shadow-sm"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
                
                <Link
                  to="/purchase-orders/create"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  New Purchase Order
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Orders Display */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading purchase orders...</p>
          </div>
        ) : filteredPurchaseOrders.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">No purchase orders found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm 
                ? 'Try adjusting your search.' 
                : 'Create your first purchase order to get started.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="grid gap-2 text-sm font-semibold text-slate-700" style={{gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1fr 1fr 0.8fr'}}>
                  <div className="flex items-center gap-2">
                    <HiDocumentText className="w-4 h-4 text-slate-600" />
                    <span>PO Number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiBuildingOffice2 className="w-4 h-4 text-slate-600" />
                    <span>Supplier</span>
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
                    <span>Type</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCurrencyDollar className="w-4 h-4 text-slate-600" />
                    <span>Amount</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <HiDocumentText className="w-4 h-4 text-slate-600" />
                    <span>Actions</span>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-white/20">
                {filteredPurchaseOrders.map((po: any) => {
                  const statusConfig = getStatusConfig(po.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <div key={po.id} className="p-4 hover:bg-white/50 transition-all duration-300">
                      <div className="grid gap-2 items-center" style={{gridTemplateColumns: '1.5fr 1.2fr 1fr 1fr 1fr 1fr 0.8fr'}}>
                        {/* PO Number */}
                        <div className="flex items-center gap-2">
                          <HiDocumentText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <span className="text-slate-800 font-medium truncate" title={po.poNumber}>
                            {po.poNumber}
                          </span>
                        </div>
                        
                        {/* Supplier */}
                        <div className="text-slate-700 text-sm truncate" title={po.vendorName}>
                          {po.vendorName || '-'}
                        </div>
                        
                        {/* Date */}
                        <div className="text-slate-700 text-sm">
                          {po.poDate ? new Date(po.poDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : '-'}
                        </div>
                        
                        {/* Status */}
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {po.status?.charAt(0).toUpperCase() + po.status?.slice(1) || 'Draft'}
                          </span>
                        </div>
                        
                        {/* Type */}
                        <div className="text-slate-700 text-sm">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            DOMESTIC
                          </span>
                        </div>
                        
                        {/* Amount */}
                        <div className="text-slate-700 text-sm font-medium">
                          {po.totalAmount && po.currency
                            ? new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: po.currency,
                                maximumFractionDigits: 0,
                              }).format(po.totalAmount)
                            : '-'}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={async () => await handleDownload(po.id, po.poNumber)}
                            disabled={downloadingPdf === po.id}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-blue-600 transition-all duration-300"
                            title="Download PDF"
                          >
                            {downloadingPdf === po.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
                            ) : (
                              <HiArrowDownTray className="w-4 h-4" />
                            )}
                          </button>
                          <Link
                            to={`/purchase-orders/edit/${po.id}`}
                            className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                            title="Edit"
                          >
                            <HiPencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setConfirmDelete(po.id)}
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
            
            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-white/20">
              {filteredPurchaseOrders.map((po: any) => {
                const statusConfig = getStatusConfig(po.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div key={po.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <HiDocumentText className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        <h3 className="font-semibold text-slate-800">{po.poNumber}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/purchase-orders/edit/${po.id}`}
                          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                        >
                          <HiPencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(po.id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-slate-500 text-xs">Supplier:</span>
                        <div className="text-slate-700 truncate">{po.vendorName || '-'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">Date:</span>
                        <div className="text-slate-700">
                          {po.poDate ? new Date(po.poDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }) : '-'}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">Status:</span>
                        <div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {po.status?.charAt(0).toUpperCase() + po.status?.slice(1) || 'Draft'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">Type:</span>
                        <div className="text-slate-700">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            DOMESTIC
                          </span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium text-slate-500 text-xs">Amount:</span>
                        <div className="text-slate-700 font-medium">
                          {po.totalAmount && po.currency
                            ? new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: po.currency,
                                maximumFractionDigits: 0,
                              }).format(po.totalAmount)
                            : '-'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-2 pt-3 mt-3 border-t border-gray-200">
                      <button
                        onClick={async () => await handleDownload(po.id, po.poNumber)}
                        disabled={downloadingPdf === po.id}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-blue-600 transition-all duration-300"
                        title="Download PDF"
                      >
                        {downloadingPdf === po.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
                        ) : (
                          <HiArrowDownTray className="w-4 h-4" />
                        )}
                      </button>
                      <Link
                        to={`/purchase-orders/edit/${po.id}`}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                        title="Edit"
                      >
                        <HiPencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(po.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                <HiTrash className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Purchase Order</h3>
              <p className="text-slate-600">Are you sure you want to delete this purchase order? This action cannot be undone.</p>
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

export default PurchaseOrders;

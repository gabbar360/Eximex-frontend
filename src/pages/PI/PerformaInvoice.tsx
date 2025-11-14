import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faHistory,
  faTrash,
  faDownload,
  faEye,
  faEnvelope,
  faEllipsisV,
  faSearch,
  faFilter,
  faFileInvoice,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faFileAlt,
  faDollarSign,
  faBuilding,
  faCalendarAlt,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import {
  getAllPiInvoices,
  deletePiInvoice,
  downloadPiInvoicePdf,
} from '../../features/piSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';


const paymentTermNames: Record<string, string> = {
  advance: 'Advance',
  lc: 'LC',
  '30days': '30 Days Credit',
};

const PerformaInvoice: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [piList, setPiList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);


  
  const fetchPiInvoicesData = async () => {
    try {
      setLoading(true);
      const response = await dispatch(getAllPiInvoices()).unwrap();
      
      if (response && response.piInvoices && Array.isArray(response.piInvoices)) {
        setPiList(response.piInvoices);
      } else if (Array.isArray(response)) {
        setPiList(response);
      } else {
        setPiList([]);
      }
    } catch (error) {
      console.error('Error fetching PI invoices:', error);
      setPiList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPiInvoicesData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const result = await dispatch(deletePiInvoice(id)).unwrap();
      setPiList((prevList) => prevList.filter((pi) => pi.id !== id));
      toast.success(result.message);
      setConfirmDelete(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredPIs = piList.filter((pi) => {
    if (!pi) return false;

    try {
      const matchesSearch =
        searchTerm === '' ||
        (pi.piNumber && pi.piNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pi.party?.companyName && pi.party.companyName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' ||
        (pi.status && pi.status.toLowerCase() === filterStatus.toLowerCase());

      return matchesSearch && matchesStatus;
    } catch (err) {
      return false;
    }
  });

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return { icon: faCheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' };
      case 'pending':
        return { icon: faClock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' };
      case 'cancelled':
        return { icon: faTimesCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
      default:
        return { icon: faFileAlt, color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        
        {/* Header */}
        <div className="mb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Proforma Invoices</h1>
              <p className="mt-1 text-sm text-gray-600">Manage and track your business invoices</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                to="/add-pi"
                className="inline-flex items-center px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                New Invoice
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && filteredPIs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileInvoice} className="w-4 h-4 text-slate-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-xl font-bold text-gray-900">{filteredPIs.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Confirmed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {filteredPIs.filter(pi => pi.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-amber-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-gray-900">
                    {filteredPIs.filter(pi => pi.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faDollarSign} className="w-4 h-4 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Value</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
                      filteredPIs.reduce((sum, pi) => sum + (pi.totalAmount || 0), 0)
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-40">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading invoices...</p>
          </div>
        ) : filteredPIs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
              <FontAwesomeIcon icon={faFileInvoice} className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters.' 
                : 'Create your first invoice to get started.'}
            </p>
            <Link
              to="/add-pi"
              className="inline-flex items-center px-4 py-2 bg-slate-700 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
              Create Invoice
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPIs.map((pi) => {
              const statusConfig = getStatusConfig(pi.status);
              
              return (
                <div key={pi.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <FontAwesomeIcon icon={faFileInvoice} className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{pi.piNumber}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(pi.invoiceDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Status</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                        <FontAwesomeIcon icon={statusConfig.icon} className="w-3 h-3 mr-1" />
                        {pi.status?.charAt(0).toUpperCase() + pi.status?.slice(1)}
                      </span>
                    </div>
                    
                    {/* Client */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Client</span>
                      <span className="text-xs font-medium text-gray-900 truncate ml-2 max-w-32" title={pi.party?.companyName}>
                        {pi.party?.companyName || 'N/A'}
                      </span>
                    </div>
                    
                    {/* Products */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Items</span>
                      <span className="text-xs font-medium text-gray-900">{pi._count?.products || 0}</span>
                    </div>
                    
                    {/* Payment Terms */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Payment</span>
                      <span className="text-xs font-medium text-gray-900">
                        {paymentTermNames[pi.paymentTerm] || pi.paymentTerm || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Amount Section */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                      <p className="text-lg font-bold text-gray-900">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: pi.currency || 'USD',
                          maximumFractionDigits: 0,
                        }).format(pi.totalAmount || 0)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center justify-center space-x-2">
                      <Link
                        to={`/pi-details/${pi.id}`}
                        className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/edit-pi/${pi.id}`}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Edit Invoice"
                      >
                        <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/proforma-invoices/${pi.id}/history`}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="View History"
                      >
                        <FontAwesomeIcon icon={faHistory} className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={async () => {
                          try {
                            setDownloadingPdf(pi.id);
                            toast.info('Preparing PDF download...', { autoClose: 2000 });
                            await dispatch(downloadPiInvoicePdf(pi.id)).unwrap();
                            toast.success('PDF downloaded successfully');
                          } catch (error) {
                            console.error('Error downloading PDF:', error);
                            toast.error('Download failed');
                          } finally {
                            setDownloadingPdf(null);
                          }
                        }}
                        disabled={downloadingPdf === pi.id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Download PDF"
                      >
                        {downloadingPdf === pi.id ? (
                          <LoadingSpinner size="small" message="" />
                        ) : (
                          <FontAwesomeIcon icon={faDownload} className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => navigate(`/proforma-invoices/${pi.id}/email`)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Send Email"
                      >
                        <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(pi.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Invoice"
                      >
                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>



      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 border border-gray-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-red-600 flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faTrash} className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Invoice</h3>
              <p className="text-slate-600">Are you sure you want to delete this invoice? This action cannot be undone.</p>
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

export default PerformaInvoice;
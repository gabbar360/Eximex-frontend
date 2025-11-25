import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiEye,
  HiPencil,
  HiTrash,
  HiPlus,
  HiMagnifyingGlass,
  HiDocumentText,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiDocument,
  HiCurrencyDollar,
  HiBuildingOffice2,
  HiCalendar,
  HiCreditCard,
  HiArrowDownTray,
  HiEnvelope,
  HiEllipsisVertical,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Pagination } from 'antd';

import {
  fetchPiInvoices,
  deletePiInvoice,
  downloadPiInvoicePdf,
} from '../../features/piSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useDebounce } from '../../utils/useDebounce';


const paymentTermNames: Record<string, string> = {
  advance: 'Advance',
  lc: 'LC',
  '30days': '30 Days Credit',
};

const PerformaInvoice: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { piInvoices, loading, error, pagination } = useSelector(
    (state: any) => state.pi
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  useEffect(() => {
    dispatch(fetchPiInvoices({
      page: currentPage,
      limit: pageSize,
      search: ''
    }) as any);
  }, [dispatch, currentPage, pageSize]);

  useEffect(() => {
    dispatch(
      fetchPiInvoices({
        page: 1,
        limit: 10,
        search: '',
      }) as any
    );
  }, [dispatch]);

  const { debouncedCallback: debouncedSearch } = useDebounce((value: string) => {
    dispatch(fetchPiInvoices({
      page: 1,
      limit: pageSize,
      search: value
    }) as any);
  }, 500);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    debouncedSearch(value);
  }, [debouncedSearch, pageSize]);

  // Close dropdown when clicking outside
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

  const handleDelete = async (id: string) => {
    try {
      const result = await dispatch(deletePiInvoice(id)).unwrap();
      setConfirmDelete(null);

      dispatch(
        fetchPiInvoices({
          page: currentPage,
          limit: pageSize,
          search: searchTerm,
        }) as any
      );

      toast.success(result.message);
    } catch (error: any) {
      toast.error(error);
    }
  };



  // Use piInvoices directly since filtering is now handled by backend
  const filteredPIs = piInvoices.filter((pi: any) => {
    if (!pi) return false;

    const matchesStatus =
      filterStatus === 'all' ||
      (pi.status && pi.status.toLowerCase() === filterStatus.toLowerCase());

    return matchesStatus;
  });

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return {
          icon: HiCheckCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
        };
      case 'pending':
        return {
          icon: HiClock,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
        };
      case 'cancelled':
        return {
          icon: HiXCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
        };
      default:
        return {
          icon: HiDocument,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
        };
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
                    PI Invoices
                  </h1>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <HiMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
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
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <Link
                  to="/add-pi"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
                >
                  <HiPlus className="w-5 h-5 mr-2" />
                  New Invoice
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices Display */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading invoices...</p>
          </div>
        ) : filteredPIs.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-600 flex items-center justify-center shadow-lg">
              <HiMagnifyingGlass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No invoices found
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Create your first invoice to get started.'}
            </p>
            {/* <Link
              to="/add-pi"
              className="inline-flex items-center px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 shadow-lg"
            >
              <HiPlus className="w-5 h-5 mr-2" />
              Create Invoice
            </Link> */}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-visible">
            {/* Desktop Table View */}
            <div className="hidden lg:block">
              {/* Table Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div
                  className="grid gap-2 text-sm font-semibold text-slate-700"
                  style={{
                    gridTemplateColumns:
                      '1.5fr 1.2fr 1fr 1fr 0.8fr 1fr 1fr 0.8fr',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <HiDocumentText className="w-4 h-4 text-slate-600" />
                    <span>Invoice No.</span>
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
                    <span>Items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiCreditCard className="w-4 h-4 text-slate-600" />
                    <span>Payment</span>
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
                {filteredPIs.map((pi) => {
                  const statusConfig = getStatusConfig(pi.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={pi.id}
                      className="p-4 hover:bg-white/50 transition-all duration-300"
                    >
                      <div
                        className="grid gap-2 items-center"
                        style={{
                          gridTemplateColumns:
                            '1.5fr 1.2fr 1fr 1fr 0.8fr 1fr 1fr 0.8fr',
                        }}
                      >
                        {/* Invoice Number */}
                        <div className="flex items-center gap-2">
                          <HiDocumentText className="w-4 h-4 text-slate-600 flex-shrink-0" />
                          <span
                            className="text-slate-800 font-medium truncate"
                            title={pi.piNumber}
                          >
                            {pi.piNumber}
                          </span>
                        </div>

                        {/* Client */}
                        <div
                          className="text-slate-700 text-sm truncate"
                          title={pi.party?.companyName}
                        >
                          {pi.party?.companyName || '-'}
                        </div>

                        {/* Date */}
                        <div className="text-slate-700 text-sm">
                          {new Date(pi.invoiceDate).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </div>

                        {/* Status */}
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {pi.status?.charAt(0).toUpperCase() +
                              pi.status?.slice(1)}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="text-slate-700 text-sm">
                          {pi._count?.products || 0}
                        </div>

                        {/* Payment */}
                        <div className="text-slate-700 text-sm">
                          {paymentTermNames[pi.paymentTerm] ||
                            pi.paymentTerm ||
                            '-'}
                        </div>

                        {/* Amount */}
                        <div className="text-slate-700 text-sm font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: pi.currency || 'USD',
                            maximumFractionDigits: 0,
                          }).format(pi.totalAmount || 0)}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end">
                          <div className="relative dropdown-container">
                            <button
                              data-dropdown-id={pi.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdown(
                                  openDropdown === pi.id ? null : pi.id
                                );
                              }}
                              className="p-2 rounded-lg text-slate-500 hover:bg-gray-100 transition-all duration-300"
                            >
                              <HiEllipsisVertical className="w-5 h-5" />
                            </button>

                            {openDropdown === pi.id && (
                              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[9999] backdrop-blur-sm">
                                <Link
                                  to={`/pi-details/${pi.id}`}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <HiEye className="w-4 h-4 text-slate-600" />
                                  </div>
                                  <span className="font-medium">
                                    View/confirm order
                                  </span>
                                </Link>
                                <Link
                                  to={`/edit-pi/${pi.id}`}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                    <HiPencil className="w-4 h-4 text-emerald-600" />
                                  </div>
                                  <span className="font-medium">
                                    Edit Invoice
                                  </span>
                                </Link>
                                <button
                                  onClick={async () => {
                                    setOpenDropdown(null);
                                    try {
                                      setDownloadingPdf(pi.id);
                                      toast.info('Preparing PDF download...', {
                                        autoClose: 2000,
                                      });
                                      await dispatch(
                                        downloadPiInvoicePdf(pi.id)
                                      ).unwrap();
                                      toast.success(
                                        'PDF downloaded successfully'
                                      );
                                    } catch (error) {
                                      console.error(
                                        'Error downloading PDF:',
                                        error
                                      );
                                      toast.error('Download failed');
                                    } finally {
                                      setDownloadingPdf(null);
                                    }
                                  }}
                                  disabled={downloadingPdf === pi.id}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 transition-all duration-200 w-full text-left disabled:opacity-50 border-b border-gray-50 last:border-b-0"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                    {downloadingPdf === pi.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
                                    ) : (
                                      <HiArrowDownTray className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                  <span className="font-medium">
                                    Download PDF
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    navigate(
                                      `/proforma-invoices/${pi.id}/email`
                                    );
                                  }}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 transition-all duration-200 w-full text-left border-b border-gray-50 last:border-b-0"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                    <HiEnvelope className="w-4 h-4 text-indigo-600" />
                                  </div>
                                  <span className="font-medium">
                                    Send Email
                                  </span>
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdown(null);
                                    setConfirmDelete(pi.id);
                                  }}
                                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                    <HiTrash className="w-4 h-4 text-red-600" />
                                  </div>
                                  <span className="font-medium">
                                    Delete Invoice
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden divide-y divide-white/20">
              {filteredPIs.map((pi) => {
                const statusConfig = getStatusConfig(pi.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div key={pi.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <HiDocumentText className="w-5 h-5 text-slate-600 flex-shrink-0" />
                        <h3 className="font-semibold text-slate-800">
                          {pi.piNumber}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/edit-pi/${pi.id}`}
                          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-emerald-600 transition-all duration-300"
                        >
                          <HiPencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(pi.id)}
                          className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-red-600 transition-all duration-300"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Client:
                        </span>
                        <div className="text-slate-700 truncate">
                          {pi.party?.companyName || '-'}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Date:
                        </span>
                        <div className="text-slate-700">
                          {new Date(pi.invoiceDate).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Status:
                        </span>
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {pi.status?.charAt(0).toUpperCase() +
                              pi.status?.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Items:
                        </span>
                        <div className="text-slate-700">
                          {pi._count?.products || 0}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Payment:
                        </span>
                        <div className="text-slate-700">
                          {paymentTermNames[pi.paymentTerm] ||
                            pi.paymentTerm ||
                            '-'}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-500 text-xs">
                          Amount:
                        </span>
                        <div className="text-slate-700 font-medium">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: pi.currency || 'USD',
                            maximumFractionDigits: 0,
                          }).format(pi.totalAmount || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center pt-3 mt-3 border-t border-gray-200">
                      <div className="relative dropdown-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(
                              openDropdown === pi.id ? null : pi.id
                            );
                          }}
                          className="p-2 rounded-lg text-slate-500 hover:bg-gray-100 transition-all duration-300"
                        >
                          <HiEllipsisVertical className="w-5 h-5" />
                        </button>

                        {openDropdown === pi.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[9999] backdrop-blur-sm">
                            <Link
                              to={`/pi-details/${pi.id}`}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                <HiEye className="w-4 h-4 text-slate-600" />
                              </div>
                              <span className="font-medium">View Details</span>
                            </Link>
                            <Link
                              to={`/edit-pi/${pi.id}`}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 transition-all duration-200 border-b border-gray-50 last:border-b-0"
                              onClick={() => setOpenDropdown(null)}
                            >
                              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                <HiPencil className="w-4 h-4 text-emerald-600" />
                              </div>
                              <span className="font-medium">Edit Invoice</span>
                            </Link>
                            <button
                              onClick={async () => {
                                setOpenDropdown(null);
                                try {
                                  setDownloadingPdf(pi.id);
                                  toast.info('Preparing PDF download...', {
                                    autoClose: 2000,
                                  });
                                  await dispatch(
                                    downloadPiInvoicePdf(pi.id)
                                  ).unwrap();
                                  toast.success('PDF downloaded successfully');
                                } catch (error) {
                                  console.error(
                                    'Error downloading PDF:',
                                    error
                                  );
                                  toast.error('Download failed');
                                } finally {
                                  setDownloadingPdf(null);
                                }
                              }}
                              disabled={downloadingPdf === pi.id}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 transition-all duration-200 w-full text-left disabled:opacity-50 border-b border-gray-50 last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                {downloadingPdf === pi.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-300 border-t-blue-600"></div>
                                ) : (
                                  <HiArrowDownTray className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                              <span className="font-medium">Download PDF</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                navigate(`/proforma-invoices/${pi.id}/email`);
                              }}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 transition-all duration-200 w-full text-left border-b border-gray-50 last:border-b-0"
                            >
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                                <HiEnvelope className="w-4 h-4 text-indigo-600" />
                              </div>
                              <span className="font-medium">Send Email</span>
                            </button>
                            <button
                              onClick={() => {
                                setOpenDropdown(null);
                                setConfirmDelete(pi.id);
                              }}
                              className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 w-full text-left"
                            >
                              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <HiTrash className="w-4 h-4 text-red-600" />
                              </div>
                              <span className="font-medium">
                                Delete Invoice
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Simple Pagination */}
        {pagination.total > 0 && (
          <div className="flex justify-center mt-6">
            <Pagination
              current={currentPage}
              total={pagination.total}
              pageSize={pageSize}
              onChange={(page) => {
                setCurrentPage(page);
                dispatch(
                  fetchPiInvoices({
                    page: page,
                    limit: pageSize,
                    search: searchTerm,
                  }) as any
                );
              }}
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
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                Delete Invoice
              </h3>
              <p className="text-slate-600">
                Are you sure you want to delete this invoice? This action cannot
                be undone.
              </p>
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

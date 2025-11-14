import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheck,
  faCheckCircle,
  faTimes,
  faEnvelope,
  faDownload,
  faFileInvoiceDollar,
  faBuilding,
  faShippingFast,
  faBoxes,
  faCalculator,
  faEdit,
  faPrint,
  faShare
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { useDispatch } from 'react-redux';
import { 
  getPiInvoiceById,
  updatePiStatus,
  updatePiInvoice,
  updatePiAmount,
  downloadPiInvoicePdf
} from '../../features/piSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';


const PIDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [piData, setPiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState<boolean | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);


  useEffect(() => {
    const fetchPIDetails = async () => {
      try {
        setLoading(true);
        const response = await dispatch(getPiInvoiceById(id)).unwrap();
        setPiData(response.data || response);
      } catch (error) {
        console.error('Error fetching PI details:', error);
        toast.error('Failed to load PI details');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPIDetails();
  }, [id]);

  const handlePaymentSubmit = async () => {
    try {
      if (paymentReceived && paymentAmount) {
        const payment = parseFloat(paymentAmount);
        const currentTotal = piData.totalAmount || piData.total || 0;
        const updatedTotalAmount = currentTotal - payment;

        const updatedData = {
          ...piData,
          totalAmount: updatedTotalAmount,
          total: updatedTotalAmount,
        };

        setPiData(updatedData);

        try {
          await dispatch(updatePiAmount({
            id,
            amountData: {
              totalAmount: updatedTotalAmount,
              advanceAmount: payment,
            }
          })).unwrap();
        } catch (backendError) {
          try {
            await dispatch(updatePiInvoice({
              id,
              piData: {
                totalAmount: updatedTotalAmount,
                advanceAmount: payment,
              }
            })).unwrap();
          } catch (fallbackError) {
            toast.error('Failed to update amount in backend');
          }
        }

        toast.success(`Payment of $${paymentAmount} confirmed successfully`);
      } else {
        toast.success('Order confirmed successfully');
      }

      await dispatch(updatePiStatus({ id, status: 'confirmed' })).unwrap();
      setPiData((prev) => ({ ...prev, status: 'confirmed' }));

      setConfirmationData({
        piNumber: piData.piNumber,
        companyName: piData.party?.companyName,
        totalAmount: formattedAmount,
        paymentReceived
      });
      setShowConfirmationMessage(true);

      setTimeout(() => {
        setShowConfirmationMessage(false);
      }, 5000);

      setShowPayment(false);
      setPaymentReceived(null);
      setPaymentAmount('');
    } catch (error: any) {
      console.error('Error confirming order:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to confirm order';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!piData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">PI Invoice not found</p>
      </div>
    );
  }

  const paymentTermNames: Record<string, string> = {
    advance: 'Advance',
    lc: 'LC',
    '30days': '30 Days Credit',
  };

  const deliveryTermNames: Record<string, string> = {
    fob: 'FOB',
    cif: 'CIF',
    ddp: 'DDP',
  };

  const formattedDate = new Date(
    piData.invoiceDate || piData.date || new Date()
  ).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentTotalAmount = piData.totalAmount || piData.total || 0;
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: piData.currency || 'USD',
  }).format(currentTotalAmount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {piData.piNumber || piData.invoiceNumber || 'PI Invoice'}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">{formattedDate}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      piData.status === 'pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : piData.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : piData.status === 'draft'
                            ? 'bg-slate-50 text-slate-700 border border-slate-200'
                            : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {piData.status?.charAt(0).toUpperCase() + piData.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              {/* <button
                onClick={() => navigate(`/proforma-invoices/${id}/edit`)}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faEdit} className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </button> */}
              <button
                onClick={async () => {
                  try {
                    setDownloadingPdf(true);
                    toast.info('Preparing PDF download...', { autoClose: 2000 });
                    await dispatch(downloadPiInvoicePdf(id)).unwrap();
                    toast.success('PDF downloaded successfully');
                  } catch (error) {
                    console.error('Error downloading PDF:', error);
                    toast.error('Failed to download PDF');
                  } finally {
                    setDownloadingPdf(false);
                  }
                }}
                disabled={downloadingPdf}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingPdf ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Download</span>
                  </>
                )}
              </button>
              <button
                onClick={() => navigate(`/proforma-invoices/${id}/email`)}
                className="px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Email</span>
              </button>
              {piData.status === 'confirmed' ? (
                <div className="px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Confirmed</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/proforma-invoices/${id}/confirm`)}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Confirm Order</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Invoice Summary Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 overflow-hidden">
          <div className="bg-slate-700 px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-white">
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">{formattedAmount}</h2>
                <p className="text-slate-200 text-sm sm:text-base">Total Invoice Amount</p>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <div className="text-white text-sm">
                  <span className="text-slate-200">Currency:</span> {piData.currency || 'USD'}
                </div>
                <div className="text-white text-sm">
                  <span className="text-slate-200">Products:</span> {piData.products?.length || 0} items
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Company Name
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {piData.party?.companyName || piData.company?.name || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Contact Person
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {piData.contactPerson || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Email Address
                </label>
                <p className="text-lg font-medium text-slate-600 hover:text-slate-800 cursor-pointer">
                  {piData.email || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Phone Number
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {piData.phone || 'N/A'}
                </p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Business Address
                </label>
                <p className="text-lg font-medium text-gray-900 leading-relaxed">
                  {piData.address || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice & Terms Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileInvoiceDollar} className="w-5 h-5 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Invoice Terms</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Payment Terms</span>
                  <span className="text-lg font-bold text-gray-900">
                    {paymentTermNames[piData.paymentTerm] || piData.paymentTerm}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Delivery Terms</span>
                  <span className="text-lg font-bold text-gray-900">
                    {deliveryTermNames[piData.deliveryTerm] || piData.deliveryTerm}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Currency</span>
                  <span className="text-lg font-bold text-slate-700">
                    {piData.currency || 'USD'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faCalculator} className="w-5 h-5 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Quick Stats</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-700">{piData.products?.length || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Products</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-700">{piData.totalBoxes || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Total Boxes</div>
                </div>
                <div className="text-center p-4 bg-stone-50 rounded-lg">
                  <div className="text-2xl font-bold text-stone-700">{piData.totalWeight || 0}</div>
                  <div className="text-sm text-gray-600 mt-1">Weight (kg)</div>
                </div>
                <div className="text-center p-4 bg-zinc-50 rounded-lg">
                  <div className="text-2xl font-bold text-zinc-700">{piData.requiredContainers || 1}</div>
                  <div className="text-sm text-gray-600 mt-1">Containers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container & Shipping Details */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faShippingFast} className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Container & Shipping Details</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Container Type
                </label>
                <p className="text-xl font-bold text-gray-900">
                  {piData.containerType || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
                  Number of Containers
                </label>
                <p className="text-xl font-bold text-gray-900">
                  {piData.numberOfContainers || 1}
                </p>
              </div>
              <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                <label className="block text-sm font-bold text-stone-600 mb-2 uppercase tracking-wide">
                  Capacity Basis
                </label>
                <p className="text-xl font-bold text-gray-900">
                  {piData.capacityBasis === 'weight'
                    ? 'By Weight (KG)'
                    : 'By Volume (CBM)'}
                </p>
              </div>
              <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200">
                <label className="block text-sm font-bold text-zinc-600 mb-2 uppercase tracking-wide">
                  Max Permissible Weight
                </label>
                <p className="text-xl font-bold text-gray-900">
                  {piData.maxPermissibleWeight || 'N/A'} kg
                </p>
              </div>
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                <label className="block text-sm font-bold text-neutral-600 mb-2 uppercase tracking-wide">
                  Max Shipment Weight
                </label>
                <p className="text-xl font-bold text-gray-900">
                  {piData.maxShipmentWeight || 'N/A'} kg
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-sm font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Required Containers
                </label>
                <p className="text-xl font-bold text-gray-900">
                  {piData.requiredContainers || 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon icon={faBoxes} className="w-5 h-5 text-slate-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Products ({piData.products?.length || 0} items)
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                Total Value: <span className="font-bold text-gray-900">{formattedAmount}</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {piData.products?.map((product: any, index: number) => (
                <div
                  key={product.id}
                  className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 text-lg mb-1">
                        {product.productName}
                      </div>
                      {product.productDescription && (
                        <div className="text-sm text-gray-600 mb-2">
                          {product.productDescription}
                        </div>
                      )}
                    </div>
                    <div className="ml-3 text-right">
                      <div className="text-lg font-bold text-slate-700">
                        ${product.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">HS Code</div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.hsCode || product.category?.hsnCode || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Quantity</div>
                      <div className="text-sm font-medium text-gray-900">
                        {product.quantity} {product.unit}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Rate</div>
                      <div className="text-sm font-medium text-gray-900">
                        ${product.rate.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Item #{index + 1}</div>
                      <div className="text-sm font-medium text-slate-700">
                        ${product.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )) || (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                  <FontAwesomeIcon icon={faBoxes} className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="text-lg font-medium">No products found</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                      Product Details
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                      HS Code
                    </th>
                    <th className="text-right py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                      Quantity
                    </th>
                    <th className="text-right py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                      Unit Rate
                    </th>
                    <th className="text-right py-4 px-6 font-bold text-gray-700 text-sm uppercase tracking-wide">
                      Total Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {piData.products?.map((product: any, index: number) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-slate-600 font-bold text-sm">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-base mb-1">
                              {product.productName}
                            </p>
                            {product.productDescription && (
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {product.productDescription}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {product.hsCode || product.category?.hsnCode || 'N/A'}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="text-base font-semibold text-gray-900">
                          {product.quantity}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.unit}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="text-base font-semibold text-gray-900">
                          ${product.rate.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          per {product.unit}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <div className="text-lg font-bold text-slate-700">
                          ${product.total.toFixed(2)}
                        </div>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-12 text-center"
                      >
                        <div className="flex flex-col items-center">
                          <FontAwesomeIcon icon={faBoxes} className="w-16 h-16 text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-500">No products found</p>
                          <p className="text-sm text-gray-400">Add products to see them here</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faCalculator} className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Financial Summary</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Financial Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Subtotal</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${piData.subtotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Additional Charges</span>
                  <span className="text-lg font-bold text-gray-900">
                    ${piData.chargesTotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <span className="text-sm font-semibold text-amber-700 uppercase tracking-wide">Advance Paid</span>
                  <span className="text-lg font-bold text-amber-700">
                    ${(piData.advanceAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Weight</span>
                  <span className="text-lg font-bold text-slate-700">
                    {piData.totalWeight || 0} kg
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-sm font-semibold text-stone-600 uppercase tracking-wide">Total Volume</span>
                  <span className="text-lg font-bold text-stone-700">
                    {piData.totalVolume || 0} CBM
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-sm font-semibold text-zinc-600 uppercase tracking-wide">Total Boxes</span>
                  <span className="text-lg font-bold text-zinc-700">
                    {piData.totalBoxes || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Amount - Highlighted */}
            <div className="bg-slate-700 rounded-lg p-6 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-200 mb-1">Total Invoice Amount</h3>
                  <p className="text-sm text-slate-300">Including all charges and taxes</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl sm:text-4xl font-bold">
                    {formattedAmount}
                  </div>
                  <div className="text-sm text-slate-300 mt-1">
                    {piData.currency || 'USD'} Currency
                  </div>
                </div>
              </div>
            </div>

            {/* Outstanding Balance */}
            {piData.advanceAmount && piData.advanceAmount > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                    Outstanding Balance
                  </span>
                  <span className="text-xl font-bold text-red-700">
                    ${(currentTotalAmount - (piData.advanceAmount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>






    </div>
  );
};

export default PIDetails;
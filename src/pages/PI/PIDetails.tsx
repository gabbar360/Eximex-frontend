import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCheck,
  faCheckCircle,
  faEnvelope,
  faDownload,
  faFileInvoiceDollar,
  faBuilding,
  faShippingFast,
  faBoxes,
  faCalculator,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { useDispatch } from 'react-redux';
import { getPiInvoiceById, downloadPiInvoicePdf } from '../../features/piSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PIDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [piData, setPiData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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
  }, [id, dispatch]);

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

  const currentTotalAmount =
    ((piData as Record<string, unknown>)?.totalAmount as number) ||
    ((piData as Record<string, unknown>)?.total as number) ||
    0;
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency:
      ((piData as Record<string, unknown>)?.currency as string) || 'USD',
  }).format(currentTotalAmount);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="mb-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className="w-4 h-4 text-gray-600"
                />
              </button>
              <div className="p-3 rounded-lg bg-slate-700 shadow-lg">
                <FontAwesomeIcon
                  icon={faFileInvoiceDollar}
                  className="w-6 h-6 text-white"
                />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                  {((piData as Record<string, unknown>)?.piNumber as string) ||
                    ((piData as Record<string, unknown>)
                      ?.invoiceNumber as string) ||
                    'PI Invoice'}
                </h1>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={async () => {
                  try {
                    setDownloadingPdf(true);
                    toast.info('Preparing PDF download...', {
                      autoClose: 2000,
                    });
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
                className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {downloadingPdf ? (
                  <LoadingSpinner size="small" />
                ) : (
                  <>
                    <FontAwesomeIcon
                      icon={faDownload}
                      className="w-4 h-4 mr-2"
                    />
                    Download PDF
                  </>
                )}
              </button>
              <button
                onClick={() => navigate(`/proforma-invoices/${id}/email`)}
                className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                Send Email
              </button>
              {piData.status === 'confirmed' ? (
                <div className="px-4 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="w-4 h-4 mr-2"
                  />
                  Confirmed
                </div>
              ) : (
                <button
                  onClick={() => navigate(`/proforma-invoices/${id}/confirm`)}
                  className="px-4 py-3 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors duration-200 shadow-lg"
                >
                  <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />
                  Confirm Order
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-2 lg:p-4">
        {/* Company Information */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="w-5 h-5 text-white"
                />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Company Information
              </h2>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Company Name
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {((
                    (piData as Record<string, unknown>)?.party as Record<
                      string,
                      unknown
                    >
                  )?.companyName as string) ||
                    ((
                      (piData as Record<string, unknown>)?.company as Record<
                        string,
                        unknown
                      >
                    )?.name as string) ||
                    'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Total Invoice Amount
                </span>
                <span className="text-sm font-bold text-slate-700">
                  {formattedAmount}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Invoice Date
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {new Date(
                    ((piData as Record<string, unknown>)
                      ?.invoiceDate as string) ||
                      ((piData as Record<string, unknown>)?.date as string) ||
                      new Date().toISOString()
                  ).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Currency
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {((piData as Record<string, unknown>)?.currency as string) ||
                    'USD'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Contact Person
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {((piData as Record<string, unknown>)
                    ?.contactPerson as string) || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </span>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    ((piData as Record<string, unknown>)?.status as string) ===
                    'pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : ((piData as Record<string, unknown>)
                            ?.status as string) === 'confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : ((piData as Record<string, unknown>)
                              ?.status as string) === 'draft'
                          ? 'bg-slate-50 text-slate-700 border-slate-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {(
                    ((piData as Record<string, unknown>)?.status as string) ||
                    ''
                  )
                    .charAt(0)
                    .toUpperCase() +
                    (
                      ((piData as Record<string, unknown>)?.status as string) ||
                      ''
                    ).slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Email Address
                </span>
                <span className="text-sm font-bold text-slate-600 hover:text-slate-800 cursor-pointer">
                  {((piData as Record<string, unknown>)?.email as string) ||
                    'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Phone Number
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {((piData as Record<string, unknown>)?.phone as string) ||
                    'N/A'}
                </span>
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Business Address
                </span>
                <span className="text-sm font-bold text-gray-900 text-right max-w-xs">
                  {((piData as Record<string, unknown>)?.address as string) ||
                    'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice & Terms Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faFileInvoiceDollar}
                    className="w-5 h-5 text-white"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Invoice Terms
                </h2>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Payment Terms
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {paymentTermNames[piData.paymentTerm] || piData.paymentTerm}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Delivery Terms
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {deliveryTermNames[piData.deliveryTerm] ||
                      piData.deliveryTerm}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Currency
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    {piData.currency || 'USD'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faCalculator}
                    className="w-5 h-5 text-white"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Quick Stats</h2>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-lg">
                  <div className="text-lg font-bold text-slate-700">
                    {piData.products?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Products</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-700">
                    {piData.totalBoxes || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Total Boxes</div>
                </div>
                <div className="text-center p-3 bg-stone-50 rounded-lg">
                  <div className="text-lg font-bold text-stone-700">
                    {piData.totalWeight || 0}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Weight (kg)</div>
                </div>
                <div className="text-center p-3 bg-zinc-50 rounded-lg">
                  <div className="text-lg font-bold text-zinc-700">
                    {piData.requiredContainers || 1}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Containers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Container & Shipping Details */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faShippingFast}
                  className="w-5 h-5 text-white"
                />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Container & Shipping Details
              </h2>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">
                  Container Type
                </label>
                <p className="text-sm font-bold text-gray-900">
                  {piData.containerType || 'N/A'}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wide">
                  Number of Containers
                </label>
                <p className="text-sm font-bold text-gray-900">
                  {piData.numberOfContainers || 1}
                </p>
              </div>
              <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                <label className="block text-xs font-bold text-stone-600 mb-1 uppercase tracking-wide">
                  Capacity Basis
                </label>
                <p className="text-sm font-bold text-gray-900">
                  {piData.capacityBasis === 'weight'
                    ? 'By Weight (KG)'
                    : 'By Volume (CBM)'}
                </p>
              </div>
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <label className="block text-xs font-bold text-zinc-600 mb-1 uppercase tracking-wide">
                  Max Permissible Weight
                </label>
                <p className="text-sm font-bold text-gray-900">
                  {piData.maxPermissibleWeight || 'N/A'} kg
                </p>
              </div>
              <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                <label className="block text-xs font-bold text-neutral-600 mb-1 uppercase tracking-wide">
                  Max Shipment Weight
                </label>
                <p className="text-sm font-bold text-gray-900">
                  {piData.maxShipmentWeight || 'N/A'} kg
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase tracking-wide">
                  Required Containers
                </label>
                <p className="text-sm font-bold text-gray-900">
                  {piData.requiredContainers || 1}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faBoxes}
                    className="w-5 h-5 text-white"
                  />
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Products ({piData.products?.length || 0} items)
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                Total Value:{' '}
                <span className="font-bold text-gray-900">
                  {formattedAmount}
                </span>
              </div>
            </div>
          </div>
          <div className="p-4">
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4">
              {piData.products?.map(
                (product: Record<string, unknown>, index: number) => (
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
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          HS Code
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.hsCode || product.category?.hsnCode || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Quantity
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.quantity} {product.unit}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Rate
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          ${product.rate.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Item #{index + 1}
                        </div>
                        <div className="text-sm font-medium text-slate-700">
                          ${product.total.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) || (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
                  <FontAwesomeIcon
                    icon={faBoxes}
                    className="w-12 h-12 text-gray-300 mb-3"
                  />
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
                  {piData.products?.map(
                    (product: Record<string, unknown>, index: number) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="py-5 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-slate-600 font-bold text-sm">
                                #{index + 1}
                              </span>
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
                            {product.hsCode ||
                              product.category?.hsnCode ||
                              'N/A'}
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
                    )
                  ) || (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center">
                          <FontAwesomeIcon
                            icon={faBoxes}
                            className="w-16 h-16 text-gray-300 mb-4"
                          />
                          <p className="text-lg font-medium text-gray-500">
                            No products found
                          </p>
                          <p className="text-sm text-gray-400">
                            Add products to see them here
                          </p>
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
          <div className="bg-gray-50 border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faCalculator}
                  className="w-5 h-5 text-white"
                />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Financial Summary
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Financial Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Subtotal
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${piData.subtotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Additional Charges
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${piData.chargesTotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 rounded-lg  bg-gray-50 text-gray-600">
                  <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Advance Paid
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    ${(piData.advanceAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Shipping Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                    Total Weight
                  </span>
                  <span className="text-lg font-bold text-slate-700">
                    {piData.totalWeight || 0} kg
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-stone-50 rounded-lg border border-stone-200">
                  <span className="text-sm font-semibold text-stone-600 uppercase tracking-wide">
                    Total Volume
                  </span>
                  <span className="text-lg font-bold text-stone-700">
                    {piData.totalVolume || 0} CBM
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                  <span className="text-sm font-semibold text-zinc-600 uppercase tracking-wide">
                    Total Boxes
                  </span>
                  <span className="text-lg font-bold text-zinc-700">
                    {piData.totalBoxes || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Amount - Highlighted */}
            {/* <div className="bg-slate-700 rounded-lg p-4 text-white">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">Total Invoice Amount</h3>
                  <p className="text-xs text-slate-300">Including all charges and taxes</p>
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-bold">
                    {formattedAmount}
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    {piData.currency || 'USD'} Currency
                  </div>
                </div>
              </div>
            </div> */}

            {/* Outstanding Balance */}
            {piData.advanceAmount && piData.advanceAmount > 0 && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-red-700 uppercase tracking-wide">
                    Outstanding Balance
                  </span>
                  <span className="text-xl font-bold text-red-700">
                    $
                    {(currentTotalAmount - (piData.advanceAmount || 0)).toFixed(
                      2
                    )}
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

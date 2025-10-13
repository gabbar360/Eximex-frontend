import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faDownload,
  faPrint,
  faCalendarAlt,
  faBuilding,
  faUser,
  faEnvelope,
  faPhone,
  faFileInvoice,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import orderService from '../../service/orderService';
import PageMeta from '../../components/common/PageMeta';

const ViewInvoice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderService.getOrderById(id);
        setOrder(response);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load invoice data');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id, navigate]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const result = await orderService.downloadOrderInvoicePdf(id);
      toast.success(`Invoice PDF downloaded: ${result.filename}`);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4">Loading invoice...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
      </div>
    );
  }

  const formattedDate = new Date(
    order.piInvoice?.invoiceDate ||
      order.bookingDate ||
      order.createdAt ||
      new Date()
  ).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: order.piInvoice?.currency || 'USD',
  }).format(order.totalAmount || 0);

  // Debug: Uncomment below for debugging
  // console.log("Complete Order Data Structure:", order);
  // console.log("Order Products:", order.products);
  // console.log("Order PI Invoice:", order.piInvoice);

  return (
    <>
      <PageMeta
        title={`Invoice ${order.orderNumber || order.piInvoice?.piNumber || order.id} | EximEx Dashboard`}
      />

      <div className="max-w-4xl mx-auto p-3 sm:p-6 bg-white dark:bg-gray-900 print:p-0 print:max-w-none">
        {/* Header - Hidden in print */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6 print:hidden">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex-shrink-0"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                View Invoice
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base truncate">
                {order.orderNumber ||
                  order.piInvoice?.piNumber ||
                  `INV-${order.id}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm flex-1 sm:flex-none"
            >
              <FontAwesomeIcon icon={faPrint} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex-1 sm:flex-none"
            >
              {downloading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <FontAwesomeIcon icon={faDownload} />
              )}
              <span className="hidden sm:inline">
                {downloading ? 'Downloading...' : 'Download PDF'}
              </span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 sm:p-8 print:border-0 print:rounded-none">
          {/* Invoice Header */}
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <FontAwesomeIcon
                  icon={faFileInvoice}
                  className="text-blue-600 text-lg sm:text-xl flex-shrink-0"
                />
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  INVOICE
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Invoice #:{' '}
                <span className="font-semibold">
                  {order.orderNumber ||
                    order.piInvoice?.piNumber ||
                    `INV-${order.id}`}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                Date: <span className="font-semibold">{formattedDate}</span>
              </p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formattedAmount}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Amount
              </p>
            </div>
          </div>

          {/* Company & Customer Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* From */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faBuilding} className="text-blue-600" />
                From
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p className="font-semibold">
                  {order.company?.name || 'EximEx Company'}
                </p>
                <p>{order.company?.address || 'Company Address'}</p>
                <p>GST: {order.company?.gstNumber || 'N/A'}</p>
                <p>IEC: {order.company?.iecNumber || 'N/A'}</p>
                <p>
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Contact Email
                </p>
              </div>
            </div>

            {/* To */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FontAwesomeIcon icon={faUser} className="text-green-600" />
                Bill To
              </h3>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p className="font-semibold">
                  {order.piInvoice?.party?.companyName || 'Customer'}
                </p>
                {(order.piInvoice?.party?.contactPerson ||
                  order.piInvoice?.contactPerson) && (
                  <p className="text-sm">
                    Contact:{' '}
                    {order.piInvoice?.party?.contactPerson ||
                      order.piInvoice?.contactPerson}
                  </p>
                )}
                <p>
                  {order.piInvoice?.party?.address ||
                    order.piInvoice?.address ||
                    'Address not available'}
                </p>
                <p>
                  {order.piInvoice?.party?.city && (
                    <>{order.piInvoice.party.city}, </>
                  )}
                  {order.piInvoice?.party?.state && (
                    <>{order.piInvoice.party.state}, </>
                  )}
                  {order.piInvoice?.party?.country || order.piInvoice?.country}
                </p>
                <p>
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  {order.piInvoice?.party?.email || order.piInvoice?.email}
                </p>
                <p>
                  <FontAwesomeIcon icon={faPhone} className="mr-2" />
                  {order.piInvoice?.party?.phone || order.piInvoice?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Payment Terms
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.piInvoice?.paymentTerm?.toUpperCase() || 'ADVANCE'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Delivery Terms
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {(
                  order.deliveryTerms ||
                  order.piInvoice?.deliveryTerm ||
                  'FOB'
                ).toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Currency
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {order.piInvoice?.currency || 'USD'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    order.orderStatus === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : order.orderStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {order.orderStatus?.toUpperCase() || 'CONFIRMED'}
                </span>
              </p>
            </div>
          </div>

          {/* Products Table */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Products
            </h3>

            {/* Mobile Card View */}
            <div className="block sm:hidden space-y-3">
              {(order.piInvoice?.products || []).map(
                (product: any, index: number) => (
                  <div
                    key={product.id || index}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-2">
                      {product.productName || 'Product ' + (index + 1)}
                    </div>
                    {product.productDescription && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        {product.productDescription}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          HSN:
                        </span>
                        <span className="ml-1 text-gray-900 dark:text-white">
                          {product.hsCode ||
                            product.category?.hsnCode ||
                            product.subcategory?.hsnCode ||
                            '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Qty:
                        </span>
                        <span className="ml-1 text-gray-900 dark:text-white">
                          {product.quantity || 0} {product.unit || 'pcs'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Rate:
                        </span>
                        <span className="ml-1 text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: order.piInvoice?.currency || 'USD',
                          }).format(product.rate || 0)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Total:
                        </span>
                        <span className="ml-1 font-medium text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: order.piInvoice?.currency || 'USD',
                          }).format(product.total || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              )}
              {(!order.piInvoice?.products ||
                order.piInvoice?.products.length === 0) && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
                  No products found
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 dark:text-white text-sm">
                      Product
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-left font-medium text-gray-900 dark:text-white text-sm">
                      HSN Code
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-right font-medium text-gray-900 dark:text-white text-sm">
                      Quantity
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-right font-medium text-gray-900 dark:text-white text-sm">
                      Rate
                    </th>
                    <th className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-right font-medium text-gray-900 dark:text-white text-sm">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(order.piInvoice?.products || []).map(
                    (product: any, index: number) => (
                      <tr key={product.id || index}>
                        <td className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-white">
                          <div>
                            <p className="font-medium text-sm">
                              {product.productName || 'Product ' + (index + 1)}
                            </p>
                            {product.productDescription && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {product.productDescription}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-gray-900 dark:text-white text-sm">
                          {product.hsCode ||
                            product.category?.hsnCode ||
                            product.subcategory?.hsnCode ||
                            '-'}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-right text-gray-900 dark:text-white text-sm">
                          {product.quantity || 0} {product.unit || 'pcs'}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-right text-gray-900 dark:text-white text-sm">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: order.piInvoice?.currency || 'USD',
                          }).format(product.rate || 0)}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-700 px-3 sm:px-4 py-2 sm:py-3 text-right font-medium text-gray-900 dark:text-white text-sm">
                          {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: order.piInvoice?.currency || 'USD',
                          }).format(product.total || 0)}
                        </td>
                      </tr>
                    )
                  )}
                  {(!order.piInvoice?.products ||
                    order.piInvoice?.products.length === 0) && (
                    <tr>
                      <td
                        colSpan={5}
                        className="border border-gray-300 dark:border-gray-700 px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No products found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-6 sm:mb-8">
            <div className="w-full sm:max-w-md space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: order.piInvoice?.currency || 'USD',
                  }).format(order.piInvoice?.subtotal || 0)}
                </span>
              </div>
              {order.piInvoice?.chargesTotal &&
                order.piInvoice?.chargesTotal > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Charges:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: order.piInvoice?.currency || 'USD',
                      }).format(order.piInvoice?.chargesTotal || 0)}
                    </span>
                  </div>
                )}
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Advance Amount:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: order.piInvoice?.currency || 'USD',
                  }).format(order.piInvoice?.advanceAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-t border-gray-300 dark:border-gray-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total:
                </span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: order.piInvoice?.currency || 'USD',
                  }).format(order.totalAmount || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Payment Information
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Terms: {order.piInvoice?.paymentTerm || 'Advance'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Status:{' '}
                  <span className="font-medium">
                    {order.paymentStatus || 'Pending'}
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payment Amount:{' '}
                  <span className="font-medium">
                    {order.paymentAmount
                      ? new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: order.piInvoice?.currency || 'USD',
                        }).format(parseFloat(order.paymentAmount))
                      : '0'}
                  </span>
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Shipping Information
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Container Type: {order.piInvoice?.containerType || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Weight: {order.piInvoice?.totalWeight || 0} kg
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Volume: {order.piInvoice?.totalVolume || 0} CBM
                </p>
                {order.bookingNumber && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Booking Number: {order.bookingNumber}
                  </p>
                )}
                {order.wayBillNumber && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Way Bill Number: {order.wayBillNumber}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewInvoice;

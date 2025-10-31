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
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Confetti from 'react-confetti';
import {
  getPiInvoiceById,
  updatePiStatus,
  updatePiInvoice,
  downloadPiInvoicePdf,
} from '../../service/piService';
import { useDispatch } from 'react-redux';
import { updatePiAmount } from '../../features/piSlice';
import EmailInvoiceModal from '../../components/EmailInvoiceModal';

const PIDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [piData, setPiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentReceived, setPaymentReceived] = useState<boolean | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showConfirmationOverlay, setShowConfirmationOverlay] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    // Fetch PI details by ID
    const fetchPIDetails = async () => {
      try {
        setLoading(true);
        const response = await getPiInvoiceById(id);
        // console.log("API Response:", response); // Debug log
        setPiData(response.data);
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
      console.log('Before update - piData:', piData);

      // If payment received, subtract from total amount
      if (paymentReceived && paymentAmount) {
        const payment = parseFloat(paymentAmount);
        const currentTotal = piData.totalAmount || piData.total || 0;
        const updatedTotalAmount = currentTotal - payment;

        console.log('Payment:', payment);
        console.log('Current Total:', currentTotal);
        console.log('Updated Total:', updatedTotalAmount);

        // Update piData with new total amount immediately
        const updatedData = {
          ...piData,
          totalAmount: updatedTotalAmount,
          total: updatedTotalAmount,
        };

        setPiData(updatedData);
        console.log('After update - piData:', updatedData);

        // Update totalAmount and advanceAmount in backend using Redux
        try {
          console.log(
            'Updating totalAmount and advanceAmount in backend:',
            {
              totalAmount: updatedTotalAmount,
              advanceAmount: payment,
            }
          );
          await dispatch(updatePiAmount({
            id,
            amountData: {
              totalAmount: updatedTotalAmount,
              advanceAmount: payment,
            }
          })).unwrap();
          console.log('Backend amount update successful');
        } catch (backendError) {
          console.error('Backend amount update failed:', backendError);
          // Fallback to regular update
          try {
            await updatePiInvoice(id, {
              totalAmount: updatedTotalAmount,
              advanceAmount: payment,
            });
          } catch (fallbackError) {
            console.error('Fallback update also failed:', fallbackError);
            toast.error('Failed to update amount in backend');
          }
        }

        toast.success(`Payment of $${paymentAmount} confirmed successfully`);
      } else {
        toast.success('Order confirmed successfully');
      }

      // Update PI status to "confirmed" via API
      await updatePiStatus(id, 'confirmed');

      // Update local state to reflect confirmed status
      setPiData((prev) => ({ ...prev, status: 'confirmed' }));

      // Show confetti animation and confirmation overlay
      setShowConfetti(true);
      setShowConfirmationOverlay(true);

      // Hide confetti and overlay after 4 seconds
      setTimeout(() => {
        setShowConfetti(false);
        setShowConfirmationOverlay(false);
      }, 4000);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
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

  // Debug log to see data structure
  console.log('PI Data:', piData);

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

  // Calculate formatted amount inside render to reflect state changes
  const currentTotalAmount = piData.totalAmount || piData.total || 0;
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: piData.currency || 'USD',
  }).format(currentTotalAmount);

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 flex-shrink-0"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {piData.piNumber || piData.invoiceNumber || 'PI Invoice'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
              {formattedDate}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={() => downloadPiInvoicePdf(id)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faDownload} />
            Download PDF
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faEnvelope} />
            Email Invoice
          </button>
          {piData.status === 'confirmed' ? (
            <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm sm:text-base border border-green-300">
              <FontAwesomeIcon icon={faCheckCircle} />
              Order Confirmed
            </div>
          ) : (
            <button
              onClick={() => setShowPayment(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base"
            >
              <FontAwesomeIcon icon={faCheck} />
              Confirm Order
            </button>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            piData.status === 'Pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500'
              : piData.status === 'Approved'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          {piData.status}
        </span>
      </div>

      {/* Company Details */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Company Information
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Company Name
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.party?.companyName || piData.company?.name || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Contact Person
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.contactPerson || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Email
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.email || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Phone
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.phone || 'N/A'}
            </p>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Address
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.address || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Invoice Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Payment Terms
            </label>
            <p className="text-gray-900 dark:text-white">
              {paymentTermNames[piData.paymentTerm] || piData.paymentTerm}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Delivery Terms
            </label>
            <p className="text-gray-900 dark:text-white">
              {deliveryTermNames[piData.deliveryTerm] || piData.deliveryTerm}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Currency
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.currency || 'USD'}
            </p>
          </div>
        </div>
      </div>

      {/* Container & Shipping Details */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Container & Shipping Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Container Type
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.containerType || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Number of Containers
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.numberOfContainers || 1}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Capacity Basis
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.capacityBasis === 'weight'
                ? 'By Weight (KG)'
                : 'By Volume (CBM)'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Max Permissible Weight
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.maxPermissibleWeight || 'N/A'} kg
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Max Shipment Weight
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.maxShipmentWeight || 'N/A'} kg
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Required Containers
            </label>
            <p className="text-gray-900 dark:text-white">
              {piData.requiredContainers || 1}
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Products ({piData.products?.length || 0} items)
        </h2>

        {/* Mobile Card View */}
        <div className="block sm:hidden space-y-3">
          {piData.products?.map((product: any) => (
            <div
              key={product.id}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="font-medium text-gray-900 dark:text-white mb-2">
                {product.productName}
              </div>
              {product.productDescription && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  {product.productDescription}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    HS Code:
                  </span>
                  <span className="ml-1 text-gray-900 dark:text-white">
                    {product.hsCode || product.category?.hsnCode || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Qty:</span>
                  <span className="ml-1 text-gray-900 dark:text-white">
                    {product.quantity} {product.unit}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Rate:
                  </span>
                  <span className="ml-1 text-gray-900 dark:text-white">
                    ${product.rate.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">
                    Total:
                  </span>
                  <span className="ml-1 font-medium text-gray-900 dark:text-white">
                    ${product.total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )) || (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
              No products found
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                  Product
                </th>
                <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                  HS Code
                </th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                  Quantity
                </th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                  Rate
                </th>
                <th className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium text-gray-500 dark:text-gray-400 text-sm">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {piData.products?.map((product: any) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-2 sm:py-3 px-2 sm:px-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {product.productName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.productDescription}
                      </p>
                    </div>
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-gray-900 dark:text-white text-sm">
                    {product.hsCode || product.category?.hsnCode || 'N/A'}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-900 dark:text-white text-sm">
                    {product.quantity} {product.unit}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right text-gray-900 dark:text-white text-sm">
                    ${product.rate.toFixed(2)}
                  </td>
                  <td className="py-2 sm:py-3 px-2 sm:px-4 text-right font-medium text-gray-900 dark:text-white text-sm">
                    ${product.total.toFixed(2)}
                  </td>
                </tr>
              )) || (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charges & Additional Information */}
      {piData.charges && Object.keys(piData.charges).length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Additional Charges
          </h2>
          <div className="space-y-3">
            {piData.charges.noOtherCharges ? (
              <p className="text-gray-600 dark:text-gray-400">
                No other charges applicable (FOB terms)
              </p>
            ) : (
              Object.entries(piData.charges).map(
                ([key, value]: [string, any]) => {
                  if (key === 'noOtherCharges') return null;
                  if (key === 'otherCharges' && Array.isArray(value)) {
                    return value.map((charge: any, index: number) => (
                      <div
                        key={`${key}-${index}`}
                        className="flex justify-between"
                      >
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {charge.name}:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${(parseFloat(charge.amount) || 0).toFixed(2)}
                        </span>
                      </div>
                    ));
                  }
                  if (value && !isNaN(parseFloat(value))) {
                    const chargeLabels: Record<string, string> = {
                      freightCharge: 'Freight Charge',
                      insurance: 'Insurance',
                      destinationPortHandlingCharge:
                        'Destination Port Handling',
                      dutyPercent: 'Duty (%)',
                      vatPercent: 'VAT (%)',
                      transportationCharge: 'Transportation Charge',
                    };
                    return (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {chargeLabels[key] || key}:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {key.includes('Percent')
                            ? `${value}%`
                            : `$${parseFloat(value).toFixed(2)}`}
                        </span>
                      </div>
                    );
                  }
                  return null;
                }
              )
            )}
          </div>
        </div>
      )}

      {/* Financial Summary */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
          Financial Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${piData.subtotal?.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Additional Charges:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${piData.chargesTotal?.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Advance Amount:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${(piData.advanceAmount || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Total Weight:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {piData.totalWeight} kg
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Total Volume:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {piData.totalVolume || 0} CBM
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Total Boxes:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {piData.totalBoxes || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Total Pallets:
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {piData.totalPallets || 0}
            </span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                Total Amount:
              </span>
              <span className="text-2xl font-bold text-brand-600 dark:text-brand-500">
                {formattedAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Confirmation Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 sm:p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Confirm Order
            </h3>
            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                PI Number:{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {piData.piNumber}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Client:{' '}
                <span className="font-medium text-gray-900 dark:text-white">
                  {piData.party?.companyName}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Total:{' '}
                <span className="font-medium text-brand-600 dark:text-brand-500">
                  {formattedAmount}
                </span>
              </p>
            </div>
            <div className="mb-6">
              {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Have you received payment?
              </label> */}
              <div className="flex gap-6 mb-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentReceived"
                    checked={paymentReceived === true}
                    onChange={() => setPaymentReceived(true)}
                    className="mr-2"
                  />
                  Yes
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentReceived"
                    checked={paymentReceived === false}
                    onChange={() => setPaymentReceived(false)}
                    className="mr-2"
                  />
                  No
                </label>
              </div>

              {paymentReceived === true && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount"
                    className="w-full rounded-lg border border-gray-300 bg-transparent py-2 px-4 outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    required
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <button
                onClick={() => setShowPayment(false)}
                className="rounded-md bg-gray-200 py-2 px-4 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentSubmit}
                disabled={
                  paymentReceived === null ||
                  (paymentReceived === true && !paymentAmount)
                }
                className="rounded-md bg-green-500 py-2 px-4 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {paymentReceived === true ? 'Confirm Payment' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation Overlay */}
      {showConfirmationOverlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={2000}
              gravity={0.3}
            />
          )}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-pulse">
            {/* Close button */}
            <button
              onClick={() => {
                setShowConfirmationOverlay(false);
                setShowConfetti(false);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
            </button>

            {/* Success Icon with Animation */}
            <div className="text-center mb-6">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4 animate-bounce">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                />
                {/* Pulse ring animation */}
                <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
              </div>

              {/* Main heading */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Order Confirmed!
              </h2>

              {/* Subheading */}
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your order has been successfully confirmed
              </p>
            </div>

            {/* Order Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  PI Number:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {piData?.piNumber}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Client:
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {piData?.party?.companyName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Total Amount:
                </span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formattedAmount}
                </span>
              </div>
            </div>

            {/* Success message */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4" />
                {paymentReceived
                  ? 'Payment Confirmed'
                  : 'Order Processing Started'}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-400 rounded-full opacity-40 animate-pulse delay-300"></div>
            <div className="absolute top-1/2 -right-1 w-3 h-3 bg-yellow-400 rounded-full opacity-50 animate-pulse delay-700"></div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      <EmailInvoiceModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        invoiceId={parseInt(id!)}
        defaultEmail={piData?.email || ''}
      />

      {/* Confetti Animation */}
    </div>
  );
};

export default PIDetails;

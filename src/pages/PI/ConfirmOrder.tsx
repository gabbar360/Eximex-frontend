import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import {
  getPiInvoiceById,
  updatePiStatus,
  updatePiAmount,
  updatePiInvoice,
} from '../../features/piSlice';

const ConfirmOrder: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [piData, setPiData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentReceived, setPaymentReceived] = useState<boolean | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

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

  const handleConfirmOrder = async () => {
    try {
      setSubmitting(true);

      if (paymentReceived && paymentAmount) {
        const payment = parseFloat(paymentAmount);
        const currentTotal = piData.totalAmount || piData.total || 0;

        try {
          await dispatch(
            updatePiAmount({
              id,
              amountData: {
                totalAmount: currentTotal,
                advanceAmount: payment,
              },
            })
          ).unwrap();
        } catch {
          try {
            await dispatch(
              updatePiInvoice({
                id,
                piData: {
                  totalAmount: currentTotal,
                  advanceAmount: payment,
                },
              })
            ).unwrap();
          } catch {
            toast.error('Failed to update amount in backend');
          }
        }

        toast.success(
          `Advance payment of $${paymentAmount} recorded successfully`
        );
      } else {
        toast.success('Order confirmed successfully');
      }

      await dispatch(updatePiStatus({ id, status: 'confirmed' })).unwrap();

      // Navigate to success page
      navigate(`/proforma-invoices/${id}/confirmed`, {
        state: {
          piNumber: piData.piNumber,
          companyName: piData.party?.companyName,
          totalAmount: piData.totalAmount || piData.total || 0,
          paymentReceived,
        },
      });
    } catch (error: unknown) {
      console.error('Error confirming order:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to confirm order';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
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

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: piData.currency || 'USD',
  }).format(piData.totalAmount || piData.total || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="w-5 h-5 text-gray-600"
              />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Confirm Order - {piData.piNumber || 'PI Invoice'}
              </h1>
              <p className="text-sm text-gray-500">
                Review and confirm the order details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Order Confirmation
            </h3>
          </div>
          <div className="p-6">
            {/* Order Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  PI Number
                </label>
                <p className="text-gray-900 font-medium">{piData.piNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Client
                </label>
                <p className="text-gray-900 font-medium">
                  {piData.party?.companyName}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Total Amount
                </label>
                <p className="text-xl font-bold text-blue-600">
                  {formattedAmount}
                </p>
              </div>
            </div>

            {/* Payment Options */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Payment Status
              </label>
              <div className="space-y-3 mb-4">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentReceived"
                    checked={paymentReceived === true}
                    onChange={() => setPaymentReceived(true)}
                    className="w-4 h-4 text-blue-600 mr-3"
                  />
                  <span className="text-gray-900 font-medium">
                    Payment Received
                  </span>
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentReceived"
                    checked={paymentReceived === false}
                    onChange={() => setPaymentReceived(false)}
                    className="w-4 h-4 text-blue-600 mr-3"
                  />
                  <span className="text-gray-900 font-medium">No Payment</span>
                </label>
              </div>

              {paymentReceived === true && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter payment amount"
                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmOrder}
                disabled={
                  paymentReceived === null ||
                  (paymentReceived === true && !paymentAmount) ||
                  submitting
                }
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-2" />
                {submitting
                  ? 'Processing...'
                  : paymentReceived === true
                    ? 'Confirm Payment'
                    : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrder;

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faArrowLeft,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

const OrderConfirmed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { piNumber, companyName, totalAmount, paymentReceived } = location.state || {};

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(totalAmount || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/proforma-invoices')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Order Confirmation
              </h1>
              <p className="text-sm text-gray-500">Order has been successfully confirmed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="w-10 h-10 text-green-600"
              />
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Order Confirmed Successfully!
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              Your order has been confirmed and is now being processed.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">PI Number:</span>
                <span className="font-semibold text-gray-900">
                  {piNumber || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Client:</span>
                <span className="font-semibold text-gray-900">
                  {companyName || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-green-600">
                  {formattedAmount}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                  {paymentReceived ? 'Payment Confirmed' : 'Order Processing Started'}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start gap-2">
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Your order is now in the processing queue</span>
              </li>
              <li className="flex items-start gap-2">
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>You will receive email updates on the order status</span>
              </li>
              <li className="flex items-start gap-2">
                <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Production and shipping will begin as per the agreed timeline</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/proforma-invoices')}
              className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Proforma Invoices
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;
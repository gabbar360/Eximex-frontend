import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileInvoice,
  faMoneyBillWave,
  faSave,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import orderService from '../../service/orderService';
import piService from '../../service/piService';
import DatePicker from '../../components/form/DatePicker';

const AddOrder = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [piLoading, setPiLoading] = useState(true);
  const [piList, setPiList] = useState([]);
  const [selectedPI, setSelectedPI] = useState(null);

  const [orderData, setOrderData] = useState({
    piInvoiceId: '',
    advanceAmount: '',
    bookingNumber: '',
    bookingDate: '',
    balanceAmount: '',
    balanceDueDate: '',
    paymentMethod: 'bank_transfer',
    deliveryTerms: '',
    notes: '',
    wayBillNumber: '',
    truckNumber: '',
  });

  useEffect(() => {
    const fetchPIList = async () => {
      try {
        setPiLoading(true);
        const [piResponse, ordersResponse] = await Promise.all([
          piService.getAllPiInvoices(true),
          orderService.getAllOrders(),
        ]);

        const allPIs = piResponse?.piInvoices || [];
        const existingOrders = ordersResponse?.orders || [];

        // Filter out PIs that already have orders
        const availablePIs = allPIs.filter(
          (pi) => !existingOrders.some((order) => order.piInvoiceId === pi.id)
        );

        setPiList(availablePIs);
      } catch (error) {
        console.error('Error fetching PI list:', error);
        toast.error('Failed to load PI invoices');
        setPiList([]);
      } finally {
        setPiLoading(false);
      }
    };
    fetchPIList();
  }, []);

  const handlePISelect = (pi) => {
    setSelectedPI(pi);
    setOrderData((prev) => ({
      ...prev,
      piInvoiceId: pi.id,
      balanceAmount: (pi.totalAmount || 0).toString(),
      deliveryTerms: pi.deliveryTerm || '',
    }));
  };

  const handleInputChange = (field, value) => {
    setOrderData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-calculate balance amount
    if (field === 'advanceAmount' && selectedPI) {
      const advance = parseFloat(value) || 0;
      const balance = selectedPI.totalAmount - advance;
      setOrderData((prev) => ({
        ...prev,
        balanceAmount: balance.toString(),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedPI) {
      toast.error('Please select a PI Invoice');
      return;
    }

    setLoading(true);
    try {
      // Check if order already exists before proceeding
      const existingOrders = await orderService.getAllOrders();
      const orderExists = existingOrders?.orders?.some(
        (order) => order.piInvoiceId === selectedPI.id
      );

      if (orderExists) {
        toast.error('Order already exists for this PI Invoice');
        return;
      }

      // Step 1: Update PI total amount if advance payment is provided
      if (orderData.advanceAmount && parseFloat(orderData.advanceAmount) > 0) {
        const advancePayment = parseFloat(orderData.advanceAmount);
        const currentTotal = selectedPI.totalAmount || 0;
        const updatedTotalAmount = currentTotal - advancePayment;

        console.log('Updating PI total amount:', {
          original: currentTotal,
          advance: advancePayment,
          updated: updatedTotalAmount,
        });

        // Update PI total amount in backend
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:8000'}/api/v1/${selectedPI.id}/update-amount`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
              },
              body: JSON.stringify({
                totalAmount: updatedTotalAmount,
                advanceAmount: advancePayment,
              }),
            }
          );

          if (!response.ok) {
            throw new Error('Failed to update PI amount');
          }

          console.log('PI amount updated successfully');
        } catch (error) {
          console.error('Failed to update PI amount:', error);
          toast.error('Failed to update PI amount');
          return;
        }

        toast.success(
          `Advance payment of $${orderData.advanceAmount} processed successfully`
        );
      }

      console.log('Step 2: Creating order with all details');

      // Step 2: Create order with all form data
      const orderPayload = {
        piInvoiceId: selectedPI.id,
        deliveryTerms: orderData.deliveryTerms || selectedPI.deliveryTerm || '',
        paymentAmount:
          orderData.advanceAmount && orderData.advanceAmount !== ''
            ? parseFloat(orderData.advanceAmount)
            : null,
        bookingNumber:
          orderData.bookingNumber && orderData.bookingNumber !== ''
            ? orderData.bookingNumber
            : null,
        bookingDate:
          orderData.bookingDate && orderData.bookingDate !== ''
            ? orderData.bookingDate
            : null,
        wayBillNumber:
          orderData.wayBillNumber && orderData.wayBillNumber !== ''
            ? orderData.wayBillNumber
            : null,
        truckNumber:
          orderData.truckNumber && orderData.truckNumber !== ''
            ? orderData.truckNumber
            : null,
      };

      // Remove null values to avoid validation issues
      Object.keys(orderPayload).forEach((key) => {
        if (orderPayload[key] === null || orderPayload[key] === '') {
          delete orderPayload[key];
        }
      });

      console.log('Order payload:', orderPayload);

      // Create the order with all details
      const result = await orderService.createOrder(orderPayload);
      console.log('Order created successfully:', result);

      toast.success(result.message);
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      if (error.response?.data?.message?.includes('Order already exists')) {
        toast.error(
          'This PI Invoice already has an order. Please select a different PI.'
        );
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Add Order | EximEx Dashboard" />
      <PageBreadCrumb pageTitle="Add Order" />

      <div className="max-w-4xl mx-auto px-3 sm:px-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Add New Order
          </h1>
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm sm:text-base"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            <span className="hidden sm:inline">Back to Orders</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* PI Selection Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <FontAwesomeIcon
                icon={faFileInvoice}
                className="text-blue-600 dark:text-blue-400 flex-shrink-0"
              />
              <span className="truncate">Select Proforma Invoice</span>
            </h2>

            {/* PI Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select PI Invoice *
              </label>
              <select
                value={selectedPI?.id || ''}
                onChange={(e) => {
                  const selectedId = parseInt(e.target.value);
                  const selected = piList.find((pi) => pi.id === selectedId);
                  if (selected) handlePISelect(selected);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Choose a PI Invoice...</option>
                {piLoading ? (
                  <option disabled>Loading PI invoices...</option>
                ) : Array.isArray(piList) && piList.length > 0 ? (
                  piList.map((pi) => (
                    <option key={pi.id} value={pi.id}>
                      {pi.piNumber || pi.invoiceNumber} -{' '}
                      {pi.party?.companyName || pi.customerName} - $
                      {(pi.totalAmount || 0).toLocaleString()}
                    </option>
                  ))
                ) : (
                  <option disabled>No PI invoices available</option>
                )}
              </select>
            </div>

            {/* Selected PI Details */}
            {selectedPI && (
              <div className="mt-4 p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-2 text-sm sm:text-base">
                  Selected PI:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      PI Number:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {selectedPI.piNumber || selectedPI.invoiceNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Company:
                    </span>
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {selectedPI.party?.companyName || selectedPI.customerName}
                    </p>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Amount:
                    </span>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      ${(selectedPI.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Details Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="text-green-600 dark:text-green-400 flex-shrink-0"
              />
              <span className="truncate">Order & Payment Details</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Advance Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Advance Amount (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={selectedPI?.totalAmount || 0}
                  value={orderData.advanceAmount}
                  onChange={(e) =>
                    handleInputChange('advanceAmount', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter advance amount"
                />
                {selectedPI &&
                  orderData.advanceAmount &&
                  parseFloat(orderData.advanceAmount) > 0 && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      This amount will be deducted from PI total
                    </p>
                  )}
              </div>

              {/* Booking Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Booking Number (Optional)
                </label>
                <input
                  type="text"
                  value={orderData.bookingNumber}
                  onChange={(e) =>
                    handleInputChange('bookingNumber', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter booking number"
                />
              </div>

              {/* Booking Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Booking Date (Optional)
                </label>
                <DatePicker
                  value={orderData.bookingDate}
                  onChange={(value) => handleInputChange('bookingDate', value)}
                  placeholder="Select booking date"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Balance Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Balance Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={orderData.balanceAmount}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                  placeholder="Auto-calculated"
                  readOnly
                />
                {selectedPI &&
                  orderData.advanceAmount &&
                  parseFloat(orderData.advanceAmount) > 0 && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Remaining balance after advance payment
                    </p>
                  )}
              </div>

              {/* Balance Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Balance Due Date
                </label>
                <DatePicker
                  value={orderData.balanceDueDate}
                  onChange={(value) =>
                    handleInputChange('balanceDueDate', value)
                  }
                  placeholder="Select balance due date"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  value={orderData.paymentMethod}
                  onChange={(e) =>
                    handleInputChange('paymentMethod', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="letter_of_credit">Letter of Credit</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>

              {/* Delivery Terms */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Terms
                </label>
                <input
                  type="text"
                  value={orderData.deliveryTerms}
                  onChange={(e) =>
                    handleInputChange('deliveryTerms', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter delivery terms"
                />
              </div>

              {/* Way Bill Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Way Bill Number
                </label>
                <input
                  type="text"
                  value={orderData.wayBillNumber}
                  onChange={(e) =>
                    handleInputChange('wayBillNumber', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter way bill number"
                />
              </div>

              {/* Truck Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Truck Number
                </label>
                <input
                  type="text"
                  value={orderData.truckNumber}
                  onChange={(e) =>
                    handleInputChange('truckNumber', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter truck number"
                />
              </div>

              {/* Notes */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={orderData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Additional notes or comments..."
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="px-4 sm:px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedPI}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors order-1 sm:order-2"
            >
              {loading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <FontAwesomeIcon icon={faSave} />
              )}
              {loading ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddOrder;

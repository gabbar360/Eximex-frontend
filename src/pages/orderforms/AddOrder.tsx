import { useDispatch, useSelector } from 'react-redux';
import { fetchPiInvoices, updatePiAmount } from '../../features/piSlice';
import { fetchOrders, createOrder } from '../../features/orderSlice';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiDocumentText,
  HiCurrencyDollar,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';

import DatePicker from '../../components/form/DatePicker';

const AddOrder = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [piLoading, setPiLoading] = useState(true);
  const [piList, setPiList] = useState([]);
  const [selectedPI, setSelectedPI] = useState(null);

  const [orderData, setOrderData] = useState({
    piInvoiceId: '',
    advanceAmount: '',
    balanceAmount: '',
  });

  useEffect(() => {
    const fetchPIList = async () => {
      try {
        setPiLoading(true);
        const [piResponse, ordersResponse] = await Promise.all([
          dispatch(fetchPiInvoices()).unwrap(),
          dispatch(fetchOrders()).unwrap(),
        ]);

        console.log('PI Response:', piResponse);
        console.log('Orders Response:', ordersResponse);

        const allPIs =
          piResponse?.data?.piInvoices || piResponse?.piInvoices || [];
        const existingOrders =
          ordersResponse?.data?.orders || ordersResponse?.orders || [];

        console.log('All PIs:', allPIs);
        console.log('Existing Orders:', existingOrders);

        // Filter for pending PIs that don't have orders
        const availablePIs = allPIs.filter(
          (pi) =>
            pi.status === 'pending' &&
            !existingOrders.some((order) => order.piInvoiceId === pi.id)
        );

        console.log('Available PIs:', availablePIs);
        setPiList(availablePIs);
      } catch (error) {
        console.error('Error fetching PI list:', error);
        toast.error(error || 'Failed to load PI invoices');
        setPiList([]);
      } finally {
        setPiLoading(false);
      }
    };
    fetchPIList();
  }, [dispatch]);

  const handlePISelect = (pi) => {
    setSelectedPI(pi);
    setOrderData((prev) => ({
      ...prev,
      piInvoiceId: pi.id,
      balanceAmount: (pi.totalAmount || 0).toString(),
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
      const existingOrders = await dispatch(fetchOrders()).unwrap();
      const orderExists = existingOrders?.orders?.some(
        (order) => order.piInvoiceId === selectedPI.id
      );

      if (orderExists) {
        toast.error('Order already exists for this PI Invoice');
        return;
      }

      console.log('Step 1: Creating order with all details');

      // Step 1: Create order first
      const orderPayload = {
        piInvoiceId: selectedPI.id,
        paymentAmount:
          orderData.advanceAmount && orderData.advanceAmount !== ''
            ? parseFloat(orderData.advanceAmount)
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
      const result = await dispatch(createOrder(orderPayload)).unwrap();
      console.log('Order created successfully:', result);

      // Step 2: Update PI total amount if advance payment is provided
      if (orderData.advanceAmount && parseFloat(orderData.advanceAmount) > 0) {
        const advancePayment = parseFloat(orderData.advanceAmount);
        const currentTotal = selectedPI.totalAmount || 0;
        const updatedTotalAmount = currentTotal - advancePayment;

        console.log('Updating PI total amount:', {
          original: currentTotal,
          advance: advancePayment,
          updated: updatedTotalAmount,
        });

        // Update PI total amount in backend using Redux
        try {
          await dispatch(
            updatePiAmount({
              id: selectedPI.id,
              amountData: {
                totalAmount: updatedTotalAmount,
                advanceAmount: advancePayment,
              },
            })
          ).unwrap();
          console.log('PI amount updated successfully');
        } catch (error) {
          console.error('Failed to update PI amount:', error);
          toast.error(error || 'Failed to update PI amount');
          return;
        }

        toast.success(
          `Advance payment of $${orderData.advanceAmount} processed successfully`
        );
      }

      toast.success(result.message);
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-3 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-300 text-slate-600 hover:text-slate-800"
            >
              <HiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Add New Order
              </h1>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* PI Selection Section */}
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-700 mb-6 flex items-center gap-3">
                  <HiDocumentText className="w-6 h-6 text-slate-600" />
                  Select Proforma Invoice
                </h3>

                {/* PI Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select PI Invoice *
                  </label>
                  <select
                    value={selectedPI?.id || ''}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value);
                      const selected = piList.find(
                        (pi) => pi.id === selectedId
                      );
                      if (selected) handlePISelect(selected);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
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
                  <div className="mt-6 p-4 bg-slate-100 border border-slate-300 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-3">
                      Selected PI:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">PI Number:</span>
                        <p className="font-medium text-slate-800">
                          {selectedPI.piNumber || selectedPI.invoiceNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600">Company:</span>
                        <p className="font-medium text-slate-800">
                          {selectedPI.party?.companyName ||
                            selectedPI.customerName}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600">Total Amount:</span>
                        <p className="font-medium text-slate-800">
                          ${(selectedPI.totalAmount || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Details Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-slate-700 border-b border-slate-200 pb-3 flex items-center gap-3">
                  <HiCurrencyDollar className="w-6 h-6 text-slate-600" />
                  Order & Payment Details
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Advance Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Advance Amount
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300"
                      placeholder="Enter advance amount"
                    />
                    {selectedPI &&
                      orderData.advanceAmount &&
                      parseFloat(orderData.advanceAmount) > 0 && (
                        <p className="text-xs text-slate-600 mt-1">
                          This amount will be deducted from PI total
                        </p>
                      )}
                  </div>

                  {/* Balance Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Balance Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={orderData.balanceAmount}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-slate-700"
                      placeholder="Auto-calculated"
                      readOnly
                    />
                    {selectedPI &&
                      orderData.advanceAmount &&
                      parseFloat(orderData.advanceAmount) > 0 && (
                        <p className="text-xs text-slate-600 mt-1">
                          Remaining balance after advance payment
                        </p>
                      )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedPI}
                  className="px-6 py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      <HiCheckCircle className="w-5 h-5 mr-2 inline" />
                      Create Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrder;

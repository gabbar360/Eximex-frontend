import { useDispatch, useSelector } from 'react-redux';
import { fetchPiInvoices, updatePiAmount } from '../../features/piSlice';
import { fetchOrders, createOrder } from '../../features/orderSlice';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCheckCircle,
  HiDocumentText,
  HiCurrencyDollar,
  HiChevronDown,
  HiMagnifyingGlass,
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

  // Dropdown states
  const [piSearch, setPiSearch] = useState('');
  const [showPiDropdown, setShowPiDropdown] = useState(false);
  const piRef = useRef(null);

  // Custom Dropdown Component
  const SearchableDropdown = ({
    label,
    value,
    options,
    onSelect,
    searchValue,
    onSearchChange,
    isOpen,
    onToggle,
    placeholder,
    disabled = false,
    dropdownRef,
    displayKey = 'name',
    valueKey = 'id',
  }) => {
    const selectedOption = options.find((opt) => opt[valueKey]?.toString() === value?.toString());

    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className={`w-full px-4 py-3 border border-gray-300 bg-white rounded-lg cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed'
              : 'hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500'
          }`}
          onClick={() => !disabled && onToggle()}
        >
          <span
            className={`text-sm ${selectedOption ? 'text-slate-900' : 'text-slate-500'}`}
          >
            {selectedOption ? selectedOption[displayKey] : placeholder}
          </span>
          <HiChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {isOpen && !disabled && (
          <div
            className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-xl"
            style={{ top: '100%', marginTop: '4px' }}
          >
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-slate-500 text-sm text-center">
                  No {label.toLowerCase()} found
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option[valueKey]}
                    className={`px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm transition-colors duration-150 ${
                      option[valueKey]?.toString() === value?.toString()
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700'
                    }`}
                    onClick={() => {
                      onSelect(option[valueKey]);
                      onToggle();
                    }}
                  >
                    {option[displayKey]}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (piRef.current && !piRef.current.contains(event.target)) {
        setShowPiDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/orders')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    Add New Order
                  </h1>
                </div>
              </div>
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
                  <SearchableDropdown
                    label="PI Invoice"
                    value={selectedPI?.id || ''}
                    options={piList
                      .filter((pi) => {
                        const searchText = `${pi.piNumber || pi.invoiceNumber} ${pi.party?.companyName || pi.customerName}`;
                        return searchText
                          .toLowerCase()
                          .includes(piSearch.toLowerCase());
                      })
                      .map((pi) => ({
                        id: pi.id,
                        name: `${pi.piNumber || pi.invoiceNumber} - ${pi.party?.companyName || pi.customerName} - $${(pi.totalAmount || 0).toLocaleString()}`,
                      }))}
                    onSelect={(piId) => {
                      const selected = piList.find((pi) => pi.id === piId);
                      if (selected) {
                        handlePISelect(selected);
                        setPiSearch('');
                      }
                    }}
                    searchValue={piSearch}
                    onSearchChange={setPiSearch}
                    isOpen={showPiDropdown}
                    onToggle={() => setShowPiDropdown(!showPiDropdown)}
                    placeholder={piLoading ? "Loading PI invoices..." : piList.length === 0 ? "No PI invoices available" : "Choose a PI Invoice..."}
                    disabled={piLoading || piList.length === 0}
                    dropdownRef={piRef}
                  />
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

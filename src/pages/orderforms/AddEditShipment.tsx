import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiCheckCircle, HiArrowLeft } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { getOrderById } from '../../features/orderSlice';
import {
  createShipment,
  updateShipment,
  getShipmentByOrderId,
} from '../../features/shipmentSlice';
import OrderSelector from '../../components/order/OrderSelector';
import DatePicker from '../../components/form/DatePicker';

const AddEditShipment = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shipmentData, setShipmentData] = useState({
    bookingNumber: '',
    bookingDate: '',
    vesselVoyageInfo: '',
    wayBillNumber: '',
    truckNumber: '',
    blNumber: '',
  });
  const [isEdit, setIsEdit] = useState(false);
  const [shipmentId, setShipmentId] = useState(null);

  useEffect(() => {
    if (id && id !== 'create') {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleOrderSelect = (orderId, orderData) => {
    setSelectedOrder(orderData);
    setOrderData(orderData);
  };

  const fetchOrderDetails = async () => {
    if (!id || id === 'create') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const orderResponse = await dispatch(getOrderById(id)).unwrap();
      const order = orderResponse.data;

      setOrderData(order);

      // Try to fetch existing shipment
      try {
        const shipmentResponse = await dispatch(
          getShipmentByOrderId(id)
        ).unwrap();
        if (shipmentResponse.data) {
          const shipment = shipmentResponse.data;
          setIsEdit(true);
          setShipmentId(shipment.id);
          setShipmentData({
            bookingNumber: shipment.bookingNumber || '',
            bookingDate: shipment.bookingDate
              ? new Date(shipment.bookingDate).toISOString().split('T')[0]
              : '',
            vesselVoyageInfo: shipment.vesselVoyageInfo || '',
            wayBillNumber: shipment.wayBillNumber || '',
            truckNumber: shipment.truckNumber || '',
            blNumber: shipment.blNumber || '',
          });
        }
      } catch (shipmentError) {
        // No existing shipment found, that's okay
        console.log('No existing shipment found');
      }
    } catch (error) {
      toast.error('Failed to fetch order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShipmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const submitData = {
        ...shipmentData,
        bookingDate: shipmentData.bookingDate
          ? new Date(shipmentData.bookingDate)
          : null,
      };

      let result;
      if (isEdit) {
        result = await dispatch(
          updateShipment({ shipmentId, shipmentData: submitData })
        ).unwrap();
      } else {
        const orderId = id || selectedOrder?.id;
        if (!orderId) {
          toast.error('Please select an order');
          return;
        }
        result = await dispatch(
          createShipment({ ...submitData, orderId: parseInt(orderId) })
        ).unwrap();
      }

      toast.success(result.message);

      // Delay navigation to show toast
      setTimeout(() => {
        navigate('/orders/shipments');
      }, 1500);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to save shipment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-3">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/orders/shipments')}
                  className="p-3 rounded-lg bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 hover:shadow-lg"
                >
                  <HiArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
                    {isEdit ? 'Edit Shipment' : 'Create Shipment'}
                  </h1>
                  {orderData && (
                    <p className="text-slate-600 mt-1">
                      Order: {orderData.orderNumber} | PI: {orderData.piNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-xl border border-slate-200">
          <div className="p-4 sm:p-6 lg:p-8">
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Order Selection for new shipments */}
              {!isEdit && (
                <div className="bg-slate-50 p-4 sm:p-6 rounded-lg border border-slate-200">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-700 mb-3 sm:mb-4">
                    Select Order
                  </h3>
                  <div className="w-full">
                    <OrderSelector
                      selectedOrderId={selectedOrder?.id || null}
                      onOrderSelect={handleOrderSelect}
                      placeholder="Select Order for Shipment"
                      filterType="shipment"
                    />
                  </div>
                </div>
              )}

              {/* Shipment Details */}
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold text-slate-700 border-b border-slate-200 pb-2 sm:pb-3">
                  Shipment Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                      Booking Number
                    </label>
                    <input
                      type="text"
                      name="bookingNumber"
                      value={shipmentData.bookingNumber}
                      onChange={handleInputChange}
                      placeholder="Enter booking number"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                      Booking Date
                    </label>
                    <DatePicker
                      value={shipmentData.bookingDate}
                      onChange={(value) =>
                        setShipmentData((prev) => ({
                          ...prev,
                          bookingDate: value,
                        }))
                      }
                      placeholder="Select booking date"
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all duration-300 text-sm sm:text-base w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                      Way Bill Number
                    </label>
                    <input
                      type="text"
                      name="wayBillNumber"
                      value={shipmentData.wayBillNumber}
                      onChange={handleInputChange}
                      placeholder="Enter way bill number"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                      Truck Number
                    </label>
                    <input
                      type="text"
                      name="truckNumber"
                      value={shipmentData.truckNumber}
                      onChange={handleInputChange}
                      placeholder="Enter truck number"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                      BL Number
                    </label>
                    <input
                      type="text"
                      name="blNumber"
                      value={shipmentData.blNumber}
                      onChange={handleInputChange}
                      placeholder="Enter BL number"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 sm:mb-3">
                      Vessel/Voyage Info
                    </label>
                    <input
                      type="text"
                      name="vesselVoyageInfo"
                      value={shipmentData.vesselVoyageInfo}
                      onChange={handleInputChange}
                      placeholder="Enter vessel/voyage info"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-slate-200 focus:border-slate-500 transition-all duration-300 shadow-sm text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/orders/shipments')}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800 transition-all duration-300 hover:shadow-xl disabled:opacity-50 shadow-lg text-sm sm:text-base"
                >
                  {saving ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="hidden sm:inline">
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </span>
                      <span className="sm:hidden">
                        {isEdit ? 'Updating' : 'Creating'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <HiCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 inline" />
                      <span className="hidden sm:inline">
                        {isEdit ? 'Update Shipment' : 'Create Shipment'}
                      </span>
                      <span className="sm:hidden">
                        {isEdit ? 'Update' : 'Create'}
                      </span>
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

export default AddEditShipment;

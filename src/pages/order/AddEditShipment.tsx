import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { getOrderById } from '../../features/orderSlice';
import { createShipment, updateShipment, getShipmentByOrderId } from '../../features/shipmentSlice';

import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import InputField from '../../components/form/input/InputField';

import Label from '../../components/form/Label';
import DatePicker from '../../components/form/DatePicker';

const AddEditShipment = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [shipmentData, setShipmentData] = useState({
    bookingNumber: '',
    bookingDate: '',
    vesselVoyageInfo: '',
    wayBillNumber: '',
    truckNumber: '',
    blNumber: ''
  });
  const [isEdit, setIsEdit] = useState(false);
  const [shipmentId, setShipmentId] = useState(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const orderResponse = await dispatch(getOrderById(id)).unwrap();
      const order = orderResponse.data;
      
      setOrderData(order);
      
      // Try to fetch existing shipment
      try {
        const shipmentResponse = await dispatch(getShipmentByOrderId(id)).unwrap();
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
            blNumber: shipment.blNumber || ''
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
        bookingDate: shipmentData.bookingDate ? new Date(shipmentData.bookingDate) : null
      };

      let result;
      if (isEdit) {
        result = await dispatch(updateShipment({ shipmentId, shipmentData: submitData })).unwrap();
      } else {
        result = await dispatch(createShipment({ ...submitData, orderId: parseInt(id) })).unwrap();
      }
      
      toast.success(result.message);

      // Delay navigation to show toast
      setTimeout(() => {
        navigate('/orders');
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
    <div className="p-3 sm:p-6">
      <PageBreadCrumb pageTitle={isEdit ? "Edit Shipment" : "Add Shipment"} />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex-shrink-0"
            >
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {isEdit ? "Edit Shipment" : "Add Shipment"}
            </h2>
            {orderData && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Order: {orderData.orderNumber} | PI: {orderData.piNumber}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Booking Number */}
                <div>
                  <Label>Booking Number</Label>
                  <InputField
                    type="text"
                    name="bookingNumber"
                    value={shipmentData.bookingNumber}
                    onChange={handleInputChange}
                    placeholder="Enter booking number"
                  />
                </div>

                {/* Booking Date */}
                <div>
                  <Label>Booking Date</Label>
                  <DatePicker
                    value={shipmentData.bookingDate}
                    onChange={(value) =>
                      setShipmentData((prev) => ({ ...prev, bookingDate: value }))
                    }
                    placeholder="Select booking date"
                    className="px-4 py-2.5 text-sm shadow-sm"
                  />
                </div>

                {/* Way Bill Number */}
                <div>
                  <Label>Way Bill Number</Label>
                  <InputField
                    type="text"
                    name="wayBillNumber"
                    value={shipmentData.wayBillNumber}
                    onChange={handleInputChange}
                    placeholder="Enter way bill number"
                  />
                </div>

                {/* Truck Number */}
                <div>
                  <Label>Truck Number</Label>
                  <InputField
                    type="text"
                    name="truckNumber"
                    value={shipmentData.truckNumber}
                    onChange={handleInputChange}
                    placeholder="Enter truck number"
                  />
                </div>

                {/* BL Number */}
                <div>
                  <Label>BL Number</Label>
                  <InputField
                    type="text"
                    name="blNumber"
                    value={shipmentData.blNumber}
                    onChange={handleInputChange}
                    placeholder="Enter BL number"
                  />
                </div>

                {/* Vessel/Voyage Info */}
                <div>
                  <Label>Vessel/Voyage Info</Label>
                  <InputField
                    type="text"
                    name="vesselVoyageInfo"
                    value={shipmentData.vesselVoyageInfo}
                    onChange={handleInputChange}
                    placeholder="e.g., MSC FLORA/123456"
                  />
                </div>

              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 sm:mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/orders')}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  <FontAwesomeIcon icon={faSave} />
                  {saving ? 'Saving...' : (isEdit ? 'Update Shipment' : 'Create Shipment')}
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

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSave } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import orderService from '../../service/orderService';
import PageBreadCrumb from '../../components/common/PageBreadCrumb';
import InputField from '../../components/form/input/InputField';
import Select from '../../components/form/Select';
import Label from '../../components/form/Label';
import DatePicker from '../../components/form/DatePicker';

const EditOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderData, setOrderData] = useState({
    orderStatus: 'pending',
    paymentStatus: 'pending',
    deliveryTerms: '',
    bookingNumber: '',
    bookingDate: '',
    wayBillNumber: '',
    truckNumber: '',
  });

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrderById(id);
      const order = response;

      setOrderData({
        orderStatus: order.orderStatus || 'pending',
        paymentStatus: order.paymentStatus || 'pending',
        deliveryTerms: order.deliveryTerms || '',
        bookingNumber: order.bookingNumber || '',
        bookingDate: order.bookingDate
          ? new Date(order.bookingDate).toISOString().split('T')[0]
          : '',
        wayBillNumber: order.wayBillNumber || '',
        truckNumber: order.truckNumber || '',
      });
    } catch (error) {
      toast.error('Failed to fetch order details');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);

      const updateData = {
        orderStatus: orderData.orderStatus,
        paymentStatus: orderData.paymentStatus,
        deliveryTerms: orderData.deliveryTerms,
        bookingNumber: orderData.bookingNumber || null,
        bookingDate: orderData.bookingDate
          ? new Date(orderData.bookingDate)
          : null,
        wayBillNumber: orderData.wayBillNumber || null,
        truckNumber: orderData.truckNumber || null,
      };

      const result = await orderService.updateOrder(id, updateData);
      console.log('Update response:', result);
      toast.success(result.message);

      // Delay navigation to show toast
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message);
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
      <PageBreadCrumb pageTitle="Edit Order" />

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
              Edit Order
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Order Status */}
                <div>
                  <Label>Order Status</Label>
                  <Select
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'confirmed', label: 'Confirmed' },
                      { value: 'processing', label: 'Processing' },
                      { value: 'shipped', label: 'Shipped' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    defaultValue={orderData.orderStatus}
                    onChange={(value) =>
                      setOrderData((prev) => ({ ...prev, orderStatus: value }))
                    }
                    placeholder="Select Order Status"
                  />
                </div>

                {/* Payment Status */}
                <div>
                  <Label>Payment Status</Label>
                  <Select
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'partial', label: 'Partial' },
                      { value: 'paid', label: 'Paid' },
                      { value: 'overdue', label: 'Overdue' },
                    ]}
                    defaultValue={orderData.paymentStatus}
                    onChange={(value) =>
                      setOrderData((prev) => ({
                        ...prev,
                        paymentStatus: value,
                      }))
                    }
                    placeholder="Select Payment Status"
                  />
                </div>

                {/* Delivery Terms */}
                <div>
                  <Label>Delivery Terms</Label>
                  <Select
                    options={[
                      { value: 'fob', label: 'FOB' },
                      { value: 'cif', label: 'CIF' },
                      { value: 'ddp', label: 'DDP' },
                    ]}
                    defaultValue={orderData.deliveryTerms}
                    onChange={(value) =>
                      setOrderData((prev) => ({
                        ...prev,
                        deliveryTerms: value,
                      }))
                    }
                    placeholder="Select Delivery Terms"
                  />
                </div>

                {/* Booking Number */}
                <div>
                  <Label>Booking Number</Label>
                  <InputField
                    type="text"
                    name="bookingNumber"
                    value={orderData.bookingNumber}
                    onChange={handleInputChange}
                    placeholder="Enter booking number"
                  />
                </div>

                {/* Booking Date */}
                <div>
                  <Label>Booking Date</Label>
                  <DatePicker
                    value={orderData.bookingDate}
                    onChange={(value) =>
                      setOrderData((prev) => ({ ...prev, bookingDate: value }))
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
                    value={orderData.wayBillNumber}
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
                    value={orderData.truckNumber}
                    onChange={handleInputChange}
                    placeholder="Enter truck number"
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
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrder;

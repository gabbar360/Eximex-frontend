import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchOrders } from '../../features/orderSlice';

interface Order {
  id: number;
  orderNumber: string;
  piNumber: string;
  buyerName: string;
  status: string;
}

interface OrderSelectorProps {
  selectedOrderId: number | null;
  onOrderSelect: (orderId: number, orderData: Order) => void;
  placeholder?: string;
  filterType?: 'vgm' | 'shipment' | 'packingList';
}

const OrderSelector: React.FC<OrderSelectorProps> = ({
  selectedOrderId,
  onOrderSelect,
  placeholder = 'Select Order',
  filterType,
}) => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await dispatch(fetchOrders()).unwrap();
      let ordersList =
        response?.data?.orders ||
        response?.orders ||
        response?.data ||
        response ||
        [];

      if (Array.isArray(ordersList) && filterType) {
        ordersList = ordersList.filter((order) => {
          switch (filterType) {
            case 'vgm':
              return (
                !order.piInvoice?.vgmDocuments ||
                order.piInvoice.vgmDocuments.length === 0
              );
            case 'shipment':
              // Show orders that don't have any shipment details
              return (
                !order.shipment ||
                (!order.shipment.bookingNumber &&
                  !order.shipment.bookingDate &&
                  !order.shipment.vesselVoyageInfo &&
                  !order.shipment.wayBillNumber &&
                  !order.shipment.truckNumber)
              );
            case 'packingList':
              // Show orders that don't have packing lists created
              const hasPackingList =
                (order.packingList &&
                  Object.keys(order.packingList).length > 0 &&
                  order.packingList.containers &&
                  order.packingList.containers.length > 0) ||
                (order.piInvoice?.packingLists &&
                  order.piInvoice.packingLists.length > 0 &&
                  order.piInvoice.packingLists[0]?.notes?.containers &&
                  order.piInvoice.packingLists[0].notes.containers.length > 0);
              return !hasPackingList;
            default:
              return true;
          }
        });
      }

      setOrders(Array.isArray(ordersList) ? ordersList : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orderId = parseInt(e.target.value);
    const selectedOrder = orders.find((order) => order.id === orderId);
    if (selectedOrder) {
      onOrderSelect(orderId, selectedOrder);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Order *
      </label>
      <select
        value={selectedOrderId || ''}
        onChange={handleOrderChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">{loading ? 'Loading...' : placeholder}</option>
        {Array.isArray(orders) &&
          orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.orderNumber} - {order.piNumber} ({order.buyerName})
            </option>
          ))}
      </select>
    </div>
  );
};

export default OrderSelector;

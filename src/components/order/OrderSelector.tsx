import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { fetchOrders } from '../../features/orderSlice';
import { HiChevronDown, HiMagnifyingGlass } from 'react-icons/hi2';

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

  // Dropdown states
  const [orderSearch, setOrderSearch] = useState('');
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);
  const orderRef = useRef(null);

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
    const selectedOption = options.find(
      (opt) => opt[valueKey]?.toString() === value?.toString()
    );

    return (
      <div className="relative w-full" ref={dropdownRef}>
        <div
          className={`w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 bg-white rounded-md cursor-pointer flex items-center justify-between transition-all duration-300 shadow-sm text-sm sm:text-base ${
            disabled
              ? 'bg-gray-100 cursor-not-allowed'
              : 'hover:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-500'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled) {
              onToggle();
            }
          }}
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
          <div className="absolute z-[9999] w-full min-w-[280px] sm:min-w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1">
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${label.toLowerCase()}...`}
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 min-w-0"
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-48 sm:max-h-60 overflow-y-auto">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-slate-500 text-sm text-center">
                  No {label.toLowerCase()} found
                </div>
              ) : (
                options.map((option) => (
                  <div
                    key={option[valueKey]}
                    className={`px-3 sm:px-4 py-2 sm:py-3 hover:bg-slate-50 cursor-pointer text-xs sm:text-sm transition-colors duration-150 break-words ${
                      option[valueKey]?.toString() === value?.toString()
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-700'
                    }`}
                    onClick={() => {
                      onSelect(option[valueKey]);
                      onToggle();
                    }}
                  >
                    <div className="truncate">{option[displayKey]}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await dispatch(fetchOrders()).unwrap();
      let ordersList =
        response?.data?.orders ||
        response?.orders ||
        response?.data ||
        response ||
        [];

      console.log('Filter type:', filterType);

      if (Array.isArray(ordersList) && filterType) {
        ordersList = ordersList.filter((order) => {
          switch (filterType) {
            case 'vgm': {
              const hasVgm = order.piInvoice?.vgmDocuments && order.piInvoice.vgmDocuments.length > 0;
              return !hasVgm;
            }
            case 'shipment': {
              const hasShipment = order.shipment && (order.shipment.bookingNumber || order.shipment.bookingDate || order.shipment.vesselVoyageInfo || order.shipment.wayBillNumber || order.shipment.truckNumber);
              return !hasShipment;
            }
            case 'packingList': {
              const hasPackingListArray = order.packingLists && order.packingLists.length > 0;
              const hasPackingListId = order.packingListId;
              const hasPiPackingLists = order.piInvoice?.packingLists && order.piInvoice.packingLists.length > 0;
              const hasPackingList = hasPackingListArray || hasPackingListId || hasPiPackingLists;
              return !hasPackingList;
            }
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
  }, [dispatch, filterType]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (orderRef.current && !orderRef.current.contains(event.target)) {
        setShowOrderDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={orderRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Select Order *
      </label>
      <SearchableDropdown
        label="Order"
        value={selectedOrderId || ''}
        options={(() => {
          const filteredOptions = orders
            .filter((order) => {
              const buyerName =
                order.piInvoice?.party?.companyName ||
                order.piInvoice?.party?.contactPerson ||
                'Unknown Buyer';
              const searchText = `${order.orderNumber} ${order.piNumber} ${buyerName}`;
              return searchText
                .toLowerCase()
                .includes(orderSearch.toLowerCase());
            })
            .map((order) => {
              const buyerName =
                order.piInvoice?.party?.companyName ||
                order.piInvoice?.party?.contactPerson ||
                'Unknown Buyer';
              return {
                id: order.id,
                name: `${order.orderNumber} - ${order.piNumber} (${buyerName})`,
              };
            });
          return filteredOptions;
        })()}
        onSelect={(orderId) => {
          const selectedOrder = orders.find((order) => order.id === orderId);
          if (selectedOrder) {
            onOrderSelect(orderId, selectedOrder);
            setOrderSearch('');
          }
        }}
        searchValue={orderSearch}
        onSearchChange={setOrderSearch}
        isOpen={showOrderDropdown}
        onToggle={() => setShowOrderDropdown(!showOrderDropdown)}
        placeholder={loading ? 'Loading...' : placeholder}
        disabled={loading}
        dropdownRef={orderRef}
      />
    </div>
  );
};

export default OrderSelector;

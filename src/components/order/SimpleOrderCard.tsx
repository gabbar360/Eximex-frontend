import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarAlt,
  faBuilding,
  faFileAlt,
  faEye,
  faTrash,
  faShip,
  faList,
  faBalanceScale,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';

interface SimpleOrderCardProps {
  order: Record<string, unknown>;
  onDelete: (id: string) => void;
}

const SimpleOrderCard: React.FC<SimpleOrderCardProps> = ({
  order,
  onDelete,
}) => {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Pending',
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        label: 'Confirmed',
      },
      processing: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        label: 'In-Production',
      },
      shipped: {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        label: 'Shipped',
      },
      delivered: {
        color: 'bg-green-100 text-green-800 border-green-200',
        label: 'Delivered',
      },
      cancelled: {
        color: 'bg-red-100 text-red-800 border-red-200',
        label: 'Cancelled',
      },
    };
    return (
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const orderStatus = getStatusBadge(order.orderStatus || 'pending');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 p-4 mb-4">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg flex-shrink-0">
            <FontAwesomeIcon
              icon={faFileAlt}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white truncate">
              #{order.orderNumber}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-xs" />
              <span>{formatDate(order.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xl font-bold text-gray-800 dark:text-white">
            ${order.totalAmount?.toLocaleString() || '0'}
          </div>
          <span
            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${orderStatus.color} mt-1`}
          >
            {orderStatus.label}
          </span>
        </div>
      </div>

      {/* Company Info */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <FontAwesomeIcon icon={faBuilding} className="text-white text-xs" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-800 dark:text-white truncate">
            {order.piInvoice?.party?.companyName || 'Company Name'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {order.piInvoice?.party?.country || 'Location'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <Link
          to={`/orders/shipments`}
          className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-center"
        >
          <FontAwesomeIcon
            icon={faShip}
            className="text-blue-600 dark:text-blue-400 text-sm"
          />
          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            Shipment
          </span>
        </Link>

        <Link
          to={`/orders/packing-lists`}
          className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/30 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors text-center"
        >
          <FontAwesomeIcon
            icon={faList}
            className="text-green-600 dark:text-green-400 text-sm"
          />
          <span className="text-sm text-green-700 dark:text-green-300 font-medium">
            Packing
          </span>
        </Link>

        <Link
          to={`/orders/vgm`}
          className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors text-center"
        >
          <FontAwesomeIcon
            icon={faBalanceScale}
            className="text-purple-600 dark:text-purple-400 text-sm"
          />
          <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">
            VGM
          </span>
        </Link>

        <Link
          to={`/orders/reports`}
          className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors text-center"
        >
          <FontAwesomeIcon
            icon={faDownload}
            className="text-orange-600 dark:text-orange-400 text-sm"
          />
          <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
            Reports
          </span>
        </Link>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex gap-2">
          {order.piInvoiceId && (
            <Link
              to={`/pi-details/${order.piInvoiceId}`}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm flex items-center gap-1"
            >
              <FontAwesomeIcon icon={faEye} className="text-xs" />
              View PI
            </Link>
          )}
        </div>

        <button
          onClick={() => onDelete(order.id)}
          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <FontAwesomeIcon icon={faTrash} className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default SimpleOrderCard;

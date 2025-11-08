import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  UserIcon, 
  ExclamationTriangleIcon, 
  DocumentTextIcon,
  CurrencyDollarIcon,
  BellIcon,
  UserPlusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const NotificationItem = ({ notification, onMarkAsRead }) => {
  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5";
    
    switch (type) {
      case 'USER_ACTIVITY':
        return <UserIcon className={iconClass} />;
      case 'SYSTEM_ALERT':
        return <ExclamationTriangleIcon className={iconClass} />;
      case 'ORDER_UPDATE':
        return <DocumentTextIcon className={iconClass} />;
      case 'PAYMENT_REMINDER':
        return <CurrencyDollarIcon className={iconClass} />;
      case 'PI_STATUS_CHANGE':
        return <DocumentTextIcon className={iconClass} />;
      case 'NEW_USER_REGISTRATION':
        return <UserPlusIcon className={iconClass} />;
      case 'LOGIN_ACTIVITY':
        return <ArrowRightOnRectangleIcon className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 bg-red-50';
      case 'HIGH':
        return 'text-orange-600 bg-orange-50';
      case 'MEDIUM':
        return 'text-blue-600 bg-blue-50';
      case 'LOW':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
        !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-500' : ''
      }`}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className={`flex-shrink-0 p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.title}
              </p>
              <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                {notification.message}
              </p>
              
              {/* Metadata */}
              {notification.creator && (
                <p className="text-xs text-gray-500 mt-1">
                  by {notification.creator.name}
                </p>
              )}
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
              <div className="flex-shrink-0 ml-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <p className="text-xs text-gray-400 mt-2">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </p>

          {/* Priority badge for urgent/high priority */}
          {(notification.priority === 'URGENT' || notification.priority === 'HIGH') && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${
              notification.priority === 'URGENT' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-orange-100 text-orange-800'
            }`}>
              {notification.priority}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface UserAvatarProps {
  user?: {
    name?: string;
    email?: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showEmail?: boolean;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showName = false,
  showEmail = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-shrink-0">
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600`}
        >
          <FontAwesomeIcon
            icon={faUser}
            className={`text-gray-500 dark:text-gray-400 ${
              size === 'sm'
                ? 'text-xs'
                : size === 'md'
                  ? 'text-sm'
                  : 'text-base'
            }`}
          />
        </div>
      </div>
      {(showName || showEmail) && (
        <div className="flex-1 min-w-0">
          {showName && (
            <p
              className={`font-medium text-gray-900 dark:text-white truncate ${textSizeClasses[size]}`}
            >
              {user?.name || 'Guest User'}
            </p>
          )}
          {showEmail && (
            <p
              className={`text-gray-500 dark:text-gray-400 truncate ${size === 'sm' ? 'text-xs' : 'text-xs'}`}
            >
              {user?.email || 'guest@example.com'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UserAvatar;

import React from 'react';
import { Outlet } from 'react-router-dom';

const OrderLayout: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Outlet />
    </div>
  );
};

export default OrderLayout;
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.user);
  const user = useSelector((state) => state.user.user);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }



  return <Outlet />;
};

export default ProtectedRoute;

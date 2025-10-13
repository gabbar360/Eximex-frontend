import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.user);

  if (isLoading) {
    // You can return a loader here
    return <div>Loading...</div>;
  }

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default PublicRoute;

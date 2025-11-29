import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { HiOfficeBuilding } from 'react-icons/hi';

const OnboardingModal: React.FC = () => {
  const user = useSelector((state: any) => state.user.user);

  // Redirect SUPER_ADMIN to dashboard
  if (user?.role?.name === 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-4">
          <HiOfficeBuilding className="w-16 h-16 text-blue-500 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome to Eximex
        </h2>
        <p className="text-gray-600 mb-6">
          Please wait while your administrator assigns you to a company. You will be able to access the dashboard once your company is assigned.
        </p>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Waiting for company assignment...</span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

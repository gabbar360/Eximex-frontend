import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import CompanySetupForm from '../components/CompanySetupForm';
import CompanySetupSlider from '../components/CompanySetupSlider';

const OnboardingModal: React.FC = () => {
  const user = useSelector((state: any) => state.user.user);

  // Redirect SUPER_ADMIN to dashboard
  if (user?.role?.name === 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div
      className="h-screen overflow-hidden"
      style={{ backgroundColor: '#86a0b2' }}
    >
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left Side - Form */}
        <div className="w-full lg:w-[60%] flex flex-col p-2 lg:p-4 min-h-0">
          {/* <div className="text-center mb-2 lg:mb-3 flex-shrink-0">
            <h1 className="text-lg lg:text-2xl font-bold text-white mb-1">
              Welcome to Eximex
            </h1>
            <p className="text-white/90 text-xs lg:text-sm font-medium">
              Let's set up your company profile
            </p>
          </div> */}

          <div className="flex-1 min-h-0">
            <CompanySetupForm />
          </div>
        </div>

        {/* Right Side - Slider */}
        <div className="hidden lg:block w-[40%]">
          <CompanySetupSlider />
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

import React from 'react';
import CompanySetupForm from '../components/CompanySetupForm';
import CompanySetupSlider from '../components/CompanySetupSlider';

const OnboardingModal: React.FC = () => {

  return (
    <div className="h-screen overflow-hidden" style={{backgroundColor: '#86a0b2'}}>
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left Side - Form */}
        <div className="w-full lg:w-[60%] flex items-center justify-center p-2 sm:p-3 lg:p-4">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-2 sm:mb-3">
              {/* <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl shadow-lg mb-2">
                <img 
                  src="/sidelogo3.png" 
                  alt="Eximex" 
                  className="h-5 sm:h-6 lg:h-8 w-auto object-contain"
                />
              </div> */}
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Welcome to Eximex
              </h1>
              <p className="text-white/90 text-sm font-medium">
                Let's set up your company profile
              </p>
            </div>
            
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

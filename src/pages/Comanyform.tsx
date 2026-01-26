import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';
import { HiClock, HiArrowLeft } from 'react-icons/hi2';
import { clearUser } from '../features/userSlice';

const OnboardingModal: React.FC = () => {
  const user = useSelector((state: Record<string, unknown>) => (state.user as { user: Record<string, unknown> }).user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redirect SUPER_ADMIN to dashboard
  if ((user as { role?: { name: string } })?.role?.name === 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSignOut = () => {
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // Clear user state
    dispatch(clearUser());

    // Navigate to signin
    navigate('/signin', { replace: true });
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="w-full max-w-lg p-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Welcome to Eximex
          </h1>
          <p className="text-slate-600">Your account is being set up</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
          <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-amber-500 flex items-center justify-center">
            <HiClock className="text-white text-xl" />
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-4">
            Company Assignment Pending
          </h2>

          <p className="text-slate-600 mb-6 leading-relaxed">
            Please wait while your administrator assigns you to a company. You
            will be able to access the dashboard once your company is assigned.
          </p>

          <div className="flex items-center justify-center space-x-2 text-slate-500 mb-6">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
            <span className="text-sm font-medium">
              Waiting for assignment...
            </span>
          </div>

          {/* Back to Sign In Button */}
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            <HiArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign In
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Need help? Contact your administrator for assistance.
          </p>
          <p className="text-xs text-slate-400 mt-4">
            &copy; {new Date().getFullYear()} Eximex. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;

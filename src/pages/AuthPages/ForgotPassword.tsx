import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../features/authSlice';
import AuthLayout from './AuthPageLayout';
import PageMeta from '../../components/common/PageMeta';
import AuthSlider from '../../components/auth/AuthSlider';

const ForgotPassword: React.FC = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      const response = await dispatch(forgotPassword(email)).unwrap();
      toast.success(
        response.message || 'Password reset link sent to your email address'
      );
      setOtpSent(true);
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (otpSent) {
    return (
      <>
        <PageMeta
          title="Check Your Email | Eximex - Password Reset"
          description="Password reset link sent to your email"
        />
        <AuthLayout>
          <div className="auth-form-container w-full max-w-sm sm:max-w-md mx-auto px-4 mobile-form-container min-h-screen flex items-center justify-center">
            <div className="auth-form-card bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:bg-gray-900/95 dark:border-gray-700/30 text-center w-full">
              <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg
                  className="h-6 w-6 sm:h-8 sm:w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                Check Your Email
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-300">
                  📧 Check your email and click the reset link to set a new password.
                </p>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                The link will expire in 10 minutes. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => setOtpSent(false)}
                className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-semibold transition-colors"
              >
                ← Try Different Email
              </button>
            </div>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Forgot Password | Eximex - Reset Your Password"
        description="Reset your Eximex account password securely"
      />
      <AuthLayout>
        <div className="auth-form-container w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-screen mobile-form-container">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-16 xl:gap-32 items-center lg:items-center justify-center min-h-screen py-6 sm:py-8 lg:py-12">
            {/* Left Side - Slider - Only on laptop screens */}
            <div className="hidden lg:block w-full">
              <AuthSlider />
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto lg:mx-0 order-first lg:order-last">
              {/* Form Card */}
              <div className="auth-form-card bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-full">
                {/* Header */}
                <div className="bg-white p-4 sm:p-6 border-b-2" style={{borderColor: '#86a0b2'}}>
                  <div className="text-center">
                    <img 
                      src="/logo1.png" 
                      alt="Eximex" 
                      className="h-10 sm:h-12 mx-auto mb-3 sm:mb-4"
                    />
                    <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mb-3 sm:mb-4" style={{backgroundColor: '#86a0b2'}}>
                      <svg
                        className="h-6 w-6 sm:h-8 sm:w-8 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold mb-1" style={{color: '#86a0b2'}}>Forgot Password?</h2>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Enter your email address and we'll send you a secure reset link
                    </p>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-4 sm:p-6">

                  <form onSubmit={handleSubmit} className="auth-form-fields space-y-4">
                    <div className="auth-form-field form-field-spacing">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Business Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        className="auth-form-input w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !email}
                      className="auth-form-button w-full bg-gray-300 text-gray-900 font-bold py-2.5 sm:py-3 rounded-lg hover:bg-gray-500 disabled:opacity-50 transition-all duration-200 disabled:cursor-not-allowed mb-4 text-sm"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending Reset Link...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>

                    <div className="text-center">
                      <Link
                        to="/signin"
                        className="font-semibold text-xs sm:text-sm" style={{color: '#86a0b2'}}
                      >
                        ← Back to Sign In
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    </>
  );
};

export default ForgotPassword;

import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword } from '../../features/authSlice';
import AuthLayout from './AuthPageLayout';
import PageMeta from '../../components/common/PageMeta';

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
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:bg-gray-900/95 dark:border-gray-700/30 text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="h-8 w-8 text-green-600"
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Check Your Email
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  📧 Check your email and click the reset link to set a new password.
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                The link will expire in 10 minutes. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => setOtpSent(false)}
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
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
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 xl:gap-32 items-center min-h-screen py-4 sm:py-8 lg:py-0">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex flex-col items-center justify-center text-white text-center">
              <div className="mb-8">
                <img 
                  src="/sidelogo3.png" 
                  alt="Eximex" 
                  className="h-40 mb-2 mx-auto"
                />
                <h1 className="text-5xl font-bold mb-6 leading-tight">
                  Secure Account
                  <span className="block text-blue-300">Recovery</span>
                </h1>
                <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                  Don't worry! It happens to the best of us. Enter your email and we'll send you a secure link to reset your password.
                </p>
              </div>
              
              {/* Security Features */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-100">Secure Password Reset</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-100">Email Verification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-100">Account Protection</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-blue-100">Quick Recovery Process</span>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md mx-auto lg:mx-0 order-first lg:order-last">
              {/* Mobile Header */}
              <div className="lg:hidden text-center mb-6 sm:mb-8">
                <img 
                  src="/logo.png" 
                  alt="Eximex" 
                  className="h-12 mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
                <p className="text-blue-200">Recover your account access</p>
              </div>

              {/* Form Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl p-3 xs:p-4 sm:p-6 lg:p-8 border border-white/20 dark:bg-gray-900/95 dark:border-gray-700/30">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="h-8 w-8 text-blue-600"
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
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter your email address and we'll send you a secure reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Business Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      className="w-full px-3 sm:px-4 py-3 sm:py-3.5 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !email}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] mb-3 sm:mb-4 text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending Reset Link...
                      </div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      to="/signin"
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      ← Back to Sign In
                    </Link>
                  </div>
                </form>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 text-center">
                <div className="flex items-center justify-center gap-4 text-xs text-white/70">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Secure Process
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Email Verified
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Quick Recovery
                  </span>
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

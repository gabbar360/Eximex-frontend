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
  const [errors, setErrors] = useState({ email: '' });

  const validateForm = () => {
    const newErrors = { email: '' };
    
    if (!email.trim()) {
      newErrors.email = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return !newErrors.email;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!validateForm()) {
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
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="w-full max-w-sm">
                {/* Success Card */}
                <div className="auth-form-card bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden w-full">
                  {/* Header */}
                  <div className="bg-white p-2 sm:p-3 lg:p-4">
                    <div className="text-center">
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 text-black">
                        Check Your Email
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-2 sm:p-3 lg:p-4">
                    <div className="text-center space-y-3 sm:space-y-4">
                      <p className="text-xs sm:text-sm text-black">
                        We've sent a password reset link to <strong>{email}</strong>
                      </p>
                      
                      <div className="bg-gray-100 border border-black rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-black">
                          📧 Check your email and click the reset link to set a new password.
                        </p>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-black">
                        The link will expire in 10 minutes. Check your spam folder if you don't see it.
                      </p>
                    </div>

                    <button
                      onClick={() => setOtpSent(false)}
                      className="w-full bg-black hover:bg-gray-950 text-white font-bold py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 mt-4 text-xs sm:text-sm"
                    >
                      ← Try Different Email
                    </button>
                  </div>
                </div>
              </div>
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="w-full max-w-sm">
              {/* Form Card */}
              <div className="auth-form-card bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden w-full">
                {/* Header */}
                <div
                  className="bg-white p-2 sm:p-3 lg:p-4"
                >
                  <div className="text-center">
                    <h2
                      className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 text-black"
                    >
                      Forgot Password?
                    </h2>
                    <p className="text-black text-xs sm:text-sm">
                      Enter your email address and we'll send you a secure reset
                      link
                    </p>
                  </div>
                </div>

                {/* Form Content */}
                <div className="p-2 sm:p-3 lg:p-4">
                  <div className="auth-form-fields space-y-2 sm:space-y-3">
                    <div className="auth-form-field form-field-spacing">
                      <label className="block text-xs sm:text-sm font-semibold text-black mb-2">
                        Business Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="Enter your registered email"
                        className={`auth-form-input w-full px-3 py-2 sm:py-2.5 border-2 ${errors.email ? 'border-red-500' : 'border-black'} rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-black transition-all duration-200 text-xs sm:text-sm text-gray-900 placeholder-black`}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleSubmit()}
                      disabled={isLoading}
                      className="auth-form-button w-full bg-black hover:bg-gray-950 text-white font-bold py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed mb-3 sm:mb-4 text-xs sm:text-sm"
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
                        className="font-semibold text-xs sm:text-sm text-black"
                      >
                        ← Back to Sign In
                      </Link>
                    </div>
                  </div>
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

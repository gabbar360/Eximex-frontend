import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../features/authSlice';
import { toast } from 'react-toastify';
import { HiEye, HiEyeOff } from 'react-icons/hi';

const ResetPassword: React.FC = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      // Don't set as valid immediately, let the backend validate
      validateToken(tokenFromUrl);
    } else {
      setIsValidToken(false);
    }
  }, [searchParams]);

  const validateToken = async (tokenToValidate) => {
    try {
      // You can add a token validation API call here if needed
      // For now, we'll assume token is valid and let the reset call handle validation
      setIsValidToken(true);
    } catch (error) {
      setIsValidToken(false);
      // Remove static toast, let backend handle error messages
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = { newPassword: '', confirmPassword: '' };
    
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
        formData.newPassword
      )
    ) {
      newErrors.newPassword = 'Must include uppercase, lowercase, number, and special character';
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return !newErrors.newPassword && !newErrors.confirmPassword;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await dispatch(
        resetPassword({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        })
      ).unwrap();

      toast.success(response.message || 'Password reset successfully!');

      // Redirect to sign in page after successful reset
      setTimeout(() => {
        navigate('/signin', {
          state: {
            message:
              'Password reset successfully! Please sign in with your new password.',
          },
        });
      }, 2000);
    } catch (error: any) {
      // Handle backend error response
      const errorMessage = error.message || error || 'Failed to reset password';
      toast.error(errorMessage);
      
      // Check if token is invalid/expired based on backend response
      if (errorMessage.includes('Invalid or expired') || errorMessage.includes('expired reset token')) {
        setIsValidToken(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="w-full max-w-sm">
            <div className="auth-form-card bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden w-full">
              <div className="bg-white p-2 sm:p-3 lg:p-4">
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 text-black">
                    Invalid Reset Link
                  </h2>
                </div>
              </div>
              <div className="p-2 sm:p-3 lg:p-4">
                <div className="text-center space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm text-black">
                    This password reset link is invalid or has expired.
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="w-full bg-black hover:bg-gray-950 text-white font-bold py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 mt-4 text-xs sm:text-sm flex justify-center"
                >
                  Request New Reset Link
                </Link>
                <div className="text-center mt-3">
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
    );
  }

  if (isValidToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="w-full max-w-sm">
          {/* Form Card */}
          <div className="auth-form-card bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden w-full">
            {/* Header */}
            <div className="bg-white p-2 sm:p-3 lg:p-4">
              <div className="text-center">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 text-black">
                  Set New Password
                </h2>
                <p className="text-black text-xs sm:text-sm">
                  Enter your new password below
                </p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-2 sm:p-3 lg:p-4">
              <div className="auth-form-fields space-y-2 sm:space-y-3">
                <div className="auth-form-field form-field-spacing">
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Enter new password"
                      className={`auth-form-input w-full px-3 py-2 sm:py-2.5 pr-10 border-2 ${errors.newPassword ? 'border-red-500' : 'border-black'} rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-black transition-all duration-200 text-xs sm:text-sm text-gray-900 placeholder-black`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 transition-colors z-10 p-1"
                    >
                      {showPassword ? (
                        <HiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <HiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                  )}
                  <p className="text-black text-xs mt-1">
                    Must include uppercase, lowercase, number, and special character
                  </p>
                </div>

                <div className="auth-form-field form-field-spacing">
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        handleInputChange(e);
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                      placeholder="Confirm new password"
                      className={`auth-form-input w-full px-3 py-2 sm:py-2.5 pr-10 border-2 ${errors.confirmPassword ? 'border-red-500' : 'border-black'} rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-black transition-all duration-200 text-xs sm:text-sm text-gray-900 placeholder-black`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-black hover:text-gray-700 transition-colors z-10 p-1"
                    >
                      {showConfirmPassword ? (
                        <HiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <HiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleSubmit()}
                disabled={isLoading}
                className="auth-form-button w-full bg-black hover:bg-gray-950 text-white font-bold py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed mb-3 sm:mb-4 text-xs sm:text-sm mt-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Setting Password...
                  </div>
                ) : (
                  'Set New Password'
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
  );
};

export default ResetPassword;

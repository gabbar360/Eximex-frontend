import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch } from 'react-redux';
import { loginUser, googleLogin } from '../../features/authSlice';
import { setUser } from '../../features/userSlice';
import { toast } from 'react-toastify';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    const newErrors = { email: '', password: '' };
    
    if (!email.trim()) {
      newErrors.email = 'Business email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      const data = await dispatch(loginUser({ email, password })).unwrap();
      toast.success(data.message);

      // Set user data in Redux store
      if (data.data?.user) {
        dispatch(setUser(data.data.user));
      }

      // Check if user has company details
      const user = data.data?.user;
      if (user && (!user.company || !user.companyId)) {
        // No company details, redirect to company form
        navigate('/company-setup');
      } else {
        // Has company details, redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="w-full max-w-sm">
          {/* Form Card */}
          <div className="auth-form-card bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-full">
            {/* Header */}
            <div
              className="bg-white p-2 sm:p-3 lg:p-4"
            >
              <div className="text-center">
                <h2
                  className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 text-black"
                >
                  Sign In
                </h2>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-2 sm:p-3 lg:p-4">
              {/* Google Sign-In */}
              {/* <button
                onClick={() => dispatch(googleLogin())}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 sm:py-3 border-2 border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 mb-3 group"
              >
                <FcGoogle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Continue with Google
              </button> */}

              {/* Divider */}
              {/* <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-gray-500 font-medium">
                    Or sign in with email
                  </span>
                </div>
              </div> */}

              {/* Form Fields */}
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
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter your business email"
                    className={`auth-form-input w-full px-3 py-2 sm:py-2.5 border-2 ${errors.email ? 'border-red-500' : 'border-black'} rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-black transition-all duration-200 text-xs sm:text-sm text-gray-900 placeholder-black`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div className="auth-form-field form-field-spacing">
                  <label className="block text-xs sm:text-sm font-semibold text-black mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="Enter your password"
                      className={`auth-form-input w-full px-3 py-2 sm:py-2.5 pr-10 border-2 ${errors.password ? 'border-red-500' : 'border-black'} rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-black transition-all duration-200 text-xs sm:text-sm text-gray-900 placeholder-black`}
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
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end mt-2 mb-3 sm:mt-3 sm:mb-4">
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-black"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleLogin}
                disabled={isSubmitting}
                className="auth-form-button w-full bg-black hover:bg-gray-950 text-white font-bold py-2 sm:py-2.5 rounded-lg hover:shadow-lg transition-all duration-200 disabled:cursor-not-allowed mb-3 sm:mb-4 text-xs sm:text-sm"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>

              {/* Sign Up Link */}
              {/* <div className="text-center">
                <p className="text-gray-600 text-xs sm:text-sm">
                  New to Eximex?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold"
                    style={{ color: '#86a0b2' }}
                  >
                    Create Business Account
                  </Link>
                </p>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

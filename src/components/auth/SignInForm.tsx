import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import { useDispatch } from 'react-redux';
import { loginUser, googleLogin } from '../../features/authSlice';
import { setUser } from '../../features/userSlice';
import { toast } from 'react-toastify';
import AuthSlider from './AuthSlider';

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

 const handleLogin = async () => {
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
                <h2 className="text-lg sm:text-xl font-bold mb-1" style={{color: '#86a0b2'}}>Welcome Back</h2>
                <p className="text-gray-600 text-xs sm:text-sm">Sign in to your trading account</p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6">

              {/* Google Sign-In */}
              <button
                onClick={() => dispatch(googleLogin())}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200 mb-4 group"
              >
                <FcGoogle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Continue with Google
              </button>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-gray-500 font-medium">
                    Or sign in with email
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="auth-form-fields space-y-4">
                <div className="auth-form-field form-field-spacing">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter your business email"
                    className="auth-form-input w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                  />
                </div>

                <div className="auth-form-field form-field-spacing">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      placeholder="Enter your password"
                      className="auth-form-input w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1"
                    >
                      {showPassword ? <HiEye className="w-4 h-4 sm:w-5 sm:h-5" /> : <HiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end mt-4 mb-6">
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-semibold" style={{color: '#86a0b2'}}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleLogin}
                disabled={isSubmitting || !email || !password}
                className="auth-form-button w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-2.5 sm:py-3 rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 disabled:cursor-not-allowed mb-6 text-sm"
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
              <div className="text-center">
                <p className="text-gray-600 text-xs sm:text-sm">
                  New to Eximex?{' '}
                  <Link
                    to="/signup"
                    className="font-semibold" style={{color: '#86a0b2'}}
                  >
                    Create Business Account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

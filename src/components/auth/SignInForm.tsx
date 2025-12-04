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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      {/* Left Side - Video */}
      <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <video
          autoPlay
          loop
          muted
          playsInline
          volume={0}
          className="w-full h-full object-cover"
        >
          <source src="/Exim-ex_video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        

      </div>

      {/* Right Side - Sign In Form */}
      <div className="w-full lg:w-1/3 min-h-screen flex flex-col bg-[#1B2129]">
        {/* Big Animated Eyes Only */}
        <div className="flex items-center justify-center pt-8">
          <div className="text-center">
            <div className="relative mb-4">
              {/* Professional Eyes */}
              <div className="flex items-center justify-center space-x-8">
                {/* Left Eye */}
                <div className="relative w-16 h-16">
                  {/* Eye Base */}
                  <div className="w-16 h-16 bg-white rounded-full shadow-2xl border-4 border-gray-200 relative overflow-hidden">
                    <div className="w-12 h-12 bg-gray-800 rounded-full mt-2 ml-2 relative">
                      <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full"></div>
                      <div className="absolute bottom-1 left-2 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    </div>
                    
                    {/* Upper Eyelid */}
                    <div className={`absolute top-0 left-0 w-full bg-gray-300 rounded-t-full transition-all duration-800 ease-in-out ${
                      password ? 'h-8 shadow-inner' : 'h-0'
                    }`}></div>
                    
                    {/* Lower Eyelid */}
                    <div className={`absolute bottom-0 left-0 w-full bg-gray-300 rounded-b-full transition-all duration-800 ease-in-out ${
                      password ? 'h-8 shadow-inner' : 'h-0'
                    }`}></div>
                  </div>
                </div>
                
                {/* Right Eye */}
                <div className="relative w-16 h-16">
                  {/* Eye Base */}
                  <div className="w-16 h-16 bg-white rounded-full shadow-2xl border-4 border-gray-200 relative overflow-hidden">
                    <div className="w-12 h-12 bg-gray-800 rounded-full mt-2 ml-2 relative">
                      <div className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full"></div>
                      <div className="absolute bottom-1 left-2 w-2 h-2 bg-white rounded-full opacity-60"></div>
                    </div>
                    
                    {/* Upper Eyelid */}
                    <div className={`absolute top-0 left-0 w-full bg-gray-300 rounded-t-full transition-all duration-800 ease-in-out ${
                      password ? 'h-8 shadow-inner' : 'h-0'
                    }`}></div>
                    
                    {/* Lower Eyelid */}
                    <div className={`absolute bottom-0 left-0 w-full bg-gray-300 rounded-b-full transition-all duration-800 ease-in-out ${
                      password ? 'h-8 shadow-inner' : 'h-0'
                    }`}></div>
                  </div>
                </div>
              </div>
              
              {/* Simple Status */}
              <div className="mt-6">
                <p className="text-white text-sm">
                  {password ? 'Privacy Mode' : 'Ready to Sign In'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Form Container */}
        <div className="px-6 pb-6 mt-12">
          <div className="w-full max-w-sm mx-auto">
            {/* Form Card */}
            <div className="auth-form-card bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-full">
              {/* Header */}
              <div
                className="bg-white p-2 sm:p-3 lg:p-4 border-b-2"
                style={{ borderColor: '#86a0b2' }}
              >
                <div className="text-center">
                  <h2
                    className="text-sm sm:text-lg lg:text-xl font-bold mb-1"
                    style={{ color: '#86a0b2' }}
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
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Business Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter your business email"
                    className="auth-form-input w-full px-3 py-2 sm:py-2.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs sm:text-sm"
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
                      className="auth-form-input w-full px-3 py-2 sm:py-2.5 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1"
                    >
                      {showPassword ? (
                        <HiEye className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <HiEyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end mt-2 mb-3 sm:mt-3 sm:mb-4">
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm font-semibold"
                  style={{ color: '#86a0b2' }}
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleLogin}
                disabled={isSubmitting || !email || !password}
                className="auth-form-button w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-2 sm:py-2.5 rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 disabled:cursor-not-allowed mb-3 sm:mb-4 text-xs sm:text-sm"
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
              {/* Mobile Video Preview */}
              <div className="lg:hidden mb-6">
                <div className="relative rounded-xl overflow-hidden">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-32 object-cover"
                  >
                    <source src="/Exim-ex_video.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <p className="text-white font-semibold text-sm">EximEx Trading Platform</p>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

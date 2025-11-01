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
    <div className="w-full max-w-5xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-32 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-white text-center">
          <div className="mb-4">
            <img 
              src="/sidelogo3.png" 
              alt="Eximex" 
              className="h-40 mb-2 mx-auto"
            />
            <h1 className="text-3xl font-bold mb-2 leading-tight">
              Global Trade
              <span className="block text-blue-300">Made Simple</span>
            </h1>
            <p className="text-base text-blue-100 mb-4 leading-relaxed">
              Connect with verified suppliers and buyers worldwide.
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300 mb-1">50K+</div>
              <div className="text-xs text-blue-100">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300 mb-1">180+</div>
              <div className="text-xs text-blue-100">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-300 mb-1">$2B+</div>
              <div className="text-xs text-blue-100">Trade Volume</div>
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-blue-100">Verified Supplier Network</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-blue-100">Secure Payment Gateway</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-blue-100">Real-time Shipment Tracking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-blue-100">Trade Finance Solutions</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="/logo.png" 
              alt="Eximex" 
              className="h-12 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-blue-200">Sign in to your trading account</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 dark:bg-gray-900/95 dark:border-gray-700/30">
            <div className="hidden lg:block text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign In</h2>
              <p className="text-gray-600 dark:text-gray-300">Access your trading dashboard</p>
            </div>

            {/* Google Sign-In */}
            <button
              onClick={() => dispatch(googleLogin())}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 mb-6 group"
            >
              <FcGoogle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Or sign in with email
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Business Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter your business email"
                  className="w-full px-4 py-3.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3.5 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10 p-1"
                  >
                    {showPassword ? <HiEye className="w-5 h-5" /> : <HiEyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end mt-4 mb-6">
              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              onClick={handleLogin}
              disabled={isSubmitting || !email || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] mb-6"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-300">
                New to Eximex?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create Business Account
                </Link>
              </p>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                SSL Secured
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                ISO Certified
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../features/authSlice';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import AuthSlider from './AuthSlider';

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const initialValues = {
    name: '',
    mobileNum: '',
    email: '',
    password: '',
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    mobileNum: Yup.string()
      .matches(/^[0-9]{10}$/, 'Mobile number must be 10 digits')
      .required('Mobile number is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
  });

const handleSubmit = async (
    values,
    { setSubmitting, setFieldError, setStatus }
  ) => {
    try {
      setStatus(null);
      const response = await dispatch(registerUser(values)).unwrap();
      toast.success(response.message || 'Registration successful');
      navigate('/signin');
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-full">
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 xl:gap-32 items-center h-full py-4 sm:py-8 lg:py-0">
        {/* Left Side - Slider */}
        <AuthSlider />

        {/* Right Side - Form */}
        <div className="w-full max-w-xs xs:max-w-sm sm:max-w-md mx-auto lg:mx-0 order-first lg:order-last">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-6 sm:mb-8">
            <img 
              src="/logo.png" 
              alt="Eximex" 
              className="h-12 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-blue-200">Join the global trade network</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl p-3 xs:p-4 sm:p-6 border border-white/20 dark:bg-gray-900/95 dark:border-gray-700/30">
            <div className="hidden lg:block text-center mb-4 sm:mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create Business Account</h2>
              <p className="text-gray-600 dark:text-gray-300">Start trading globally today</p>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status }) => (
                <Form className="space-y-2 sm:space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Business Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Enter your business email"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Mobile Number
                    </label>
                    <Field
                      name="mobileNum"
                      type="text"
                      placeholder="Enter 10-digit mobile number"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
                    />
                    <ErrorMessage
                      name="mobileNum"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 transition-all duration-200 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10 p-1"
                      >
                        {showPassword ? <HiEye className="w-5 h-5" /> : <HiEyeOff className="w-5 h-5" />}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="text-sm text-red-500 mt-1"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-2.5 sm:py-3 rounded-lg sm:rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] mb-2 sm:mb-3 text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Business Account'
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-300">
                      Already have an account?{' '}
                      <Link
                        to="/signin"
                        className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          {/* Trust Indicators */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-white/70">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Free Registration
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Instant Verification
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                No Hidden Fees
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
                  className="h-12 sm:h-16 lg:h-20 mx-auto mb-3 sm:mb-4"
                />
                <h2 className="text-lg sm:text-xl font-bold mb-1" style={{color: '#86a0b2'}}>Create Business Account</h2>
                <p className="text-gray-600 text-xs sm:text-sm">Join the global trade network</p>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-4 sm:p-6">

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status }) => (
                <Form className="auth-form-fields space-y-4">
                  <div className="auth-form-field form-field-spacing">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="auth-form-input w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="auth-error-message text-xs text-red-500 mt-1 min-h-[16px] error-spacing"
                    />
                  </div>

                  <div className="auth-form-field form-field-spacing">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Business Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Enter your business email"
                      className="auth-form-input w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="auth-error-message text-xs text-red-500 mt-1 min-h-[16px] error-spacing"
                    />
                  </div>

                  <div className="auth-form-field form-field-spacing">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <Field
                      name="mobileNum"
                      type="text"
                      placeholder="Enter 10-digit mobile number"
                      className="auth-form-input w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                    />
                    <ErrorMessage
                      name="mobileNum"
                      component="div"
                      className="auth-error-message text-xs text-red-500 mt-1 min-h-[16px] error-spacing"
                    />
                  </div>

                  <div className="auth-form-field form-field-spacing">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
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
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="auth-error-message text-xs text-red-500 mt-1 min-h-[16px] error-spacing"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="auth-form-button w-full bg-gray-300 text-gray-900 font-bold py-2.5 sm:py-3 rounded-lg hover:bg-gray-500 disabled:opacity-50 transition-all duration-200 disabled:cursor-not-allowed mb-4 text-sm mt-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Business Account'
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-gray-600 text-xs sm:text-sm">
                      Already have an account?{' '}
                      <Link
                        to="/signin"
                        className="font-semibold" style={{color: '#86a0b2'}}
                      >
                        Sign In
                      </Link>
                    </p>
                  </div>
                </Form>
              )}
            </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

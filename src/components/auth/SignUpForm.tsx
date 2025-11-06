import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { registerUser } from '../../features/authSlice';
import { EyeCloseIcon, EyeIcon } from '../../icons';
import { HiEye, HiEyeOff } from 'react-icons/hi';

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
    <div className="h-screen w-screen flex overflow-hidden">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-800"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/80 to-teal-900/80"></div>
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-6">Join Eximex Today</h1>
          <p className="text-xl mb-8 opacity-90">Start your journey in global trade with our comprehensive platform</p>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Free account setup</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Instant market access</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <div className="w-full max-w-sm">
          {/* Form Card */}
          <div className="auth-form-card bg-white/95 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl border border-white/20 overflow-hidden w-full">
            {/* Header */}
            <div className="bg-white p-2 sm:p-3 border-b-2" style={{borderColor: '#86a0b2'}}>
              <div className="text-center">
                <img 
                  src="/logo1.png" 
                  alt="Eximex" 
                  className="h-10 sm:h-14 lg:h-16 mx-auto mb-1 sm:mb-2"
                />
                <h2 className="text-xs sm:text-base lg:text-lg font-bold mb-1" style={{color: '#86a0b2'}}>Create Business Account</h2>
                {/* <p className="text-gray-600 text-xs">Join the global trade network</p> */}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-3 sm:p-4">

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status }) => (
                <Form className="auth-form-fields space-y-3">
                  <div className="auth-form-field">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name
                    </label>
                    <Field
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      className="auth-form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                    />
                    <ErrorMessage
                      name="name"
                      component="div"
                      className="auth-error-message text-xs text-red-500 mt-1 min-h-[14px]"
                    />
                  </div>

                  <div className="auth-form-field">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Business Email
                    </label>
                    <Field
                      name="email"
                      type="email"
                      placeholder="Enter your business email"
                      className="auth-form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                    />
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="auth-error-message text-xs text-red-500 mt-1 min-h-[14px]"
                    />
                  </div>

                  <div className="auth-form-field">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mobile Number
                    </label>
                    <Field
                      name="mobileNum"
                      type="text"
                      placeholder="Enter 10-digit mobile number"
                      className="auth-form-input w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                    />
                    <ErrorMessage
                      name="mobileNum"
                      component="div"
                      className="auth-error-message text-xs text-red-500 mt-1 min-h-[14px]"
                    />
                  </div>

                  <div className="auth-form-field">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        className="auth-form-input w-full px-3 py-2 pr-10 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1"
                      >
                        {showPassword ? <HiEye className="w-4 h-4" /> : <HiEyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="auth-error-message text-xs text-red-500 mt-1 min-h-[14px]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="auth-form-button w-full bg-gray-300 text-gray-900 font-bold py-2 rounded-lg hover:bg-gray-500 disabled:opacity-50 transition-all duration-200 disabled:cursor-not-allowed mb-3 text-sm mt-1"
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
                    <p className="text-gray-600 text-xs">
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

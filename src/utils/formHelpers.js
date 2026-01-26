/**
 * Form helper utilities for consistent form handling across the application
 */

/**
 * Formats form data for API submission
 * @param {Object} values - Form values from Formik
 * @param {Object} options - Options for formatting
 * @returns {Object} - Formatted data ready for API submission
 */
export const formatFormData = (values, options = {}) => {
  const {
    stringArrayFields = [],
    trimFields = true,
    capitalizeFields = [],
  } = options;

  const formattedData = { ...values };

  // Process string array fields (comma-separated strings to arrays)
  stringArrayFields.forEach((field) => {
    if (typeof formattedData[field] === 'string') {
      formattedData[field] = formattedData[field]
        .split(',')
        .map((item) => (trimFields ? item.trim() : item))
        .filter(Boolean);
    }
  });

  // Trim string fields if requested
  if (trimFields) {
    Object.keys(formattedData).forEach((key) => {
      if (typeof formattedData[key] === 'string') {
        formattedData[key] = formattedData[key].trim();
      }
    });
  }

  // Capitalize specified fields
  capitalizeFields.forEach((field) => {
    if (typeof formattedData[field] === 'string' && formattedData[field]) {
      formattedData[field] =
        formattedData[field].charAt(0).toUpperCase() +
        formattedData[field].slice(1);
    }
  });

  return formattedData;
};

/**
 * Handles form submission with standardized error handling
 * @param {Function} apiCall - The API function to call
 * @param {Object} values - Form values
 * @param {Object} formikHelpers - Formik helpers (setSubmitting, setStatus, etc.)
 * @param {Object} options - Additional options
 * @returns {Promise} - Promise that resolves when submission is complete
 */
export const handleFormSubmit = async (
  apiCall,
  values,
  { setSubmitting, setStatus, resetForm },
  options = {}
) => {
  const {
    onSuccess,
    onError,
    formatData = true,
    formatOptions = { stringArrayFields: [] },
    resetOnSuccess = false,
  } = options;

  // Clear previous status
  setStatus({});

  try {
    // Format data if requested
    const formattedData = formatData
      ? formatFormData(values, formatOptions)
      : values;

    // Call API
    const response = await apiCall(formattedData);

    // Handle success
    setStatus({ success: 'Operation completed successfully!' });

    // Reset form if requested
    if (resetOnSuccess) {
      resetForm();
    }

    // Call success callback if provided
    if (onSuccess) {
      onSuccess(response);
    }

    return response;
  } catch (error) {
    // Handle error
    console.error('Form submission error:', error);
    setStatus({
      error: error.message || 'An unexpected error occurred. Please try again.',
    });

    // Call error callback if provided
    if (onError) {
      onError(error);
    }

    throw error;
  } finally {
    setSubmitting(false);
  }
};

/**
 * Creates a Yup validation schema with common field validations
 * @param {Object} Yup - Yup validation library
 * @returns {Object} - Common validation schemas
 */
export const createValidationSchemas = (Yup) => ({
  required: Yup.string().required('Required'),
  email: Yup.string().email('Invalid email address'),
  phone: Yup.string().matches(/^[\d+\-()\s]*$/, 'Invalid phone number'),
  url: Yup.string().url('Invalid URL'),
  number: Yup.number().typeError('Must be a number'),
  positiveNumber: Yup.number()
    .positive('Must be positive')
    .typeError('Must be a number'),
  integer: Yup.number()
    .integer('Must be an integer')
    .typeError('Must be a number'),
  date: Yup.date().typeError('Invalid date'),
  boolean: Yup.boolean(),
  array: Yup.array(),
  stringArray: Yup.string(), // Will be processed by formatFormData
});

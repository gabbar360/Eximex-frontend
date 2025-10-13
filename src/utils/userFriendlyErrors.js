// User-friendly error messages mapping
const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR:
    'Unable to connect to the server. Please check your internet connection and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',

  // HTTP Status codes
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to perform this action.",
  404: 'The requested resource was not found.',
  409: 'This action conflicts with existing data. Please refresh and try again.',
  422: 'The provided data is invalid. Please check your input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error occurred. Please try again later.',
  502: 'Service temporarily unavailable. Please try again later.',
  503: 'Service temporarily unavailable. Please try again later.',

  // Common operation errors
  CREATE_ERROR: 'Failed to create the item. Please try again.',
  UPDATE_ERROR: 'Failed to update the item. Please try again.',
  DELETE_ERROR: 'Failed to delete the item. Please try again.',
  FETCH_ERROR: 'Failed to load data. Please refresh the page.',

  // Validation errors
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'Please fill in all required fields.',

  // Default fallback
  DEFAULT: 'Something went wrong. Please try again.',
};

// Context-specific error messages
const CONTEXT_ERRORS = {
  product: {
    create: 'Failed to create product. Please check all fields and try again.',
    update:
      'Failed to update product. Please check your changes and try again.',
    delete: 'Failed to delete product. Please try again.',
    fetch: 'Failed to load products. Please refresh the page.',
    duplicate: 'A product with this name or SKU already exists.',
    invalid_category: 'Please select a valid category.',
    invalid_data: 'Please check the product information and try again.',
  },
  category: {
    create: 'Failed to create category. Please check all fields and try again.',
    update:
      'Failed to update category. Please check your changes and try again.',
    delete:
      'Failed to delete category. This category may be in use by products.',
    fetch: 'Failed to load categories. Please refresh the page.',
    duplicate: 'A category with this name already exists.',
    invalid_parent: 'Please select a valid parent category.',
    has_children: 'Cannot delete category that has subcategories.',
  },
  auth: {
    login: 'Invalid email or password. Please try again.',
    logout: 'Failed to log out. Please try again.',
    token_expired: 'Your session has expired. Please log in again.',
    unauthorized: 'You are not authorized to perform this action.',
  },
  order: {
    create: 'Failed to create order. Please check all fields and try again.',
    update: 'Failed to update order. Please check your changes and try again.',
    delete: 'Failed to delete order. Please try again.',
    fetch: 'Failed to load orders. Please refresh the page.',
  },
  party: {
    create: 'Failed to create party. Please check all fields and try again.',
    update: 'Failed to update party. Please check your changes and try again.',
    delete: 'Failed to delete party. Please try again.',
    fetch: 'Failed to load parties. Please refresh the page.',
  },
};

/**
 * Get user-friendly error message based on error object and context
 * @param {Error|Object} error - The error object
 * @param {string} context - The context (e.g., 'product', 'category')
 * @param {string} operation - The operation (e.g., 'create', 'update', 'delete', 'fetch')
 * @returns {string} User-friendly error message
 */
export const getUserFriendlyError = (
  error,
  context = null,
  operation = null
) => {
  // Handle network errors
  if (!error.response && error.request) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Handle timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT_ERROR;
  }

  // Get status code
  const statusCode = error.response?.status || error.status || error.statusCode;

  // Get error message from response
  const serverMessage =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message;

  // For auth login, prioritize backend message
  if (context === 'auth' && operation === 'login' && serverMessage) {
    return serverMessage;
  }

  // Check for context-specific errors first
  if (context && operation && CONTEXT_ERRORS[context]?.[operation]) {
    // Check if server message contains specific error indicators
    if (serverMessage) {
      const lowerMessage = serverMessage.toLowerCase();

      // Handle duplicate/unique constraint errors
      if (
        lowerMessage.includes('duplicate') ||
        lowerMessage.includes('unique') ||
        lowerMessage.includes('already exists')
      ) {
        return CONTEXT_ERRORS[context].duplicate || ERROR_MESSAGES.DEFAULT;
      }

      // Handle validation errors
      if (
        lowerMessage.includes('validation') ||
        lowerMessage.includes('invalid') ||
        lowerMessage.includes('required')
      ) {
        return (
          CONTEXT_ERRORS[context].invalid_data ||
          ERROR_MESSAGES.VALIDATION_ERROR
        );
      }

      // Handle foreign key constraint errors
      if (
        lowerMessage.includes('foreign key') ||
        lowerMessage.includes('constraint') ||
        lowerMessage.includes('reference')
      ) {
        if (context === 'category' && operation === 'delete') {
          return CONTEXT_ERRORS[context].has_children;
        }
        return (
          CONTEXT_ERRORS[context].invalid_data ||
          ERROR_MESSAGES.VALIDATION_ERROR
        );
      }
    }

    return CONTEXT_ERRORS[context][operation];
  }

  // Handle specific server messages that should be user-friendly (prioritize over generic HTTP codes)
  if (
    serverMessage &&
    !serverMessage.includes('Request failed with status code')
  ) {
    // Only return server message if it's user-friendly (doesn't contain technical terms)
    const technicalTerms = [
      'status code',
      'axios',
      'ECONNREFUSED',
      'ETIMEDOUT',
      'ENOTFOUND',
      'socket',
      'connection',
      'internal server error',
      'stack trace',
    ];

    const isUserFriendly = !technicalTerms.some((term) =>
      serverMessage.toLowerCase().includes(term.toLowerCase())
    );

    if (isUserFriendly && serverMessage.length < 200) {
      return serverMessage;
    }
  }

  // Handle HTTP status codes as fallback
  if (statusCode && ERROR_MESSAGES[statusCode]) {
    return ERROR_MESSAGES[statusCode];
  }

  // Fallback to default message
  return ERROR_MESSAGES.DEFAULT;
};

/**
 * Enhanced axios error handler that returns user-friendly messages
 * @param {Error} error - Axios error object
 * @param {string} context - Context for the error (optional)
 * @param {string} operation - Operation being performed (optional)
 * @returns {Error} Enhanced error with user-friendly message
 */
export const handleAxiosError = (error, context = null, operation = null) => {
  const userFriendlyMessage = getUserFriendlyError(error, context, operation);

  // Log the original error for debugging
  console.error('Original error:', {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    context,
    operation,
  });

  // Create enhanced error object
  const enhancedError = new Error(userFriendlyMessage);
  enhancedError.originalError = error;
  enhancedError.statusCode = error.response?.status;
  enhancedError.isAxiosError = true;
  enhancedError.context = context;
  enhancedError.operation = operation;

  return enhancedError;
};

export default {
  getUserFriendlyError,
  handleAxiosError,
  ERROR_MESSAGES,
  CONTEXT_ERRORS,
};

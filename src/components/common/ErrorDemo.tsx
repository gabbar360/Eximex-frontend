import React from 'react';
import { toast } from 'react-toastify';

// Demo component to test user-friendly error messages
const ErrorDemo: React.FC = () => {
  const testProductError = async () => {
    toast.error('Test product error');
  };

  const testCategoryError = async () => {
    toast.error('Test category error');
  };

  const testNetworkError = async () => {
    try {
      await fetch('http://invalid-url-that-does-not-exist.com');
    } catch {
      toast.error(
        'Unable to connect to the server. Please check your internet connection and try again.'
      );
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold">Error Handling Demo</h3>
      <div className="space-y-2">
        <button
          onClick={testProductError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Product Error (404)
        </button>
        <button
          onClick={testCategoryError}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Test Category Error (Validation)
        </button>
        <button
          onClick={testNetworkError}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Test Network Error
        </button>
      </div>
      <p className="text-sm text-gray-600">
        Click these buttons to see user-friendly error messages instead of
        technical errors.
      </p>
    </div>
  );
};

export default ErrorDemo;

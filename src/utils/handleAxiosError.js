const handleAxiosError = (error) => {
  // Return backend message directly or fallback to error message
  const backendMessage = error.response?.data?.message || error.message;
  const enhancedError = new Error(backendMessage);
  enhancedError.originalError = error;
  enhancedError.statusCode = error.response?.status;
  return enhancedError;
};

export default handleAxiosError;
export { handleAxiosError };

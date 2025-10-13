import { handleAxiosError as handleUserFriendlyError } from './userFriendlyErrors.js';

const handleAxiosError = (error, context = null, operation = null) => {
  return handleUserFriendlyError(error, context, operation);
};

export default handleAxiosError;
export { handleAxiosError };

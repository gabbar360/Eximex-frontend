import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { setUser, clearUser } from '../features/userSlice';
import { logoutUser, getCurrentUser } from '../features/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: any) => state.user);

  const logout = async () => {
    try {
      const response = await dispatch(logoutUser()).unwrap();
      dispatch(clearUser());
      toast.success(response.message || 'Logged out successfully');
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      dispatch(clearUser());
      navigate('/signin');
      toast.error(error.message || 'Logout failed');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await dispatch(getCurrentUser()).unwrap();
      if (userData?.data) {
        dispatch(setUser(userData.data));
        return userData.data;
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      return null;
    }
  };

  return {
    user,
    isAuthenticated,
    logout,
    fetchCurrentUser,
  };
};

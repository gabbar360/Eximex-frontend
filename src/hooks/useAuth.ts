import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { setUser, clearUser } from '../features/userSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: any) => state.user);

  const logout = async () => {
    try {
      const response = await dispatch(logout()).unwrap();
      dispatch(clearUser());
      toast.success(response.message);
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error(error.message);
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

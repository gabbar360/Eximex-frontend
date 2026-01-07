import axiosInstance from '../utils/axiosInstance';
import handleAxiosError from '../utils/handleAxiosError';

const getLedger = async (params = {}) => {
  try {
    const { data } = await axiosInstance.get('/accounting/ledger', { params });
    return data;
  } catch (error) {
    throw handleAxiosError(error, 'accounting', 'getLedger');
  }
};

const getProfitLoss = async (params = {}) => {
  try {
    const { data } = await axiosInstance.get('/accounting/profit-loss', { params });
    return data;
  } catch (error) {
    throw handleAxiosError(error, 'accounting', 'getProfitLoss');
  }
};

const getBalanceSheet = async (params = {}) => {
  try {
    const { data } = await axiosInstance.get('/accounting/balance-sheet', { params });
    return data;
  } catch (error) {
    throw handleAxiosError(error, 'accounting', 'getBalanceSheet');
  }
};

const accountingService = {
  getLedger,
  getProfitLoss,
  getBalanceSheet,
};

export default accountingService;
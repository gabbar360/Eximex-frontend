// src/redux-store/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import partyReducer from '../features/partySlice';
import categoryReducer from '../features/categorySlice';
import productReducer from '../features/productSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    party: partyReducer,
    category: categoryReducer,
    product: productReducer,
  },
});

export default store;

/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */

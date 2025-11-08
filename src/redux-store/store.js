// src/redux-store/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/userSlice';
import partyReducer from '../features/partySlice';
import categoryReducer from '../features/categorySlice';
import productReducer from '../features/productSlice';
import orderReducer from '../features/orderSlice';
import piReducer from '../features/piSlice';
import authReducer from '../features/authSlice';
import purchaseOrderReducer from '../features/purchaseOrderSlice';
import companyReducer from '../features/companySlice';
import packagingReducer from '../features/packagingSlice';
import packingListReducer from '../features/packingListSlice';
import paymentReducer from '../features/paymentSlice';
import productVariantReducer from '../features/productVariantSlice';
import userManagementReducer from '../features/userManagementSlice';
import vgmReducer from '../features/vgmSlice';
import roleReducer from '../features/roleSlice';


const store = configureStore({
  reducer: {
    user: userReducer,
    party: partyReducer,
    category: categoryReducer,
    product: productReducer,
    order: orderReducer,
    pi: piReducer,
    auth: authReducer,
    purchaseOrder: purchaseOrderReducer,
    company: companyReducer,
    packaging: packagingReducer,
    packingList: packingListReducer,
    payment: paymentReducer,
    productVariant: productVariantReducer,
    userManagement: userManagementReducer,
    vgm: vgmReducer,
    role: roleReducer,

  },
});

export { store };
export default store;

/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */

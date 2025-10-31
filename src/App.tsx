import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AntdConfig from './components/form/AntdConfig';
import { AuthProvider } from './context/AuthContext';

import SignIn from './pages/AuthPages/SignIn';
import SignUp from './pages/AuthPages/SignUp';
import ForgotPassword from './pages/AuthPages/ForgotPassword';
import ResetPassword from './pages/AuthPages/ResetPassword';
import NotFound from './pages/OtherPage/NotFound';
import UserProfiles from './pages/UserProfiles';
import Videos from './pages/UiElements/Videos';
import Images from './pages/UiElements/Images';
import Alerts from './pages/UiElements/Alerts';
import Badges from './pages/UiElements/Badges';
import Avatars from './pages/UiElements/Avatars';
import Buttons from './pages/UiElements/Buttons';
import LineChart from './pages/Charts/LineChart';
import BarChart from './pages/Charts/BarChart';
import Calendar from './pages/Calendar';
import BasicTables from './pages/Tables/BasicTables';
import FormElements from './pages/Forms/FormElements';
import Blank from './pages/Blank';
import AppLayout from './layout/AppLayout';
import { ScrollToTop } from './components/common/ScrollToTop';
// import Home from './pages/Dashboard/Home';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import { useEffect, useState } from 'react';
import { setUser } from './features/userSlice';
import { getCurrentUser } from './features/authSlice';
import authService from './service/authService';
import Cprospect from '../src/pages/party/Cprospect';
import AddEditPartyForm from './pages/party/AddEditPartyForm';
import ViewParty from './pages/party/ViewParty';
import Category from '../src/pages/category/Category';
import AddEditCategoryForm from '../src/pages/category/AddEditCategoryForm';
import Product from '../src/pages/product/Product';
import AddEditProductForm from '../src/pages/product/AddEditProductForm';
import PerformaInvoice from '../src/pages/PI/PerformaInvoice';
import AddEditPerformaInvoiceForm from '../src/pages/PI/AddEditPerformaInvoiceForm';
import PIHistory from './pages/PI/PIHistory';
import PIDetails from './pages/PI/PIDetails';
import Orders from './pages/order/Orders';
import EditOrder from './pages/order/EditOrder';
import AddOrder from './pages/order/AddOrder';
import AddEditPackingList from './pages/order/AddEditPackingList';
import ViewInvoice from './pages/order/ViewInvoice';
import AddEditVgm from './pages/order/AddEditVgm';
import StaffManagement from './components/StaffManagement';
import ActivityLogComponent from './components/ActivityLog';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import UserManagement from './pages/SuperAdmin/UserManagement';
import SuperAdminDashboard from './pages/SuperAdmin/SuperAdminDashboard';
import PasswordManagement from './pages/SuperAdmin/PasswordManagement';
import CompanyManagement from './pages/SuperAdmin/CompanyManagement';
import PurchaseOrders from './pages/PO/PurchaseOrders';
import AddEditPurchaseOrderForm from './pages/PO/AddEditPurchaseOrderForm';
import PaymentTracking from './pages/PaymentTracking';

function AppContent() {
  const location = useLocation();
  const user = useSelector((state) => state.user.user);

  return (
    <Routes>
      {/* <Route
        path="/"
        element={
          user ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      /> */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route element={<PublicRoute />}>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        {/* <Route path="/" element={<Navigate to="/admin/dashboard" replace />} /> */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<RoleBasedDashboard />} />
          {/* <Route path="/admin/dashboard" element={<Home />} /> */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/cprospect" element={<Cprospect />} />
          <Route path="/add-party" element={<AddEditPartyForm />} />
          <Route path="/edit-party/:id" element={<AddEditPartyForm />} />
          <Route path="/view-party/:id" element={<ViewParty />} />
          <Route path="/categories" element={<Category />} />
          <Route path="/add-category" element={<AddEditCategoryForm />} />
          <Route path="/edit-category/:id" element={<AddEditCategoryForm />} />
          <Route path="/products" element={<Product />} />
          <Route path="/add-product" element={<AddEditProductForm />} />
          <Route path="/edit-product/:id" element={<AddEditProductForm />} />
          <Route path="/proforma-invoices" element={<PerformaInvoice />} />
          <Route path="/add-pi" element={<AddEditPerformaInvoiceForm />} />
          <Route
            path="/proforma-invoices/:id/history"
            element={<PIHistory />}
          />
          <Route path="/edit-pi/:id" element={<AddEditPerformaInvoiceForm />} />
          <Route path="/pi-details/:id" element={<PIDetails />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/add-order" element={<AddOrder />} />
          <Route path="/edit-order/:id" element={<EditOrder />} />
          <Route path="/view-invoice/:id" element={<ViewInvoice />} />
          <Route path="/packing-list/:id" element={<AddEditPackingList />} />
          <Route path="/vgm/create" element={<AddEditVgm />} />
          <Route path="/vgm/edit/:id" element={<AddEditVgm />} />

          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route
            path="/purchase-orders/create"
            element={<AddEditPurchaseOrderForm />}
          />
          <Route
            path="/purchase-orders/edit/:id"
            element={<AddEditPurchaseOrderForm />}
          />

          <Route path="/staff-management" element={<StaffManagement />} />
          <Route path="/activity-logs" element={<ActivityLogComponent />} />
          <Route path="/super-admin/users" element={<UserManagement />} />
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/passwords" element={<PasswordManagement />} />
          <Route path="/super-admin/companies" element={<CompanyManagement />} />
          <Route path="/payments" element={<PaymentTracking />} />

          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const loadBasicDetails = async () => {
      try {
        // Check for Google OAuth callback tokens in URL
        const urlParams = new URLSearchParams(window.location.search);
        const googleCallback = authService.handleGoogleCallback(urlParams);

        if (googleCallback.success) {
          // If user data is provided, set it immediately
          if (googleCallback.userData) {
            dispatch(setUser(googleCallback.userData));
          }
          
          // Clean up URL
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken || refreshToken) {
          // Only fetch user if not already set from Google callback
          if (!googleCallback.userData) {
            // Try to get current user, which will trigger token refresh if needed
            const res = await dispatch(getCurrentUser()).unwrap();
            if (res?.data) {
              dispatch(setUser(res.data));
            }
          }
        }
      } catch (err) {
        console.warn('User not authenticated:', err.message);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
    loadBasicDetails();
  }, [dispatch]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <AntdConfig>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 9999 }}
            toastStyle={{
              fontSize: '14px',
              borderRadius: '8px',
            }}
          />
          <AppContent />
        </Router>
      </AuthProvider>
    </AntdConfig>
  );
}

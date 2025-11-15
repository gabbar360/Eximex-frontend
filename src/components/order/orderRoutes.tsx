import React from 'react';
import { Routes, Route } from 'react-router-dom';
import OrderLayout from './OrderLayout';
import AllOrders from '../../pages/orders/AllOrders';
import ShipmentManagement from '../../pages/orders/ShipmentManagement';
import PackingListManagement from '../../pages/orders/PackingListManagement';
import VgmManagement from '../../pages/orders/VgmManagement';
import ReportsDownloads from '../../pages/orders/ReportsDownloads';

const OrderRoutes: React.FC = () => (
  <Routes>
    <Route path="/orders" element={<OrderLayout />}>
      <Route index element={<AllOrders />} />
      <Route path="shipments" element={<ShipmentManagement />} />
      <Route path="packing-lists" element={<PackingListManagement />} />
      <Route path="vgm" element={<VgmManagement />} />
      <Route path="reports" element={<ReportsDownloads />} />
    </Route>
  </Routes>
);

export default OrderRoutes;
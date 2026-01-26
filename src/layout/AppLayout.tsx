import React from 'react';
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import Backdrop from './Backdrop';
import Sidebar from '../components/Sidebar';
import OnboardingModal from '../pages/Comanyform';
import { useSelector } from 'react-redux';

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const user = useSelector((state: Record<string, unknown>) => state.user.user);
  const isProfileComplete =
    user?.companyId || user?.role?.name === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen xl:flex">
      {!isProfileComplete && user?.role?.name !== 'SUPER_ADMIN' && (
        <OnboardingModal onClose={() => {}} />
      )}
      <div>
        <Sidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[240px]' : 'lg:ml-[70px]'
        } ${isMobileOpen ? 'ml-0' : ''} relative`}
      >
        <AppHeader />
        <main className="mt-20 pt-4 p-2 mx-auto max-w-(--breakpoint-2xl) md:p-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default AppLayout;

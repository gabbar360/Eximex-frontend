import React from 'react';
// import { useSelector } from "react-redux";
import { SidebarProvider, useSidebar } from '../context/SidebarContext';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';
import Backdrop from './Backdrop';
import AppSidebar from './AppSidebar';
import OnboardingModal from '../pages/Comanyform';
import { useSelector } from 'react-redux';

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const user = useSelector((state: any) => state.user.user);
  const isProfileComplete = user?.companyId || user?.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen xl:flex">
      {!isProfileComplete && <OnboardingModal onClose={() => {}} />}
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
        } ${isMobileOpen ? 'ml-0' : ''} relative`}
      >
        <AppHeader />
        <main className="p-2 mx-auto max-w-(--breakpoint-2xl) md:p-3">
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

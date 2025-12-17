import React, { useState, useEffect } from 'react';
import UserDashboard from './UserDashboard';
import MobileOptimizedDashboard from './MobileOptimizedDashboard';

export default function ComprehensiveDashboard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show mobile-optimized version on small screens
  if (isMobile) {
    return <MobileOptimizedDashboard />;
  }

  // Show only UserDashboard without tabs
  return <UserDashboard />;
}

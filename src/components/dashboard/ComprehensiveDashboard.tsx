import React, { useState, useEffect } from 'react';
import MaterialDashboard from './MaterialDashboard';
import AdvancedCharts from './AdvancedCharts';
import MobileOptimizedDashboard from './MobileOptimizedDashboard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

export default function ComprehensiveDashboard() {
  const [value, setValue] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleChange = (newValue: number) => {
    setValue(newValue);
  };

  // Show mobile-optimized version on small screens
  if (isMobile) {
    return <MobileOptimizedDashboard />;
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-900 shadow-theme-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => handleChange(0)}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                value === 0
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Overview Dashboard
            </button>
            <button
              onClick={() => handleChange(1)}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                value === 1
                  ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Advanced Analytics
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <TabPanel value={value} index={0}>
        <MaterialDashboard />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AdvancedCharts />
      </TabPanel>
    </div>
  );
}
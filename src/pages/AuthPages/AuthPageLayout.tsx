import React from 'react';
import ThemeTogglerTwo from '../../components/common/ThemeTogglerTwo';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 30px 30px, rgba(255,255,255,0.1) 2px, transparent 2px)', backgroundSize: '60px 60px'}}></div>
      </div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-blue-400/10 rounded-full blur-lg animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-indigo-400/10 rounded-full blur-md animate-pulse delay-500"></div>
      
      <div className="relative h-full flex items-center justify-center p-2 sm:p-4">
        {children}
        
        {/* Theme Toggle */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}

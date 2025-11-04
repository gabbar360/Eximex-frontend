import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden overflow-y-auto relative" style={{backgroundColor: '#86a0b2'}}>
      <div className="relative min-h-screen">
        {children}
      </div>
    </div>
  );
}

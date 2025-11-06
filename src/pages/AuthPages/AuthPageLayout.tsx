import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-x-hidden overflow-y-auto relative flex items-center justify-center" style={{backgroundColor: '#86a0b2'}}>
      {children}
    </div>
  );
}

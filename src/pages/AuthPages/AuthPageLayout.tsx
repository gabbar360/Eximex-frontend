import React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden overflow-y-auto relative bg-gray-50">
      {children}
    </div>
  );
}

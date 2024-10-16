import React, { PropsWithChildren } from 'react';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">{children}</div>
  );
};
export const Content: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <main className="flex-grow flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">{children}</div>
    </main>
  );
};

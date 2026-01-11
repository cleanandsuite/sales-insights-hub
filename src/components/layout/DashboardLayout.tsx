import { ReactNode } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileHeader />
      <main className="min-h-screen p-4 pt-20 lg:ml-64 lg:p-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}

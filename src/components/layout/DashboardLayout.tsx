import { ReactNode } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';
import { useSidebarState } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarState();
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileHeader />
      <main className={cn(
        "min-h-screen p-4 pt-20 lg:p-8 lg:pt-8 transition-all duration-200",
        isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}

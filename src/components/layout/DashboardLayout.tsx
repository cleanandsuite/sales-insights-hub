import { ReactNode } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';
import { useSidebarState } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { useCallReminders } from '@/hooks/useCallReminders';
import { HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarState();
  const navigate = useNavigate();
  useCallReminders();
  
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileHeader />
      <main className={cn(
        "min-h-screen p-3 sm:p-4 pt-16 sm:pt-20 lg:p-8 lg:pt-8 transition-all duration-200",
        isCollapsed ? "lg:ml-16" : "lg:ml-64"
      )}>
        {children}
      </main>

      {/* Floating help button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => navigate('/support')}
              className="fixed bottom-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Help & Support</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

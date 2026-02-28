import { NavLink } from 'react-router-dom';
import { LayoutDashboard, LogOut, Calendar, Settings, Target, BarChart3, Sparkles, Menu, Crown, TrendingUp, Shield, Building2, ChevronLeft, ChevronRight, Medal } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useSidebarState } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SellSigLogo, SellSigIcon } from '@/components/ui/SellSigLogo';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const baseNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Target, label: 'Leads' },
  { to: '/winwords', icon: Sparkles, label: 'WinWords' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics & Coaching' },
  { to: '/leaderboard', icon: Medal, label: 'Leaderboard' },
  { to: '/enterprise', icon: Building2, label: 'Enterprise' },
];

const bottomNavItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const managerNavItem = { to: '/manager', icon: Crown, label: 'Manager' };
const enterpriseNavItem = { to: '/enterprise', icon: Building2, label: 'Enterprise' };
const revenueIntelligenceItem = { to: '/revenue-intelligence', icon: TrendingUp, label: 'Revenue Intel' };
// Experiments moved to Settings
const adminPanelItem = { to: '/admin', icon: Shield, label: 'Admin Panel' };

interface NavItemProps {
  item: { to: string; icon: React.ComponentType<{ className?: string }>; label: string };
  isCollapsed: boolean;
  onNavClick?: () => void;
}

function NavItem({ item, isCollapsed, onNavClick }: NavItemProps) {
  const linkContent = (
    <NavLink
      to={item.to}
      onClick={onNavClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isCollapsed && 'justify-center px-2',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
        )
      }
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {linkContent}
        </TooltipTrigger>
        <TooltipContent side="right" className="font-medium">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { signOut } = useAuth();
  const { isManager } = useUserRole();
  const { isAdmin } = useAdminRole();
  const { isCollapsed, toggleCollapse } = useSidebarState();
  
  // All users see Dashboard, Enterprise, Call Activity, WinWords, Leads, Analytics, Schedule, Coaching
  let navItems = [...baseNavItems];
  
  // Managers also see Manager and Revenue Intelligence
  if (isManager) {
    navItems = [...navItems, managerNavItem, revenueIntelligenceItem];
  }
  
  let bottomItems = [...bottomNavItems];
  
  if (isAdmin) {
    bottomItems = [...bottomItems.slice(0, -1), adminPanelItem, bottomItems[bottomItems.length - 1]];
  }

  const signOutButton = (
    <button
      onClick={signOut}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive",
        isCollapsed && 'justify-center px-2'
      )}
    >
      <LogOut className="h-5 w-5 shrink-0" />
      {!isCollapsed && <span>Sign Out</span>}
    </button>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-sidebar-border",
        isCollapsed ? "justify-center px-2" : "px-6"
      )}>
        {isCollapsed ? (
          <NavLink to="/dashboard" className="flex items-center justify-center">
            <div className="rounded-xl flex items-center justify-center backdrop-blur-sm border border-primary/20 bg-primary/10 h-8 w-8">
              <SellSigIcon className="h-5 w-5" />
            </div>
          </NavLink>
        ) : (
          <SellSigLogo size="sm" linkTo="/dashboard" />
        )}
      </div>

      {/* Main Navigation */}
      <nav className={cn(
        "flex-1 space-y-1 py-4 overflow-y-auto",
        isCollapsed ? "px-2" : "px-3"
      )}>
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} isCollapsed={isCollapsed} onNavClick={onNavClick} />
        ))}
        
        <Separator className="my-3 bg-sidebar-border" />
        
        {bottomItems.map((item) => (
          <NavItem key={item.to} item={item} isCollapsed={isCollapsed} onNavClick={onNavClick} />
        ))}
      </nav>

      {/* Sign Out & Toggle */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        {isCollapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              {signOutButton}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Sign Out
            </TooltipContent>
          </Tooltip>
        ) : (
          signOutButton
        )}
        
        {/* Toggle Button - Hidden on mobile sheet */}
        <button
          onClick={toggleCollapse}
          className={cn(
            "hidden lg:flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
            isCollapsed && 'justify-center px-2'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 lg:hidden">
      <SellSigLogo size="sm" linkTo="/dashboard" showTagline={false} />
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden border-sidebar-border bg-sidebar-accent/50">
            <Menu className="h-5 w-5 text-sidebar-foreground" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <SidebarContent onNavClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}

export function Sidebar() {
  const { isCollapsed } = useSidebarState();
  
  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar hidden lg:block transition-all duration-200",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <SidebarContent />
    </aside>
  );
}

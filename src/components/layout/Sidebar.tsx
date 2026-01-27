import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, LogOut, FileAudio, Users, Calendar, Trophy, Settings, Target, BarChart3, Sparkles, Menu, Crown, UserCircle, FlaskConical, TrendingUp, Shield, Building2, Link2, Phone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminRole } from '@/hooks/useAdminRole';
import { useEnterpriseSubscription } from '@/hooks/useEnterpriseSubscription';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { SellSigLogo } from '@/components/ui/SellSigLogo';
import { Separator } from '@/components/ui/separator';

const baseNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/enterprise', icon: Target, label: 'Deals' },
  { to: '/recordings', icon: Phone, label: 'Call Activity' },
  { to: '/winwords', icon: Sparkles, label: 'WinWords' },
  { to: '/leads', icon: Target, label: 'Leads' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/coaching', icon: Trophy, label: 'Coaching' },
];

const bottomNavItems = [
  { to: '/integrations', icon: Link2, label: 'Integrations' },
  { to: '/profile', icon: UserCircle, label: 'Your Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const managerNavItem = { to: '/manager', icon: Crown, label: 'Manager' };
const revenueIntelligenceItem = { to: '/revenue-intelligence', icon: TrendingUp, label: 'Revenue Intel' };
const adminNavItem = { to: '/experiments', icon: FlaskConical, label: 'Experiments' };
const adminPanelItem = { to: '/admin', icon: Shield, label: 'Admin Panel' };

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { signOut } = useAuth();
  const { isManager } = useUserRole();
  const { isAdmin } = useAdminRole();
  
  let navItems = isManager 
    ? [...baseNavItems, managerNavItem, revenueIntelligenceItem]
    : baseNavItems;
  
  let bottomItems = [...bottomNavItems];
  
  if (isAdmin) {
    bottomItems = [...bottomItems.slice(0, -1), adminNavItem, adminPanelItem, bottomItems[bottomItems.length - 1]];
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <SellSigLogo size="sm" linkTo="/dashboard" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
        
        <Separator className="my-3 bg-sidebar-border" />
        
        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
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
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar hidden lg:block">
      <SidebarContent />
    </aside>
  );
}

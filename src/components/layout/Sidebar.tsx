import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, LogOut, FileAudio, Users, Calendar, Trophy, Settings, Target, BarChart3, Sparkles, Menu, Crown, UserCircle, FlaskConical } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useAdminRole } from '@/hooks/useAdminRole';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import sellsigLogo from '@/assets/sellsig-logo.png';

const baseNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/winwords', icon: Sparkles, label: 'WinWords' },
  { to: '/leads', icon: Target, label: 'Leads' },
  { to: '/recordings', icon: FileAudio, label: 'Recordings' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/coaching', icon: Trophy, label: 'Coaching' },
  { to: '/profile', icon: UserCircle, label: 'Your Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const managerNavItem = { to: '/manager', icon: Crown, label: 'Manager' };
const adminNavItem = { to: '/experiments', icon: FlaskConical, label: 'Experiments' };

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { signOut } = useAuth();
  const { isManager } = useUserRole();
  const { isAdmin } = useAdminRole();
  
  let navItems = isManager 
    ? [...baseNavItems.slice(0, -1), managerNavItem, baseNavItems[baseNavItems.length - 1]]
    : baseNavItems;
  
  if (isAdmin) {
    navItems = [...navItems.slice(0, -1), adminNavItem, navItems[navItems.length - 1]];
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
          <img src={sellsigLogo} alt="SellSig" className="h-6 w-6 object-contain" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">SellSig</span>
      </div>

      {/* Navigation */}
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
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 overflow-hidden">
          <img src={sellsigLogo} alt="SellSig" className="h-5 w-5 object-contain" />
        </div>
        <span className="text-base font-semibold text-sidebar-foreground">SellSig</span>
      </div>
      
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

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Upload, LogOut, Headphones, FileAudio, Users, Calendar, Trophy, Settings, Target, Phone, BarChart3, Sparkles, Menu, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

const baseNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/winwords', icon: Sparkles, label: 'WinWords' },
  { to: '/leads', icon: Target, label: 'Leads' },
  { to: '/call-history', icon: Phone, label: 'Call History' },
  { to: '/recordings', icon: FileAudio, label: 'Recordings' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/coaching', icon: Trophy, label: 'Coaching' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/upload', icon: Upload, label: 'Upload' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const managerNavItem = { to: '/manager', icon: Crown, label: 'Manager' };

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const { signOut } = useAuth();
  const { isManager } = useUserRole();
  
  const navItems = isManager 
    ? [...baseNavItems.slice(0, -1), managerNavItem, baseNavItems[baseNavItems.length - 1]]
    : baseNavItems;

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Headphones className="h-5 w-5 text-primary" />
        </div>
        <span className="text-lg font-semibold text-sidebar-foreground">CallScope</span>
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
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Headphones className="h-4 w-4 text-primary" />
        </div>
        <span className="text-base font-semibold text-sidebar-foreground">CallScope</span>
      </div>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
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

import { ReactNode } from 'react';
import { Sidebar, MobileHeader } from './Sidebar';
import { useSidebarState } from '@/contexts/SidebarContext';
import { useCharacter } from '@/contexts/CharacterContext';
import { WanderingCharacter } from '@/components/character/Character';
import { calculateClass } from '@/lib/evolution';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isCollapsed } = useSidebarState();
  const { config, stats, name } = useCharacter();
  const characterClass = calculateClass(stats);

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

      {/* Wandering character - appears on all dashboard pages */}
      <WanderingCharacter
        config={config}
        characterClass={characterClass}
        size={80}
        name={name}
      />
    </div>
  );
}

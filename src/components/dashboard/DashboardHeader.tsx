import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  onStartCall: () => void;
  showEnterpriseBadge?: boolean;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  userName = 'there',
  onStartCall,
  showEnterpriseBadge = false,
  className,
}: DashboardHeaderProps) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  
  const displayTitle = title || `${greeting}, ${userName} 👋`;
  const displaySubtitle = subtitle || "Ready to crush your goals today? Let's get started.";

  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{displayTitle}</h1>
          {showEnterpriseBadge && (
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium gap-1.5">
              <Sparkles className="h-3 w-3" />
              Enterprise
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1">{displaySubtitle}</p>
      </div>

      {/* Start Call button - prominent, red, next to greeting */}
      <Button
        onClick={onStartCall}
        size="lg"
        className={cn(
          'gap-2 font-bold shadow-lg transition-all duration-200 shrink-0',
          'bg-destructive hover:bg-destructive/90 active:bg-destructive/80',
          'text-destructive-foreground border-0',
          'hover:shadow-xl hover:shadow-destructive/30',
          'px-6 py-3 text-base rounded-xl'
        )}
      >
        <Phone className="h-5 w-5" />
        Start Call
      </Button>
    </div>
  );
}

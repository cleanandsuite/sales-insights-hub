import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mic, Headphones, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  isRecording: boolean;
  headphoneMode: boolean;
  onStartRecording: () => void;
  onHeadphoneModeChange: (value: boolean) => void;
  showEnterpriseBadge?: boolean;
  className?: string;
}

export function DashboardHeader({
  title,
  subtitle,
  userName = 'there',
  isRecording,
  headphoneMode,
  onStartRecording,
  onHeadphoneModeChange,
  showEnterpriseBadge = false,
  className,
}: DashboardHeaderProps) {
  // Get time of day for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  
  const displayTitle = title || `${greeting}, ${userName} 👋`;
  const displaySubtitle = subtitle || "Here's your revenue intelligence for today";

  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
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

      <div className="flex flex-col items-end gap-3">
        <Button
          onClick={onStartRecording}
          size="lg"
          className={cn(
            'gap-2 font-semibold shadow-lg transition-all duration-300',
            'bg-gradient-to-r from-primary to-primary/80',
            'hover:from-primary/90 hover:to-primary/70',
            'hover:shadow-xl hover:shadow-primary/20',
            'text-primary-foreground'
          )}
        >
          <Mic className="h-5 w-5" />
          🎙 Start Recording
        </Button>
        <div className="flex items-center gap-2">
          <Switch
            id="headphone-mode"
            checked={headphoneMode}
            onCheckedChange={onHeadphoneModeChange}
            className="data-[state=checked]:bg-primary"
          />
          <Label
            htmlFor="headphone-mode"
            className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer"
          >
            <Headphones className="h-4 w-4" />
            🎧 Mode
          </Label>
        </div>
      </div>
    </div>
  );
}

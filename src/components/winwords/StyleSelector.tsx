import { cn } from '@/lib/utils';
import { Zap, Brain, Clock, Users } from 'lucide-react';

const styles = [
  {
    id: 'confident',
    name: 'Confident',
    description: 'Bold and assertive',
    icon: Zap,
  },
  {
    id: 'consultative',
    name: 'Consultative',
    description: 'Expert advisor approach',
    icon: Brain,
  },
  {
    id: 'urgent',
    name: 'Urgent',
    description: 'Time-sensitive focus',
    icon: Clock,
  },
  {
    id: 'collaborative',
    name: 'Collaborative',
    description: 'Partnership-focused',
    icon: Users,
  },
];

interface StyleSelectorProps {
  selected: string;
  onSelect: (style: string) => void;
}

export function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {styles.map((style) => {
        const Icon = style.icon;
        const isSelected = selected === style.id;
        
        return (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
              isSelected
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-sm font-medium">{style.name}</span>
          </button>
        );
      })}
    </div>
  );
}

import { Phone, CalendarCheck, Search, Presentation, Scale, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const scenarios = [
  {
    id: 'cold_call',
    name: 'Cold Call',
    description: 'Break the ice and secure a meeting',
    icon: Phone,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    id: 'appointment_setter',
    name: 'Appointment Setter',
    description: 'Downsell & Close to book meetings at scale',
    icon: CalendarCheck,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  {
    id: 'discovery',
    name: 'Discovery',
    description: 'Uncover pain points and build trust',
    icon: Search,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  {
    id: 'demo',
    name: 'Demo',
    description: 'Show value through their use cases',
    icon: Presentation,
    color: 'bg-green-500/10 text-green-500 border-green-500/20',
  },
  {
    id: 'negotiation',
    name: 'Negotiation',
    description: 'Maximize deal value and close',
    icon: Scale,
    color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  },
  {
    id: 'renewal',
    name: 'Renewal',
    description: 'Celebrate wins and expand',
    icon: RefreshCw,
    color: 'bg-teal-500/10 text-teal-500 border-teal-500/20',
  },
];

interface ScenarioSelectorProps {
  selected: string;
  onSelect: (scenario: string) => void;
}

export function ScenarioSelector({ selected, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {scenarios.map((scenario) => {
        const Icon = scenario.icon;
        const isSelected = selected === scenario.id;
        
        return (
          <button
            key={scenario.id}
            onClick={() => onSelect(scenario.id)}
            className={cn(
              'flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all duration-200',
              isSelected
                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                : 'border-border bg-card hover:border-primary/50 hover:bg-accent/50'
            )}
          >
            <div className={cn('p-2 rounded-lg border', scenario.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className={cn(
                'font-semibold text-sm',
                isSelected ? 'text-primary' : 'text-foreground'
              )}>
                {scenario.name}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {scenario.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface PipelineKPI {
  label: string;
  value: string;
  target?: string;
  progress?: number;
  subLabel?: string;
  subValue?: string;
}

interface PipelineKPICardsProps {
  kpis: {
    bookingAttainment: number;
    bookingTarget: number;
    gapToTarget: number;
    coverage: number;
    openPipeline: number;
    totalPipelineCreated: number;
    pipelineTarget: number;
    productsSold: number;
    appointmentsSet: number;
    appointmentTarget: number;
  };
}

export function PipelineKPICards({ kpis }: PipelineKPICardsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  const bookingProgress = (kpis.bookingAttainment / kpis.bookingTarget) * 100;
  const pipelineProgress = (kpis.totalPipelineCreated / kpis.pipelineTarget) * 100;
  const appointmentProgress = (kpis.appointmentsSet / kpis.appointmentTarget) * 100;

  const cards: PipelineKPI[] = [
    {
      label: 'Booking Attainment',
      value: formatCurrency(kpis.bookingAttainment),
      target: formatCurrency(kpis.bookingTarget),
      progress: Math.min(bookingProgress, 100),
    },
    {
      label: 'Gap to Target',
      value: formatCurrency(kpis.gapToTarget),
    },
    {
      label: 'Coverage',
      value: `${kpis.coverage.toFixed(1)}x`,
      subLabel: 'Open Pipeline ($)',
      subValue: formatCurrency(kpis.openPipeline),
    },
    {
      label: 'Total Pipeline Created',
      value: formatCurrency(kpis.totalPipelineCreated),
      target: formatCurrency(kpis.pipelineTarget),
      progress: Math.min(pipelineProgress, 100),
    },
    {
      label: 'Products Sold',
      value: kpis.productsSold.toLocaleString(),
    },
    {
      label: 'Appointments Set',
      value: kpis.appointmentsSet.toLocaleString(),
      target: kpis.appointmentTarget.toLocaleString(),
      progress: Math.min(appointmentProgress, 100),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <Card 
          key={card.label} 
          className={`relative overflow-hidden border-t-4 ${
            index === 0 ? 'border-t-primary' : 
            index === 1 ? 'border-t-chart-3' : 
            index === 2 ? 'border-t-chart-2' :
            index === 3 ? 'border-t-success' :
            index === 4 ? 'border-t-chart-4' :
            'border-t-accent'
          } bg-card shadow-sm hover:shadow-md transition-shadow`}
        >
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {card.label}
            </p>
            <p className="text-2xl font-bold text-foreground tracking-tight">
              {card.value}
            </p>
            
            {card.subLabel && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{card.subLabel}</span>
                <span className="text-sm font-semibold text-foreground">{card.subValue}</span>
              </div>
            )}
            
            {card.progress !== undefined && (
              <div className="mt-3 space-y-1">
                <Progress 
                  value={card.progress} 
                  className="h-1.5"
                />
                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">{card.target}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

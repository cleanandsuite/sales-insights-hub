import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = 'text-cyan-400',
  trend,
  className 
}: KPICardProps) {
  return (
    <Card className={cn(
      "bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 hover:border-slate-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5",
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold text-white">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500">{subtitle}</p>
            )}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium",
                trend.isPositive ? "text-emerald-400" : "text-rose-400"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                <span className="text-slate-500 font-normal">vs last period</span>
              </div>
            )}
          </div>
          <div className={cn(
            "p-2 rounded-lg bg-slate-800/50 border border-slate-700/50",
            iconColor
          )}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

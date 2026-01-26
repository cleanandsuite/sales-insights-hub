import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface RevenueGaugeProps {
  current: number;
  goal: number;
  label?: string;
}

export function RevenueGauge({ current, goal, label = 'FYTD Revenue' }: RevenueGaugeProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-cyan-400" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative w-full aspect-[2/1] flex items-end justify-center">
          {/* Background Arc */}
          <svg
            viewBox="0 0 200 100"
            className="absolute inset-0 w-full h-full"
            style={{ overflow: 'visible' }}
          >
            {/* Background arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="rgba(51, 65, 85, 0.5)"
              strokeWidth="16"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 283} 283`}
              className="transition-all duration-1000 ease-out"
            />
            {/* Gradient definition */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>

          {/* Needle */}
          <div 
            className="absolute bottom-0 left-1/2 origin-bottom transition-transform duration-1000 ease-out"
            style={{ 
              transform: `translateX(-50%) rotate(${rotation}deg)`,
              height: '70px',
              width: '4px',
            }}
          >
            <div className="w-full h-full bg-gradient-to-t from-cyan-400 to-transparent rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
          </div>

          {/* Center value */}
          <div className="absolute bottom-2 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {formatCurrency(current)}
            </div>
            <div className="text-xs text-slate-400">
              of {formatCurrency(goal)} goal
            </div>
          </div>
        </div>

        {/* Percentage badge */}
        <div className="flex justify-center mt-2">
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            {percentage.toFixed(1)}% to goal
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

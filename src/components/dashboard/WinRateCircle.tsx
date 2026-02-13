import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface WinRateCircleProps {
  rate: number;
  totalWon: number;
  totalLost: number;
}

export function WinRateCircle({ rate, totalWon, totalLost }: WinRateCircleProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          Win Rate
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex flex-col items-center">
        {/* Circle Progress */}
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(51, 65, 85, 0.5)"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="url(#winRateGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="winRateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{rate}%</span>
            <span className="text-xs text-slate-400">Win Rate</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400">{totalWon}</div>
            <div className="text-xs text-slate-400">Won</div>
          </div>
          <div className="w-px bg-slate-700" />
          <div className="text-center">
            <div className="text-lg font-bold text-rose-400">{totalLost}</div>
            <div className="text-xs text-slate-400">Lost</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

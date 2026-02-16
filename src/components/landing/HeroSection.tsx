import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle2, BarChart3, MessageSquare, Zap, TrendingUp } from 'lucide-react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
}

export function HeroSection({ onStartTrialClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-[#020617]">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#020617] to-[#020617]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Now with Real-Time Buyer Signal Detection</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
              Close 30% More Deals
            </span>
            <br />
            <span className="text-indigo-400">with Zero Extra Effort</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Gong analyzes what happened. We coach your reps while it matters. 
            Real-time AI detects buying signals and whispers exactly what to say next.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              onClick={onStartTrialClick}
              className="group gap-3 font-bold text-lg px-8 py-6 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all shadow-lg shadow-indigo-500/25"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-3 font-bold text-lg px-8 py-6 rounded-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <Play className="h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm">14-day free trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative">
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-2xl blur-3xl opacity-30" />
            
            {/* Dashboard mock */}
            <div className="relative rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-400">
                  <BarChart3 className="h-3 w-3" />
                  Live Dashboard
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-6 grid grid-cols-4 gap-4">
                {/* Sidebar */}
                <div className="col-span-1 space-y-2">
                  <div className="h-8 bg-slate-800 rounded-lg" />
                  <div className="h-20 bg-slate-800/50 rounded-lg" />
                  <div className="h-20 bg-slate-800/50 rounded-lg" />
                  <div className="h-20 bg-slate-800/50 rounded-lg" />
                </div>
                
                {/* Main content */}
                <div className="col-span-3 space-y-4">
                  {/* Metrics row */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Revenue', value: '$127K', color: 'emerald' },
                      { label: 'Deals', value: '24', color: 'blue' },
                      { label: 'Win Rate', value: '34%', color: 'violet' },
                      { label: 'Signals', value: '18', color: 'amber' },
                    ].map((m) => (
                      <div key={m.label} className="bg-slate-800/50 rounded-xl p-4">
                        <p className="text-xs text-slate-500">{m.label}</p>
                        <p className="text-xl font-bold text-white">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Chart area */}
                  <div className="h-48 bg-slate-800/30 rounded-xl border border-slate-700/30 relative overflow-hidden">
                    {/* Fake chart */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-around px-4">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                        <div key={i} className="w-6 bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    {/* Signal overlay */}
                    <div className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-400 font-medium">Live Signal Detected</span>
                    </div>
                  </div>
                  
                  {/* Activity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-indigo-400" />
                        <span className="text-sm font-medium text-slate-300">AI Insight</span>
                      </div>
                      <p className="text-xs text-slate-400">"Acme Corp - Budget authority confirmed. Schedule demo today."</p>
                    </div>
                    <div className="bg-slate-800/30 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-slate-300">Trend</span>
                      </div>
                      <p className="text-xs text-slate-400">Win rate up 12% this month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

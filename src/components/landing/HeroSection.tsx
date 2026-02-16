import { Button } from '@/components/ui/button';
import { ArrowRight, Play, CheckCircle2, BarChart3, MessageSquare, Zap, TrendingUp, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
}

export function HeroSection({ onStartTrialClick }: HeroSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <section className="relative min-h-[90vh] sm:min-h-[80vh] flex items-center overflow-hidden bg-[#020617]">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#020617] to-[#020617]" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }} />

      <div className="container mx-auto px-3 sm:px-4 relative z-10 py-16 sm:py-20">
        {/* Mobile menu button */}
        <button 
          className="sm:hidden absolute top-4 right-4 z-50 p-2 rounded-lg bg-slate-800"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
        </button>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden absolute top-14 right-4 z-50 bg-slate-800 rounded-lg p-4 shadow-xl">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white">Features</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-white">Pricing</a>
            <Button size="sm" onClick={() => { setMobileMenuOpen(false); onStartTrialClick(); }} className="mt-2 w-full">Start Free</Button>
          </div>
        )}

        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6 sm:mb-8">
            <Zap className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
            <span className="text-xs sm:text-sm font-medium text-indigo-300">Now with Real-Time Buyer Signal Detection</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent">
              Close 30% More Deals
            </span>
            <br />
            <span className="text-indigo-400">with Zero Extra Effort</span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-lg text-slate-400 max-w-xl sm:max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2">
            Gong analyzes what happened. We coach your reps while it matters. 
            Real-time AI detects buying signals and whispers exactly what to say next.
          </p>

          {/* CTAs - smaller on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-16 px-2">
            <Button
              size="lg"
              onClick={onStartTrialClick}
              className="group gap-2 sm:gap-3 font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all shadow-lg shadow-indigo-500/25 w-full sm:w-auto"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 sm:gap-3 font-bold text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto"
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-slate-500 px-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              <span className="text-xs sm:text-sm">No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
              <span className="text-xs sm:text-sm">14-day free trial</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm">Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview - simplified for mobile */}
        <div className="mt-12 sm:mt-20 relative px-2 sm:px-0">
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect */}
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 rounded-xl sm:rounded-2xl blur-xl opacity-30" />
            
            {/* Dashboard mock */}
            <div className="relative rounded-xl sm:rounded-2xl border border-slate-700/50 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-2xl min-w-0">
              {/* Browser chrome */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 border-b border-slate-700/50 overflow-x-auto">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500/80 flex-shrink-0" />
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-amber-500/80 flex-shrink-0" />
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-emerald-500/80 flex-shrink-0" />
                <div className="ml-auto flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full bg-slate-800 text-[10px] sm:text-xs text-slate-400 flex-shrink-0">
                  <BarChart3 className="h-3 w-3" />
                  <span className="hidden sm:inline">Live Dashboard</span>
                  <span className="sm:hidden">Live</span>
                </div>
              </div>
              
              {/* Dashboard content */}
              <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                {/* Metrics row - 2x2 on mobile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {[
                    { label: 'Revenue', value: '$127K', color: 'emerald' },
                    { label: 'Deals', value: '24', color: 'blue' },
                    { label: 'Win Rate', value: '34%', color: 'violet' },
                    { label: 'Signals', value: '18', color: 'amber' },
                  ].map((m) => (
                    <div key={m.label} className="bg-slate-800/50 sm:bg-slate-800/50 rounded-lg sm:rounded-xl p-2 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-slate-500">{m.label}</p>
                      <p className="text-base sm:text-xl font-bold text-white">{m.value}</p>
                    </div>
                  ))}
                </div>
                
                {/* Chart area */}
                <div className="h-32 sm:h-48 bg-slate-800/30 rounded-xl border border-slate-700/30 relative overflow-hidden">
                  {/* Fake chart */}
                  <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 flex items-end justify-around px-2 sm:px-4">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <div key={i} className="w-3 sm:w-6 bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  {/* Signal overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 sm:gap-2 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] sm:text-xs text-emerald-400 font-medium">Live Signal</span>
                  </div>
                </div>
                
                {/* Activity - stacked on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-400" />
                      <span className="text-xs sm:text-sm font-medium text-slate-300">AI Insight</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400">Acme Corp - Budget confirmed</p>
                  </div>
                  <div className="bg-slate-800/30 rounded-lg sm:rounded-xl p-2 sm:p-3">
                    <div className="flex items-center gap-2 mb-1 sm:mb-2">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400" />
                      <span className="text-xs sm:text-sm font-medium text-slate-300">Trend</span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-slate-400">Win rate up 12%</p>
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

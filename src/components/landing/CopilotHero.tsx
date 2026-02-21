import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';
import heroDashboard from '@/assets/hero-dashboard.png';

interface CopilotHeroProps {
  onStartTrialClick: () => void;
}

export function CopilotHero({ onStartTrialClick }: CopilotHeroProps) {
  return (
    <section className="relative pt-16">
      {/* Announcement bar */}
      <div className="bg-emerald-500 text-white text-center py-2.5 px-4 text-sm font-medium">
        <span>🚀 Now with Real-Time Buyer Signal Detection — </span>
        <button
          onClick={onStartTrialClick}
          className="underline underline-offset-2 font-semibold hover:text-emerald-100 transition-colors"
        >
          Try it free →
        </button>
      </div>

      <div className="bg-[#0A0A0A]">
        <div className="container mx-auto px-4 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-6 bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xs font-medium text-gray-300">
                  Rated 5.0 by 127+ sales teams
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight mb-6">
                AI Sales Coaching
                <br />
                <span className="text-emerald-400">That Closes Deals</span>
              </h1>

              <p className="text-lg text-gray-400 leading-relaxed mb-8 max-w-lg">
                Real-time AI coaching that listens to every sales call and whispers exactly what to say next. 
                Detect buying signals, handle objections, and close 30% more deals — automatically.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  onClick={onStartTrialClick}
                  className="group gap-3 font-bold text-base px-8 py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onStartTrialClick}
                  className="font-semibold text-base px-8 py-6 border-white/20 text-white hover:bg-white/5 rounded-xl"
                >
                  Watch Demo
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-4">No credit card required · Set up in 2 minutes</p>
            </div>

            {/* Right: Screenshot */}
            <div className="relative">
              <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/5">
                <img
                  src={heroDashboard}
                  alt="SellSig AI sales coaching dashboard showing real-time call analytics and buyer signal detection"
                  className="w-full h-auto"
                />
              </div>
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-2xl blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

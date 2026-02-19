import { Button } from '@/components/ui/button';
import { ArrowRight, Star, TrendingUp, CheckCircle2, Target } from 'lucide-react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
}

export function HeroSection({ onStartTrialClick }: HeroSectionProps) {
  return (
    <section className="relative bg-white pt-16 overflow-hidden">
      {/* Announcement bar */}
      <div className="bg-blue-700 text-white text-center py-2.5 px-4 text-sm font-medium">
        <span>🚀 Now with Real-Time Buyer Signal Detection — </span>
        <button
          onClick={onStartTrialClick}
          className="underline underline-offset-2 font-semibold hover:text-blue-200 transition-colors"
        >
          Try it free →
        </button>
      </div>

      <div className="container mx-auto px-4 pt-16 pb-0 text-center max-w-4xl">
        {/* Star rating badge */}
        <div className="inline-flex items-center gap-2 mb-6">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">
            Voted <span className="text-amber-600">5.0</span> by 127 sales teams
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tight mb-6">
          Close{' '}
          <span className="text-blue-600">30% More Deals</span>
          <br />
          with Real-Time AI Coaching
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Gong analyzes what happened. We coach your reps{' '}
          <strong className="text-gray-800 font-semibold">while it matters.</strong>{' '}
          Real-time AI detects buying signals and whispers exactly what to say next.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button
            size="lg"
            onClick={onStartTrialClick}
            className="group gap-3 font-bold text-lg px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/25 w-full sm:w-auto transition-all"
          >
            Start Free — No Credit Card Required
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Trust stats row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 mb-16 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <TrendingUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span><strong className="text-gray-900 font-semibold">2,500+</strong> calls analyzed daily</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <span>Trusted by <strong className="text-gray-900 font-semibold">100+</strong> sales teams since 2022</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Target className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <span><strong className="text-gray-900 font-semibold">Month-to-month.</strong> No lock-in.</span>
          </div>
        </div>
      </div>

      {/* Blue wave divider */}
      <div className="w-full overflow-hidden leading-[0]">
        <svg
          viewBox="0 0 1440 80"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          className="w-full h-16 sm:h-20"
        >
          <path
            d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z"
            fill="#EFF6FF"
          />
        </svg>
      </div>
    </section>
  );
}

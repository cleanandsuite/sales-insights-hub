import { useConfessionReveal } from '../gsap/useGSAPAnimations';
import { AlertTriangle, Clock, DollarSign, Users, Brain, Target, TrendingDown, Frown } from 'lucide-react';

const confessions = [
  {
    icon: Frown,
    text: "I confess: I've hung up sales calls knowing I could've done better — and said nothing.",
    color: 'text-red-400',
  },
  {
    icon: DollarSign,
    text: "My secret shame: I've lost six-figure deals because I froze when they said 'it's too expensive.'",
    color: 'text-amber-400',
  },
  {
    icon: Clock,
    text: "I admit: I pray my manager doesn't listen to my recorded sales calls.",
    color: 'text-orange-400',
  },
  {
    icon: Users,
    text: "The truth: I watch top performers close deals I could never win — and I don't know why.",
    color: 'text-purple-400',
  },
  {
    icon: Brain,
    text: "I confess: I need AI Coaching because my gut instincts keep failing me.",
    color: 'text-blue-400',
  },
  {
    icon: Target,
    text: "My hidden fear: Without AI Agents whispering the right words, I'm just guessing.",
    color: 'text-pink-400',
  },
  {
    icon: TrendingDown,
    text: "I admit: Every month I miss quota, I die a little inside — and pretend I'm fine.",
    color: 'text-red-500',
  },
  {
    icon: AlertTriangle,
    text: "The truth I hide: I'm terrified that sales calls will expose me as a fraud.",
    color: 'text-yellow-400',
  },
];

export function ConfessionSection() {
  const confessionRef = useConfessionReveal();

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Cracking glass overlay effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>

      {/* Shadow overlays that "crack" as you scroll */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.1)_0%,transparent_50%)] pointer-events-none" />

      <div ref={confessionRef} className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16 space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold uppercase tracking-wider">
              🪞 The Mirror of Truth
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              If You've Ever Felt This Way About{' '}
              <span className="text-red-400">Sales Calls</span>...
              <br />
              <span className="text-white/60 text-2xl md:text-3xl font-medium">
                You're not alone. But you can be free.
              </span>
            </h2>
          </div>

          {/* Confession Cards */}
          <div className="space-y-6">
            {confessions.map((confession, index) => (
              <div
                key={index}
                data-confession
                className="group relative p-6 md:p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:bg-white/[0.07]"
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative flex items-start gap-4 md:gap-6">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${confession.color}`}>
                    <confession.icon className="w-6 h-6" />
                  </div>
                  <p className="text-lg md:text-xl text-white/90 leading-relaxed font-medium">
                    {confession.text}
                  </p>
                </div>
                
                {/* Confession index */}
                <span className="absolute top-4 right-4 text-xs text-white/20 font-mono">
                  #{String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>

          {/* Transition text */}
          <div className="mt-16 text-center">
            <p className="text-2xl md:text-3xl text-white/80 font-light italic">
              "Every confession you nodded to...
              <br />
              <span className="text-emerald-400 font-semibold not-italic">
                is a wound that AI Coaching can heal.
              </span>"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

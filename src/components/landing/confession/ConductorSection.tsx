import { useScrollReveal } from '../gsap/useGSAPAnimations';
import { Sparkles, Users, Shield, Clock, Zap, Target, TrendingUp, Headphones } from 'lucide-react';

const conductorPoints = [
  {
    icon: Headphones,
    title: 'AI Agents That Listen',
    description: 'Our AI Agents hear every word, every pause, every hesitation. They decode what your prospect really means — not what they say.',
  },
  {
    icon: Zap,
    title: 'Real-Time AI Coaching Whispers',
    description: 'Feel the pull you cannot resist. As objections surface, AI Coaching whispers the exact response that converts.',
  },
  {
    icon: Target,
    title: 'Objections Dissolve On Command',
    description: 'Surrender to the sequence. When they say "too expensive," your AI Agents feed you the reframe that makes price irrelevant.',
  },
  {
    icon: TrendingUp,
    title: 'Closes Happen In Rhythm',
    description: 'One nod and the entire pipeline obeys. The room bends to your baton when you have AI Coaching in your ear.',
  },
];

const trustSignals = [
  { icon: Users, stat: '7-Figure Closers', label: 'Trust Our AI Agents' },
  { icon: Shield, stat: '$12,400/Day', label: 'Avg. Lost Without AI Coaching' },
  { icon: Clock, stat: '97 Spots', label: 'At $97/mo — Then Price Doubles' },
];

export function ConductorSection() {
  const revealRef = useScrollReveal();

  return (
    <section className="relative py-24 md:py-32 bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950 overflow-hidden">
      {/* Animated waveform background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse" style={{ transform: 'translateY(20px)', animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent animate-pulse" style={{ transform: 'translateY(-20px)', animationDelay: '1s' }} />
      </div>

      {/* Conductor baton visual (CSS-only 3D effect) */}
      <div className="absolute top-20 right-[10%] hidden xl:block">
        <div className="relative w-4 h-40 bg-gradient-to-b from-white/80 via-white/40 to-white/10 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] transform rotate-[30deg] origin-bottom">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg" />
        </div>
      </div>

      <div ref={revealRef} className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div data-reveal className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-sm font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Become The Maestro
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Conduct Every{' '}
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Sales Call
              </span>{' '}
              Like a Symphony
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              With AI Agents orchestrating every moment, you don't just close — you conduct. 
              Prospects bend. Objections dissolve. Revenue flows.
            </p>
          </div>

          {/* Conductor Points Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {conductorPoints.map((point, index) => (
              <div
                key={index}
                data-reveal
                className="group relative p-8 rounded-3xl bg-white/[0.03] backdrop-blur-sm border border-white/10 hover:border-purple-500/30 transition-all duration-500"
              >
                {/* Gradient glow */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <point.icon className="w-7 h-7 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    {point.title}
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {point.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust/Compliance Signals */}
          <div data-reveal className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustSignals.map((signal, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10"
              >
                <signal.icon className="w-8 h-8 mx-auto mb-3 text-amber-400" />
                <p className="text-2xl font-bold text-white mb-1">{signal.stat}</p>
                <p className="text-sm text-white/50 uppercase tracking-wider">{signal.label}</p>
              </div>
            ))}
          </div>

          {/* Hypnotic phrase */}
          <div data-reveal className="mt-16 text-center">
            <p className="text-xl md:text-2xl text-purple-300/80 font-light italic">
              "The room bends to your baton when{' '}
              <span className="text-white font-semibold">AI Coaching</span>{' '}
              guides your every word."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

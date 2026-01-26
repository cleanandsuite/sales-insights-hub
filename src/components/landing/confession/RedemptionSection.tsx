import { useScrollReveal, useRedemptionRise } from '../gsap/useGSAPAnimations';
import { Check, Gift, Sparkles, Mic, Brain, BarChart3, MessageSquare, Shield, Zap } from 'lucide-react';

const salvationGifts = [
  {
    icon: Mic,
    title: 'Real-Time AI Coaching Whispers',
    description: 'During live sales calls, AI coaching whispers the perfect response into your ear. Never freeze on sales again.',
  },
  {
    icon: Brain,
    title: 'Autonomous AI Intelligence',
    description: 'AI that listens to your calls, analyzes, and provides coaching — all in real-time. Handle objections while focusing on connecting.',
  },
  {
    icon: BarChart3,
    title: 'Post-Call Breakdown & Scoring',
    description: 'Every sales call analyzed. Every weakness exposed. Every strength amplified. AI coaching never stops improving your sales.',
  },
  {
    icon: MessageSquare,
    title: 'Objection Scripts That Convert',
    description: 'When they say "no" on calls, AI coaching knows exactly what to say. Battle-tested responses for every objection in sales.',
  },
  {
    icon: Zap,
    title: 'Instant Deal Intelligence',
    description: 'AI coaching surfaces buying signals you missed on calls. Track competitor mentions. Nothing escapes during sales calls.',
  },
  {
    icon: Shield,
    title: 'Never Miss Another Close',
    description: 'AI coaching prompts your next move on calls. Ensures every sales call ends with clarity, commitment, and momentum.',
  },
];

export function RedemptionSection() {
  const revealRef = useScrollReveal();
  const riseRef = useRedemptionRise();

  return (
    <section 
      ref={riseRef}
      className="relative py-24 md:py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0f172a 0%, #134e4a 50%, #10b981 100%)',
      }}
    >
      {/* Golden light rising effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Upward particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/60 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div ref={revealRef} className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div data-reveal className="text-center mb-16 space-y-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-semibold uppercase tracking-wider">
              <Gift className="w-4 h-4" />
              Your AI Coaching Redemption Awaits
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
              Receive Forgiveness For{' '}
              <span className="text-emerald-300">Every Lost Sales Deal</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Rise redeemed — unbreakable on every sales call. 
              With AI coaching in your ear and intelligence at your side, 
              every sales call becomes a conversion.
            </p>
          </div>

          {/* Salvation Gifts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {salvationGifts.map((gift, index) => (
              <div
                key={index}
                data-reveal
                className="group relative p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-emerald-400/40 transition-all duration-500 hover:bg-white/15"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <gift.icon className="w-6 h-6 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {gift.title}
                    </h3>
                    <p className="text-sm text-white/60 leading-relaxed">
                      {gift.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Ministry moment */}
          <div data-reveal className="text-center p-8 md:p-12 rounded-3xl bg-white/5 backdrop-blur-sm border border-emerald-500/20">
            <Sparkles className="w-12 h-12 mx-auto mb-6 text-emerald-400" />
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              This is NOT software. This is <span className="text-emerald-300">AI coaching salvation</span>.
            </h3>
            <p className="text-lg text-white/70 max-w-2xl mx-auto mb-6">
              AI coaching doesn't just help you sell — it transforms who you are on sales calls.
              It doesn't just listen — it redeems every moment you would've wasted on calls.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Absolution from sales failure', 'Freedom from call fear', 'Dominion over deals'].map((item) => (
                <span key={item} className="flex items-center gap-2 text-emerald-300 font-medium">
                  <Check className="w-5 h-5" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

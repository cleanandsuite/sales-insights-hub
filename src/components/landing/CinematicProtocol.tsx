import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function ConcentricCircles() {
  return (
    <svg viewBox="0 0 200 200" className="w-32 h-32 md:w-48 md:h-48 opacity-20" style={{ animation: 'cin-rotate-slow 20s linear infinite' }}>
      {[30, 50, 70, 90].map((r, i) => (
        <circle key={i} cx="100" cy="100" r={r} fill="none" stroke="hsl(168,76%,40%)" strokeWidth="0.5" opacity={1 - i * 0.2} />
      ))}
    </svg>
  );
}

function LaserScan() {
  return (
    <div className="relative w-32 h-32 md:w-48 md:h-48 overflow-hidden opacity-20">
      {/* Dot grid */}
      <svg viewBox="0 0 200 200" className="w-full h-full">
        {Array.from({ length: 100 }).map((_, i) => (
          <circle key={i} cx={(i % 10) * 20 + 10} cy={Math.floor(i / 10) * 20 + 10} r="2" fill="hsl(263,83%,57%)" opacity="0.4" />
        ))}
      </svg>
      {/* Laser line */}
      <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--cin-purple))] to-transparent" style={{ animation: 'cin-scan 3s linear infinite' }} />
    </div>
  );
}

function EKGWaveform() {
  const path = "M0,50 L20,50 L25,20 L30,80 L35,40 L40,60 L45,50 L60,50 L65,10 L70,90 L75,30 L80,70 L85,50 L100,50 L120,50 L125,15 L130,85 L135,35 L140,65 L145,50 L160,50 L180,50 L185,25 L190,75 L195,45 L200,50";
  return (
    <svg viewBox="0 0 200 100" className="w-40 h-20 md:w-56 md:h-28 opacity-30">
      <path d={path} fill="none" stroke="hsl(168,76%,40%)" strokeWidth="1.5"
        strokeDasharray="500" strokeDashoffset="500"
        style={{ animation: 'cin-ekg 3s linear infinite' }}
      />
    </svg>
  );
}

const steps = [
  {
    num: '01',
    title: 'Pre-Call Intelligence',
    desc: 'AI scans CRM, past calls, and market signals to build a real-time brief before every conversation.',
    viz: <ConcentricCircles />,
    color: 'hsl(var(--cin-teal))',
  },
  {
    num: '02',
    title: 'Live Coaching',
    desc: 'Whisper-mode AI detects sentiment shifts, buying signals, and objections — coaching you in real time.',
    viz: <LaserScan />,
    color: 'hsl(var(--cin-purple))',
  },
  {
    num: '03',
    title: 'Post-Call Analysis',
    desc: 'Automated scoring, deal risk alerts, and improvement plans generated within seconds of hanging up.',
    viz: <EKGWaveform />,
    color: 'hsl(var(--cin-teal))',
  },
];

export function CinematicProtocol() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    // Only enable sticky stacking on desktop
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add('(min-width: 768px)', () => {
        const cards = sectionRef.current?.querySelectorAll('[data-protocol-card]');
        cards?.forEach((card, i) => {
          if (i === 0) return; // first card doesn't need pinning
          ScrollTrigger.create({
            trigger: card,
            start: 'top 20%',
            end: 'bottom top',
            onEnter: () => {
              const prev = cards[i - 1];
              if (prev) {
                gsap.to(prev, { scale: 0.92, filter: 'blur(8px)', opacity: 0.4, duration: 0.6 });
              }
            },
            onLeaveBack: () => {
              const prev = cards[i - 1];
              if (prev) {
                gsap.to(prev, { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.6 });
              }
            },
          });
        });
      });
    }, sectionRef);
    return () => { ctx.revert(); mm.revert(); };
  }, []);

  return (
    <section id="protocol" ref={sectionRef} className="bg-[hsl(var(--cin-bg))] py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <p className="text-[hsl(var(--cin-teal))] text-xs font-mono uppercase tracking-[0.2em] mb-4 text-center">The Protocol</p>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight text-center mb-16">
          Three steps. Zero guesswork.
        </h2>

        <div className="space-y-8 md:space-y-16">
          {steps.map((step, i) => (
            <div
              key={i}
              data-protocol-card
              className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12 transition-all duration-500"
              style={{ position: 'relative', zIndex: steps.length - i }}
            >
              <div className="flex-shrink-0 flex items-center justify-center">
                {step.viz}
              </div>
              <div>
                <span className="text-white/20 font-mono text-sm mb-2 block">{step.num}</span>
                <h3 className="text-white text-2xl md:text-3xl font-bold mb-3" style={{ color: step.color }}>{step.title}</h3>
                <p className="text-white/50 text-base md:text-lg leading-relaxed max-w-lg">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
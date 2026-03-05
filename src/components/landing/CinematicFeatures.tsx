import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, Zap, BarChart3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/* ─── Card 1: Diagnostic Shuffler ─── */
function DiagnosticShuffler() {
  const labels = ['Signal Detection', 'Objection Counter', 'Close Probability'];
  const colors = ['hsl(var(--cin-teal))', 'hsl(var(--cin-purple))', 'hsl(168,76%,50%)'];
  const [order, setOrder] = useState([0, 1, 2]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOrder((prev) => {
        const next = [...prev];
        next.unshift(next.pop()!);
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-48 w-full">
      {order.map((idx, pos) => (
        <div
          key={idx}
          className="absolute left-4 right-4 h-14 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm flex items-center px-5 gap-3"
          style={{
            top: `${pos * 24 + 20}px`,
            zIndex: 3 - pos,
            opacity: 1 - pos * 0.25,
            transform: `scale(${1 - pos * 0.03})`,
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <span className="w-3 h-3 rounded-full" style={{ background: colors[idx] }} />
          <span className="text-white text-sm font-medium">{labels[idx]}</span>
          <span className="ml-auto text-white/40 text-xs font-mono">{(87 + idx * 4).toFixed(1)}%</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Card 2: Telemetry Typewriter ─── */
function TelemetryTypewriter() {
  const messages = [
    '→ Buyer mentioned budget approval timeline...',
    '→ Detected competitive mention: "Gong"...',
    '→ Positive sentiment shift detected (+0.4)...',
    '→ Decision-maker confirmed: VP Sales...',
    '→ Pricing objection pattern identified...',
  ];
  const [lines, setLines] = useState<string[]>([]);
  const [currentMsg, setCurrentMsg] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (currentMsg >= messages.length) {
      const timeout = setTimeout(() => {
        setLines([]);
        setCurrentMsg(0);
        setCharIdx(0);
      }, 2000);
      return () => clearTimeout(timeout);
    }

    const msg = messages[currentMsg];
    if (charIdx < msg.length) {
      const timeout = setTimeout(() => setCharIdx((c) => c + 1), 30);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev.slice(-3), msg]);
        setCurrentMsg((m) => m + 1);
        setCharIdx(0);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [currentMsg, charIdx]);

  const currentText = currentMsg < messages.length ? messages[currentMsg].slice(0, charIdx) : '';

  return (
    <div className="h-48 w-full p-5 flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[hsl(var(--cin-teal))] cin-pulse-dot" />
        <span className="text-[hsl(var(--cin-teal))] text-xs font-mono uppercase tracking-wider">Live Feed</span>
      </div>
      <div className="flex-1 font-mono text-xs text-white/50 space-y-1 overflow-hidden">
        {lines.map((line, i) => (
          <div key={i} className="opacity-50">{line}</div>
        ))}
        {currentMsg < messages.length && (
          <div className="text-white/80">
            {currentText}
            <span className="cin-cursor text-[hsl(var(--cin-teal))]">│</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Card 3: Cursor Protocol Scheduler ─── */
function CursorScheduler() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const [activeDay, setActiveDay] = useState(-1);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0, visible: false });
  const [saved, setSaved] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sequence = [2, 3, 4];
    let step = 0;

    const runStep = () => {
      if (step < sequence.length) {
        const dayIdx = sequence[step];
        setCursorPos({ x: dayIdx * 42 + 20, y: 50, visible: true });
        setTimeout(() => {
          setActiveDay(dayIdx);
          step++;
          setTimeout(runStep, 600);
        }, 400);
      } else {
        setCursorPos({ x: 200, y: 120, visible: true });
        setTimeout(() => {
          setSaved(true);
          setCursorPos((p) => ({ ...p, visible: false }));
          setTimeout(() => {
            setActiveDay(-1);
            setSaved(false);
            step = 0;
            setTimeout(runStep, 1000);
          }, 2000);
        }, 500);
      }
    };

    const timeout = setTimeout(runStep, 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="h-48 w-full p-5 relative" ref={gridRef}>
      <p className="text-white/40 text-xs font-mono uppercase tracking-wider mb-4">Quota Schedule</p>
      <div className="flex gap-3 mb-6">
        {days.map((d, i) => (
          <div
            key={i}
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              activeDay === i || (activeDay > i && [2, 3, 4].includes(i))
                ? 'bg-[hsl(var(--cin-teal))] text-[hsl(var(--cin-bg))] scale-95'
                : 'border border-white/[0.08] text-white/40'
            }`}
          >
            {d}
          </div>
        ))}
      </div>
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-300 ${
          saved
            ? 'bg-[hsl(var(--cin-teal))]/20 text-[hsl(var(--cin-teal))] border border-[hsl(var(--cin-teal))]/30'
            : 'border border-white/[0.08] text-white/30'
        }`}
      >
        {saved ? '✓ Saved' : 'Save'}
      </div>
      {cursorPos.visible && (
        <svg
          className="absolute pointer-events-none transition-all duration-500 ease-out"
          style={{ left: cursorPos.x, top: cursorPos.y }}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M5 3l14 9-6 2-4 7-4-18z" />
        </svg>
      )}
    </div>
  );
}

/* ─── Main Features Section ─── */
export function CinematicFeatures() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const cards = sectionRef.current?.querySelectorAll('[data-feature-card]');
      cards?.forEach((card) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50, scale: 0.96 },
          {
            opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const cards = [
    {
      icon: Activity,
      title: 'Real-Time Whisper Coaching',
      desc: 'AI that listens live and coaches in the moment — keeping reps in flow state and closing more deals.',
      content: <DiagnosticShuffler />,
    },
    {
      icon: Zap,
      title: 'Signal-Powered Playbooks',
      desc: 'Pre-call prep and post-call insights that permanently upgrade every rep\'s performance.',
      content: <TelemetryTypewriter />,
    },
    {
      icon: BarChart3,
      title: 'Transparent Performance Dashboard',
      desc: 'Full-transparency analytics that eliminate bias and accelerate quota attainment.',
      content: <CursorScheduler />,
    },
  ];

  return (
    <section id="features" ref={sectionRef} className="bg-[hsl(var(--cin-bg))] py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[hsl(var(--cin-teal))] text-xs font-mono uppercase tracking-[0.2em] mb-4">Core Features</p>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            Three systems. One outcome.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <div
              key={i}
              data-feature-card
              className="bg-white/[0.03] border border-white/[0.08] rounded-[2rem] overflow-hidden hover:border-white/[0.15] transition-colors duration-500 group"
            >
              <div className="p-6 pb-0">
                <div className="w-10 h-10 rounded-xl bg-[hsl(var(--cin-teal))]/10 flex items-center justify-center mb-4">
                  <card.icon className="w-5 h-5 text-[hsl(var(--cin-teal))]" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{card.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{card.desc}</p>
              </div>
              <div className="mt-4 border-t border-white/[0.06]">
                {card.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

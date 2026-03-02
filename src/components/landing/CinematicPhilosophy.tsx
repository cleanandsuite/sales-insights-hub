import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function CinematicPhilosophy() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      const words = sectionRef.current?.querySelectorAll('[data-word]');
      words?.forEach((word, i) => {
        gsap.fromTo(word,
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, duration: 0.5, ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: `top+=${i * 30} 75%`,
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const splitWords = (text: string) =>
    text.split(' ').map((word, i) => (
      <span key={i} data-word className="inline-block mr-[0.3em] opacity-0">
        {word}
      </span>
    ));

  return (
    <section id="philosophy" ref={sectionRef} className="relative bg-[hsl(var(--cin-bg))] py-32 md:py-44 px-6 md:px-12 overflow-hidden">
      {/* Parallax texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Neutral statement */}
        <div className="mb-12">
          <p className="text-white/30 text-lg md:text-2xl font-light leading-relaxed">
            {splitWords('Most sales tools focus on recording calls and generating reports.')}
          </p>
        </div>

        {/* Bold statement */}
        <div>
          <p className="text-2xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-white/90">
            {splitWords('We focus on winning')}
            <span data-word className="inline-block mr-[0.3em] opacity-0 text-[hsl(var(--cin-teal))]">the</span>
            <span data-word className="inline-block mr-[0.3em] opacity-0 text-[hsl(var(--cin-teal))]">next</span>
            <br className="hidden md:block" />
            <span data-word className="inline-block mr-[0.3em] opacity-0 text-white">30</span>
            <span data-word className="inline-block opacity-0 italic font-light text-white/90">seconds.</span>
          </p>
        </div>
      </div>
    </section>
  );
}
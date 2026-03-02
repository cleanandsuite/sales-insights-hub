import { useScrollReveal } from './gsap/useGSAPAnimations';

const logos = ['Meridian', 'NovaTech', 'Apex Group', 'Fieldlink', 'Orbitco', 'Trellis', 'Vantage'];

export function CinematicLogoBanner() {
  const revealRef = useScrollReveal();

  return (
    <section ref={revealRef} className="py-14 border-t border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-6" data-reveal>
        <p className="text-center text-[11px] font-mono uppercase tracking-[.2em] text-white/30 mb-8">
          Trusted by 2,000+ sales teams worldwide
        </p>
        <div className="flex items-center justify-center gap-10 md:gap-14 flex-wrap">
          {logos.map((name) => (
            <span
              key={name}
              className="text-lg font-bold text-white/[0.12] tracking-[-0.5px] hover:text-white/30 transition-colors duration-300 cursor-default select-none"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

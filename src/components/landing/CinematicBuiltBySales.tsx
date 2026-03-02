import { useScrollReveal } from './gsap/useGSAPAnimations';

export function CinematicBuiltBySales() {
  const revealRef = useScrollReveal();

  return (
    <section ref={revealRef} className="py-28 px-6 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-[radial-gradient(circle,hsl(var(--cin-teal)/0.05),transparent_70%)] pointer-events-none" />

      <div className="max-w-2xl mx-auto text-center relative z-10" data-reveal>
        <h2 className="text-[clamp(32px,4vw,48px)] font-bold tracking-[-1.5px] leading-[1.1] text-white mb-6">
          Built by Sales Reps<br />
          <span className="italic text-white/60">Who Carried the Bag.</span>
        </h2>

        <p className="text-base text-white/50 leading-relaxed mb-10">
          We've lived the 8&nbsp;AM dials that ended in silence, the objections that froze us mid-sentence, the quota pressure that kept us up at night.
          We built SellSig because we needed it — the AI coach we wish we had when every call felt like a fight we were losing alone.
        </p>

        <ul className="space-y-3 text-left max-w-md mx-auto mb-10">
          {[
            'Real-time whispers that keep you in state.',
            'Signal-powered prep before you dial.',
            'Playbooks that make every rep permanently better.',
          ].map((line) => (
            <li key={line} className="flex items-start gap-3 text-sm text-white/50 leading-relaxed">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[hsl(var(--cin-teal))] shrink-0" />
              {line}
            </li>
          ))}
        </ul>

        <p className="text-sm text-white/30 italic leading-relaxed">
          This isn't theory.<br />
          This is battle-tested relief for the people still in the trenches.
        </p>
      </div>
    </section>
  );
}

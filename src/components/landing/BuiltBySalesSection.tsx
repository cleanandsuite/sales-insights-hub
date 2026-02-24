export function BuiltBySalesSection() {
  return (
    <section className="py-24 px-4 md:px-10 bg-[#0A1628] relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(circle,rgba(0,87,255,.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[720px] mx-auto text-center relative z-10">
        <h2 className="font-bricolage text-[clamp(32px,4vw,48px)] font-extrabold leading-[1.12] tracking-[-1.5px] text-white mb-6">
          Built by Sales Reps Who Carried&nbsp;the&nbsp;Bag.
        </h2>

        <p className="text-[17px] md:text-[19px] text-white/70 leading-[1.75] mb-10">
          We've lived the 8&nbsp;AM dials that ended in silence, the objections that froze us mid-sentence, the quota pressure that kept us up at night.
          <br className="hidden md:block" />
          We built SellSig because we needed it — the AI coach we wish we had when every call felt like a fight we were losing alone.
        </p>

        <ul className="space-y-3 text-left max-w-[480px] mx-auto">
          {[
            'Real-time whispers that keep you in state.',
            'Signal-powered prep before you dial.',
            'Playbooks that make every rep permanently better.',
          ].map((line) => (
            <li key={line} className="flex items-start gap-3 text-[15px] text-white/60 leading-[1.6]">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0057FF] shrink-0" />
              {line}
            </li>
          ))}
        </ul>

        <p className="mt-8 text-[15px] text-white/40 italic leading-[1.7]">
          This isn't theory.<br />
          This is battle-tested relief for the people still in the trenches.
        </p>
      </div>
    </section>
  );
}

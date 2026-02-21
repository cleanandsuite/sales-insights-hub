import dashboardPreview from '@/assets/dashboard-preview.jpg';

export function WhySellSig() {
  return (
    <section className="bg-[#0A0A0A] py-24">
      <div className="container mx-auto px-4 text-center max-w-3xl mb-16">
        <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-4">
          Why SellSig?
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
          Stop Reviewing Calls.
          <br />
          Start <span className="text-emerald-400">Winning</span> Them.
        </h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          Most conversation intelligence tools analyze what happened <em>after</em> the call. 
          SellSig coaches your reps <strong className="text-white">in real-time</strong> — detecting buying signals, 
          surfacing objection handlers, and nudging reps toward the close while the prospect is still on the line.
        </p>
      </div>

      <div className="container mx-auto px-4 max-w-5xl">
        <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <img
            src={dashboardPreview}
            alt="SellSig AI sales coaching platform showing real-time conversation intelligence and coaching dashboard"
            className="w-full h-auto"
            loading="lazy"
          />
          <div className="absolute -inset-8 bg-emerald-500/5 rounded-2xl blur-3xl -z-10" />
        </div>
      </div>
    </section>
  );
}

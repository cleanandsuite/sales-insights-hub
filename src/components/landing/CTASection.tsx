interface CTASectionProps {
  onStartTrialClick: () => void;
}

export function CTASection({ onStartTrialClick }: CTASectionProps) {
  return (
    <section className="bg-gradient-to-br from-[#0A1628] via-[#0A1628] to-[#162140] py-24 px-4 md:px-10">
      <div className="max-w-[720px] mx-auto text-center">
        <span className="text-xs font-bold text-[#6B9FFF] tracking-[.08em] uppercase mb-3 block">
          Ready to close more deals?
        </span>
        <h2 className="font-bricolage text-[clamp(36px,4.5vw,56px)] font-extrabold tracking-[-2px] leading-[1.1] text-white mb-4">
          Your AI sales coach<br />is ready to go
        </h2>
        <p className="text-[17px] text-white/50 leading-[1.75] mb-10 max-w-[520px] mx-auto">
          Start your 14-day free trial. Your dedicated phone line is set up in minutes. Full Pro access from day one. No credit card required.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap mb-8">
          <button
            onClick={onStartTrialClick}
            className="bg-white text-[#0A1628] px-8 py-3.5 rounded-[10px] text-[15px] font-bold hover:bg-[#EEF3FF] hover:text-[#0057FF] hover:-translate-y-0.5 transition-all shadow-[0_8px_32px_rgba(255,255,255,.15)] inline-flex items-center gap-2"
          >
            Start free trial →
          </button>
          <a
            href="tel:+18889247731"
            className="border-[1.5px] border-white/20 text-white/70 px-8 py-3 rounded-[10px] text-[15px] font-semibold hover:border-white/50 hover:text-white transition-all inline-flex items-center gap-2"
          >
            📞 Call Enterprise Sales
          </a>
        </div>
        <p className="text-sm text-white/30 font-medium">
          14-day free trial · No credit card · Cancel anytime · Setup in 15 minutes
        </p>
      </div>
    </section>
  );
}

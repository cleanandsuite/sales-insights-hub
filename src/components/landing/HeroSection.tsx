import { Star, Phone, Zap, BarChart3 } from 'lucide-react';
import { useMemo } from 'react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
}

export function HeroSection({ onStartTrialClick }: HeroSectionProps) {
  // Generate waveform bars
  const waveBars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        height: Math.random() * 65 + 20,
        delay: (Math.random() * 1).toFixed(2),
        duration: (0.6 + Math.random() * 0.8).toFixed(2),
      })),
    []
  );

  return (
    <section className="relative pt-[140px] pb-[100px] px-4 md:px-10 overflow-visible">
      {/* Blue gradient blob */}
      <div className="absolute -top-20 -right-[120px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(0,87,255,.07)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto grid md:grid-cols-2 gap-10 md:gap-20 items-center relative">
        {/* Left content */}
        <div>
          {/* ICP pill */}
          <div className="inline-flex items-center gap-2 bg-[#EEF3FF] border border-[#D0DCFF] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#0057FF] tracking-[.04em] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#0057FF] animate-blink" />
            For SDRs, AEs & Revenue Teams
          </div>

          {/* Headline */}
          <h1 className="font-bricolage text-[clamp(44px,4.5vw,64px)] font-extrabold leading-[1.1] tracking-[-2px] text-[#0A1628] mb-6">
            Stop getting ghosted on{' '}
            <span className="text-[#0057FF] relative inline-block">
              sales calls
              <span className="absolute left-0 bottom-[-2px] right-0 h-[3px] bg-[#0057FF] rounded-sm opacity-30" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-[#3B4A63] leading-[1.7] max-w-[480px] mb-10">
            Real-time AI objection handling that turns "no" into "yes" — every single call. Get instant coaching during calls, insights that actually help, and wins that stack up.
          </p>

          {/* CTAs */}
          <div className="flex gap-3 flex-wrap mb-8">
            <button
              onClick={onStartTrialClick}
              className="bg-[#0057FF] text-white px-7 py-3.5 rounded-[10px] text-[15px] font-semibold shadow-[0_2px_12px_rgba(0,87,255,.25)] hover:bg-[#003FBB] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(0,87,255,.35)] transition-all inline-flex items-center gap-2"
            >
              Get Started →
            </button>
            <a
              href="#platform"
              className="bg-white text-[#0A1628] border-[1.5px] border-[#D0D7E6] px-7 py-3 rounded-[10px] text-[15px] font-semibold hover:border-[#0057FF] hover:text-[#0057FF] hover:bg-[#EEF3FF] hover:-translate-y-0.5 transition-all inline-flex items-center gap-2"
            >
              Watch 2-min demo ▶
            </a>
          </div>

          {/* Outcome stats row */}
          <div className="flex items-center gap-5 flex-wrap mb-6">
            {[
              { value: '34%', label: 'more closes' },
              { value: '40%', label: 'faster ramp' },
              { value: '92%', label: 'AI success rate' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="font-bricolage text-lg font-extrabold text-[#0057FF]">{s.value}</span>
                <span className="text-[13px] text-[#6B7A99] font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex">
              {['JR', 'SM', 'DK', 'AW'].map((initials, i) => (
                <div
                  key={initials}
                  className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-bold text-white ${i > 0 ? '-ml-2' : ''}`}
                  style={{
                    background: ['linear-gradient(135deg,#3B6EE8,#6B9FFF)', 'linear-gradient(135deg,#E83B6E,#FF9FBF)', 'linear-gradient(135deg,#1a6b3a,#3BE89A)', 'linear-gradient(135deg,#B54708,#F5A623)'][i],
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div className="flex gap-0.5 text-[#F5A623] text-[13px] tracking-[2px]">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="h-3.5 w-3.5 fill-[#F5A623] text-[#F5A623]" />
              ))}
            </div>
            <span className="text-[13px] text-[#6B7A99] font-medium">
              <strong className="text-[#0A1628] font-semibold">2,000+</strong> sales teams closing more deals
            </span>
          </div>
        </div>

        {/* Right: Dashboard mockup */}
        <div className="relative z-[2] hidden md:block">
          {/* Floating stat pill - Call Score */}
          <div className="absolute -left-8 top-6 bg-white border border-[#E4E8F0] rounded-xl shadow-[0_12px_48px_rgba(10,22,40,.12)] py-3.5 px-[18px] z-10">
            <div className="font-bricolage text-[26px] font-extrabold text-[#0A1628] leading-none">89<small className="text-base">%</small></div>
            <div className="text-[11px] text-[#6B7A99] mt-0.5 font-medium">Call Score</div>
            <div className="text-xs font-semibold text-[#00875A] mt-1 flex items-center gap-1">▲ +12 this week</div>
          </div>

          {/* Floating stat pill - Pro Plan */}
          <div className="absolute -right-4 -bottom-4 bg-white border border-[#E4E8F0] rounded-xl shadow-[0_12px_48px_rgba(10,22,40,.12)] py-3.5 px-[18px] z-10">
            <div className="text-[11px] font-bold text-[#0057FF] tracking-[.06em] uppercase mb-1">Pro Plan</div>
            <div className="font-bricolage text-xl font-extrabold text-[#0A1628] leading-none">15,000 min</div>
            <div className="text-[11px] text-[#6B7A99] mt-0.5 font-medium">+ dedicated number</div>
          </div>

          <div className="bg-white border border-[#E4E8F0] rounded-[20px] shadow-[0_24px_80px_rgba(10,22,40,.14)] overflow-hidden">
            {/* Title bar */}
            <div className="bg-[#F7F9FC] border-b border-[#E4E8F0] px-5 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 bg-white border border-[#E4E8F0] rounded-md px-3 py-1 text-[11px] text-[#6B7A99] max-w-[280px] mx-auto text-center">
                app.sellsig.com/call/live
              </div>
            </div>

            <div className="p-5">
              {/* Live call header */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-bold text-[#0A1628]">Live Call — Meridian Group · Sarah Chen</span>
                <span className="inline-flex items-center gap-1.5 bg-[#E3F5EE] text-[#00875A] text-[11px] font-semibold px-2.5 py-1 rounded-full border border-[rgba(0,135,90,.15)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-blink" />
                  Recording live
                </span>
              </div>

              {/* Waveform */}
              <div className="flex items-center gap-[3px] h-12 bg-[#F7F9FC] rounded-lg px-3 mb-3.5">
                {waveBars.map((bar, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[#D0DCFF] rounded-sm animate-waveform"
                    style={{
                      height: `${bar.height}%`,
                      animationDelay: `${bar.delay}s`,
                      animationDuration: `${bar.duration}s`,
                    }}
                  />
                ))}
              </div>

              {/* Emotion meters */}
              <div className="grid grid-cols-4 gap-2 mb-3.5">
                {[
                  { label: 'Interest', value: 84, color: '#0057FF' },
                  { label: 'Skepticism', value: 32, color: '#D92D20' },
                  { label: 'Trust', value: 71, color: '#0057FF' },
                  { label: 'Urgency', value: 60, color: '#B54708' },
                ].map((e) => (
                  <div key={e.label} className="bg-[#F7F9FC] border border-[#E4E8F0] rounded-lg p-2.5 text-center">
                    <div className="font-bricolage text-[22px] font-bold leading-none" style={{ color: e.color }}>
                      {e.value}
                    </div>
                    <div className="text-[10px] text-[#6B7A99] mt-0.5 font-medium">{e.label}</div>
                  </div>
                ))}
              </div>

              {/* Coaching alert */}
              <div className="bg-[#EEF3FF] border border-[#D0DCFF] rounded-[10px] p-3.5 mb-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-[#0057FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-[.04em]">⚡ Price Objection Detected</span>
                  <span className="text-[11px] text-[#6B7A99]">6:24 into call</span>
                </div>
                <p className="text-[13px] text-[#0A1628] leading-relaxed">
                  <strong className="text-[#0057FF]">Suggested:</strong> "Most clients recover their investment in under 60 days. Can I show you the ROI model based on your team?"
                </p>
              </div>

              {/* Script hints */}
              <div className="space-y-1">
                <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F7F9FC] transition-colors">
                  <div className="w-[22px] h-[22px] rounded-md bg-[#E3F5EE] flex items-center justify-center text-xs shrink-0">🎯</div>
                  <span className="text-xs text-[#3B4A63] leading-snug">
                    <b className="text-[#0A1628] font-semibold">Buying signal</b> — Prospect said "when would we get started?" Move toward close.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#F7F9FC] transition-colors">
                  <div className="w-[22px] h-[22px] rounded-md bg-[#EEF3FF] flex items-center justify-center text-xs shrink-0">📊</div>
                  <span className="text-xs text-[#3B4A63] leading-snug">
                    <b className="text-[#0A1628] font-semibold">Next:</b> Send the 1-page ROI doc on-demand — button ready below.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

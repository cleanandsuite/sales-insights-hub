import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onStartTrialClick: () => void;
  onWatchDemoClick: () => void;
}

export function HeroSection({ onStartTrialClick, onWatchDemoClick }: HeroSectionProps) {
  const logos = [
    'Salesforce', 'HubSpot', 'Stripe', 'Figma', 'Notion', 'Linear',
  ];

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/80 via-white to-white" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-blue-50 via-indigo-50/50 to-transparent rounded-full blur-3xl opacity-60" />

      <div className="relative max-w-[1200px] mx-auto px-6">
        <div className="max-w-[720px] mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0f172a]/[0.04] border border-[#0f172a]/[0.06] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[13px] font-medium text-gray-600">
              Now with real-time AI coaching on every call
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-[40px] md:text-[56px] lg:text-[64px] font-bold text-[#0f172a] leading-[1.08] tracking-[-0.03em] mb-6">
            Turn every conversation{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              into revenue
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-[17px] md:text-[19px] text-gray-500 leading-relaxed max-w-[560px] mx-auto mb-10">
            SellSig is the revenue intelligence platform that coaches your
            reps in real-time, surfaces deal risks before they stall, and
            gives leaders the visibility to forecast with confidence.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            <button
              onClick={onStartTrialClick}
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#0f172a] text-white text-[15px] font-medium rounded-lg hover:bg-[#1e293b] transition-all"
            >
              Start free trial
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={onWatchDemoClick}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 text-gray-600 text-[15px] font-medium rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
            >
              Watch demo
            </button>
          </div>

          {/* Trust line */}
          <p className="text-[13px] text-gray-400 mb-16">
            Free 14-day trial &middot; No credit card required &middot; Setup in 5 minutes
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-8 max-w-[520px] mx-auto mb-20">
            {[
              { value: '40%', label: 'Higher win rates' },
              { value: '2.4x', label: 'Deal velocity' },
              { value: '67%', label: 'Less ramp time' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-[28px] md:text-[32px] font-bold text-[#0f172a] tracking-tight">
                  {stat.value}
                </div>
                <div className="text-[13px] text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Product preview */}
        <div className="relative max-w-[960px] mx-auto">
          <div className="relative rounded-xl border border-gray-200/80 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
                <div className="w-3 h-3 rounded-full bg-gray-200" />
              </div>
              <div className="flex-1 mx-8">
                <div className="max-w-[280px] mx-auto h-6 rounded-md bg-gray-100 flex items-center justify-center">
                  <span className="text-[11px] text-gray-400">app.sellsig.com/dashboard</span>
                </div>
              </div>
            </div>

            {/* Dashboard mockup */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-[#f8fafc] to-white">
              <div className="grid grid-cols-12 gap-4">
                {/* Sidebar hint */}
                <div className="hidden md:block col-span-2">
                  <div className="space-y-3">
                    <div className="h-8 rounded-lg bg-[#0f172a] opacity-90" />
                    <div className="space-y-2 pt-4">
                      {[0.7, 0.5, 0.6, 0.4, 0.55, 0.45].map((w, i) => (
                        <div
                          key={i}
                          className={`h-4 rounded bg-gray-100 ${i === 0 ? 'bg-blue-50' : ''}`}
                          style={{ width: `${w * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main content area */}
                <div className="col-span-12 md:col-span-10">
                  {/* KPI row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Pipeline', value: '$2.4M', change: '+12%', up: true },
                      { label: 'Win Rate', value: '34%', change: '+8%', up: true },
                      { label: 'Avg Deal', value: '$48K', change: '+15%', up: true },
                      { label: 'Forecast', value: '$1.8M', change: '92% conf', up: true },
                    ].map((kpi) => (
                      <div
                        key={kpi.label}
                        className="rounded-lg border border-gray-100 bg-white p-4"
                      >
                        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                          {kpi.label}
                        </div>
                        <div className="text-[20px] font-semibold text-[#0f172a] mt-1">
                          {kpi.value}
                        </div>
                        <div className="text-[12px] font-medium text-emerald-600 mt-0.5">
                          {kpi.change}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Charts row */}
                  <div className="grid grid-cols-5 gap-3">
                    {/* Revenue chart placeholder */}
                    <div className="col-span-3 rounded-lg border border-gray-100 bg-white p-4 h-[160px] flex flex-col">
                      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-auto">
                        Revenue Trend
                      </div>
                      <div className="flex items-end gap-[3px] h-[80px]">
                        {[40, 55, 45, 60, 50, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-sm bg-gradient-to-t from-blue-500 to-blue-400 opacity-80"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* AI coaching card */}
                    <div className="col-span-2 rounded-lg border border-gray-100 bg-white p-4 h-[160px] flex flex-col">
                      <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                        AI Coaching
                      </div>
                      <div className="mt-3 space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <div className="text-[12px] text-gray-600">
                            "Ask about their timeline"
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <div className="text-[12px] text-gray-600">
                            "Mention case study ROI"
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <div className="text-[12px] text-gray-600">
                            "Competitor objection detected"
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-gray-50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[11px] text-emerald-600 font-medium">Live coaching active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtle glow behind the card */}
          <div className="absolute -inset-4 -z-10 rounded-2xl bg-gradient-to-b from-blue-100/40 via-indigo-100/20 to-transparent blur-2xl" />
        </div>

        {/* Logo bar */}
        <div className="mt-20 text-center">
          <p className="text-[12px] font-medium text-gray-400 uppercase tracking-[0.1em] mb-6">
            Trusted by revenue teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {logos.map((name) => (
              <span
                key={name}
                className="text-[15px] font-semibold text-gray-300 tracking-tight"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

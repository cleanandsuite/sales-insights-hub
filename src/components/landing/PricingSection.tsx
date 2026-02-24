import { useState } from 'react';
import { Check, Phone, Users, Shield, Zap, BarChart3, Crown, Star, ArrowRight } from 'lucide-react';

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const handleGetStarted = () => {
    window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank');
  };

  const starterPrice = annual ? 103 : 129;
  const starterPromo = annual ? 79 : 99;
  const proPrice = annual ? 160 : 200;

  const starterFeatures = [
    { text: '1 user seat', bold: true },
    { text: 'Dedicated business phone number', bold: true },
    { text: '2,000 call minutes/month', bold: true },
    { text: 'Call recording & transcription', included: true },
    { text: 'Post-call scoring (40 dimensions)', included: true },
    { text: 'Basic Team Sharing (share calls via link)', included: true },
    { text: 'Export to PDF/CSV (summaries, scores, transcripts)', included: true },
    { text: 'Email Support (48-hour SLA)', included: true },
  ];

  const starterScriptFeature = {
    regular: '50 scripts/month',
    promo: 'Unlimited scripts',
  };

  const proFeatures = [
    { text: '5 user seats', bold: true },
    { text: '5 dedicated US business phone numbers', bold: true },
    { text: '15,000 call minutes/month', bold: true },
    { text: 'Unlimited script generation' },
    { text: 'Live emotion & sentiment detection' },
    { text: 'Real-time objection coaching' },
    { text: 'Full 40-dimension call scoring' },
    { text: 'Team Management Dashboard (manager view)' },
    { text: 'Rank & Stats Leaderboard' },
    { text: 'Role-Based Access (manager vs. rep)' },
    { text: 'Custom Script Templates (team library)' },
    { text: 'Rep growth roadmaps + manager digest' },
    { text: 'Priority Support (24-hour SLA + chat)' },
  ];

  const enterpriseFeatures = [
    'Everything in Pro, plus:',
    'Unlimited seats (volume pricing for 50+)',
    'Custom integrations & offline mode',
    'Enterprise-grade telephony (1-800 support)',
    'Advanced analytics & benchmark comparisons',
    'Revenue intelligence dashboard',
    'SOC 2 Type II compliance (in progress)',
    'Dedicated Account Specialist & CSM',
    '24/7 priority response SLA',
    'Quarterly business reviews',
    'Custom onboarding & optimization',
  ];

  return (
    <section className="py-24 px-4 md:px-10" id="pricing">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-xs font-bold text-[#0057FF] tracking-[.08em] uppercase mb-3 block">
            Transparent Pricing
          </span>
          <h2 className="font-bricolage text-[clamp(34px,3.8vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.1] text-[#0A1628] mb-4">
            Your own AI-powered phone line. <span className="text-[#0057FF]">Finally.</span>
          </h2>
          <p className="text-[17px] text-[#3B4A63] leading-[1.75] max-w-[600px] mx-auto">
            Most reps pay $50–$100/month for just a phone line — no coaching, no scoring, no intelligence. SellSig gives you all of that, plus a dedicated number. <strong className="text-[#0A1628]">This system sells itself.</strong>
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-14 mt-6">
          <span className={`text-sm font-semibold ${!annual ? 'text-[#0A1628]' : 'text-[#3B4A63]'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className="w-11 h-6 bg-[#0057FF] rounded-full relative cursor-pointer"
          >
            <div
              className="w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-[left] duration-200"
              style={{ left: annual ? '23px' : '3px' }}
            />
          </button>
          <span className={`text-sm font-semibold ${annual ? 'text-[#0A1628]' : 'text-[#3B4A63]'}`}>Annual</span>
          <span className="bg-[#E3F5EE] text-[#00875A] border border-[rgba(0,135,90,.2)] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Save 20%
          </span>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-[880px] mx-auto">
          {/* ──── Starter ──── */}
          <div className="bg-white border-[1.5px] border-[#E4E8F0] rounded-[20px] p-10 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(10,22,40,.12)]">
            <span className="text-[11px] font-bold tracking-[.1em] uppercase text-[#0057FF] block mb-2">Starter</span>
            <div className="bg-[#FFF8E1] border border-[#FFD54F] rounded-lg px-3 py-1.5 mb-3 inline-block">
              <span className="text-[11px] font-bold text-[#E65100] uppercase tracking-wide">🔥 New user promo · Only 17 spots left</span>
            </div>
            <div className="font-bricolage text-[#0A1628] leading-none mb-1">
              <span className="text-[28px] font-bold line-through opacity-40 mr-2">
                ${starterPrice}<span className="text-sm font-medium">/mo</span>
              </span>
            </div>
            <div className="font-bricolage text-[64px] font-extrabold tracking-[-3px] leading-none text-[#0A1628]">
              <sup className="text-[22px] font-bold tracking-normal align-super">$</sup>
              {starterPromo}
              <sub className="text-base font-medium tracking-normal opacity-50 font-jakarta">/mo</sub>
            </div>
            <p className="text-[15px] text-[#3B4A63] mt-2.5 mb-5">For individual reps ready to close more with AI coaching + their own phone line.</p>

            {/* Phone line callout */}
            <div className="bg-[#EEF3FF] border border-[#D0DCFF] rounded-[10px] p-3.5 mb-5 flex gap-2.5 items-start">
              <Phone className="w-4 h-4 text-[#0057FF] shrink-0 mt-0.5" />
              <div>
                <span className="text-[13px] font-bold text-[#0057FF] block">Dedicated Phone Number Included</span>
                <span className="text-xs text-[#3B4A63]">2,000 min · your own business line · 99.9% uptime</span>
              </div>
            </div>

            <hr className="border-[#E4E8F0] mb-5" />

            {/* Script promo */}
            <div className="flex gap-2.5 items-start text-sm text-[#3B4A63] mb-2">
              <span className="w-[18px] h-[18px] rounded-full bg-[#EEF3FF] border border-[#D0DCFF] flex items-center justify-center text-[10px] text-[#0057FF] shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5" />
              </span>
              <span>
                Script Builder — <span className="line-through opacity-40">{starterScriptFeature.regular}</span>{' '}
                <strong className="text-[#00875A] font-bold">{starterScriptFeature.promo}</strong>
                <span className="text-[10px] text-[#00875A] font-semibold ml-1">(limited time)</span>
              </span>
            </div>

            <ul className="flex flex-col gap-[11px] mb-9">
              {starterFeatures.map((f) => (
                <li key={f.text} className="flex gap-2.5 items-start text-sm text-[#3B4A63]">
                  <span className="w-[18px] h-[18px] rounded-full bg-[#EEF3FF] border border-[#D0DCFF] flex items-center justify-center text-[10px] text-[#0057FF] shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  {f.bold ? <strong className="text-[#0A1628] font-semibold">{f.text}</strong> : f.text}
                </li>
              ))}
            </ul>

            <button
              onClick={handleGetStarted}
              className="block w-full text-center py-3.5 rounded-[10px] text-sm font-bold bg-[#0057FF] text-white shadow-[0_2px_12px_rgba(0,87,255,.25)] hover:bg-[#003FBB] hover:-translate-y-[1px] hover:shadow-[0_6px_24px_rgba(0,87,255,.35)] transition-all"
            >
              Get Started
            </button>
          </div>

          {/* ──── Pro ──── */}
          <div className="bg-[#0A1628] border-[1.5px] border-transparent rounded-[20px] p-10 relative shadow-[0_24px_80px_rgba(10,22,40,.14)] transition-all duration-200 hover:-translate-y-1.5">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0057FF] text-white text-[11px] font-bold tracking-[.06em] uppercase px-4 py-1.5 rounded-full whitespace-nowrap">
              Most Popular
            </div>
            <span className="text-[11px] font-bold tracking-[.1em] uppercase text-[#6B9FFF] block mb-4">Pro</span>
            <div className="font-bricolage text-[64px] font-extrabold tracking-[-3px] leading-none text-white">
              <sup className="text-[22px] font-bold tracking-normal align-super">$</sup>
              {proPrice}
              <sub className="text-base font-medium tracking-normal opacity-50 font-jakarta">/mo</sub>
            </div>
            <p className="text-[15px] text-white/50 mt-2.5 mb-5">For growing teams — real-time coaching + team visibility that actually improves win rates.</p>

            {/* Phone line callout */}
            <div className="bg-[rgba(107,159,255,.1)] border border-[rgba(107,159,255,.25)] rounded-[10px] p-4 mb-4 flex gap-3 items-start">
              <Phone className="w-5 h-5 text-[#6B9FFF] shrink-0 mt-0.5" />
              <div>
                <span className="text-[13px] font-bold text-[#6B9FFF] block">5 Dedicated Business Phone Lines</span>
                <span className="text-xs text-white/40">15,000 min · 5 users · 5 numbers · 99.9% uptime</span>
              </div>
            </div>

            {/* Bonus promo */}
            <div className="bg-[rgba(255,215,0,.12)] border border-[rgba(255,215,0,.3)] rounded-lg px-3 py-1.5 mb-4 text-center">
              <span className="text-[12px] font-bold text-[#FFD700]">⚡ First 30 days: +5,000 bonus minutes included</span>
            </div>

            {/* CRM preview */}
            <div className="bg-[rgba(107,159,255,.06)] border border-[rgba(107,159,255,.15)] rounded-lg px-3 py-1.5 mb-5 text-center">
              <span className="text-[11px] font-semibold text-[#6B9FFF]/70">🔗 CRM Sync (Salesforce/HubSpot) — coming soon</span>
            </div>

            <hr className="border-white/10 mb-5" />
            <ul className="flex flex-col gap-[11px] mb-7">
              {proFeatures.map((f) => (
                <li key={f.text} className="flex gap-2.5 items-start text-sm text-white/[.65]">
                  <span className="w-[18px] h-[18px] rounded-full bg-[rgba(107,159,255,.15)] border border-[rgba(107,159,255,.3)] flex items-center justify-center text-[10px] text-[#6B9FFF] shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  {f.bold ? <strong className="text-white font-semibold">{f.text}</strong> : f.text}
                </li>
              ))}
            </ul>

            {/* Upgrade teaser */}
            <div className="bg-[rgba(255,255,255,.04)] border border-white/[0.08] rounded-lg px-3 py-2 mb-5 flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-[#FFD700]" />
              <span className="text-[11px] text-white/40">Need unlimited seats & custom integrations? <a href="#enterprise" className="text-[#6B9FFF] font-semibold hover:underline">See Enterprise →</a></span>
            </div>

            <button
              onClick={handleGetStarted}
              className="block w-full text-center py-3.5 rounded-[10px] text-sm font-bold bg-white text-[#0A1628] hover:bg-[#0057FF] hover:text-white transition-all"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* ──── Solo upgrade path banner ──── */}
        <div className="max-w-[880px] mx-auto mt-5">
          <div className="bg-[#EEF3FF] border border-[#D0DCFF] rounded-xl px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <ArrowRight className="w-4 h-4 text-[#0057FF]" />
              <span className="text-sm text-[#0A1628]">
                <strong>Go from solo to team in one click.</strong> Upgrade to Pro anytime — your data carries over.
              </span>
            </div>
            <span className="bg-[#E3F5EE] text-[#00875A] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[rgba(0,135,90,.2)]">
              No migration needed
            </span>
          </div>
        </div>

        {/* ──── Enterprise ──── */}
        <div className="max-w-[880px] mx-auto mt-5 bg-gradient-to-br from-[#0A1628] to-[#111D33] border-[1.5px] border-[rgba(107,159,255,.2)] rounded-[20px] p-8 md:p-10 relative overflow-hidden" id="enterprise">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#0057FF]/5 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-3">
              <Shield className="w-5 h-5 text-[#6B9FFF]" />
              <span className="text-[11px] font-bold tracking-[.1em] uppercase text-[#6B9FFF]">Enterprise</span>
            </div>
            <h3 className="font-bricolage text-[26px] md:text-[30px] font-extrabold text-white tracking-[-0.5px] mb-2">
              Built for scaling revenue teams that demand the best.
            </h3>
            <p className="text-[15px] text-white/50 mb-6 max-w-[600px]">
              Enterprise-grade security, customization, and dedicated support. Proven to deliver 25–40% faster rep ramp times.
            </p>

            <div className="grid md:grid-cols-2 gap-x-8 gap-y-2.5 mb-8">
              {enterpriseFeatures.map((f, i) => (
                <div key={f} className={`flex gap-2.5 items-start text-sm ${i === 0 ? 'text-[#6B9FFF] font-bold md:col-span-2 mb-1' : 'text-white/60'}`}>
                  {i > 0 && (
                    <span className="w-[18px] h-[18px] rounded-full bg-[rgba(107,159,255,.15)] border border-[rgba(107,159,255,.3)] flex items-center justify-center text-[10px] text-[#6B9FFF] shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                  <span>{f}</span>
                </div>
              ))}
            </div>

            {/* Pricing note */}
            <div className="bg-[rgba(107,159,255,.08)] border border-[rgba(107,159,255,.2)] rounded-xl px-5 py-3.5 mb-6">
              <p className="text-[13px] text-white/60">
                <strong className="text-white">Starting at $199/user/month</strong> (billed annually) · Volume discounts at scale · Minimum 10 seats · Annual commitment preferred
              </p>
              <p className="text-[11px] text-white/35 mt-1">All features included — no hidden fees for seats, integrations, or support.</p>
            </div>

            {/* Compliance badge */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,.04)] border border-white/[0.08] rounded-full px-3 py-1.5">
                <Shield className="w-3 h-3 text-[#00875A]" />
                <span className="text-[11px] font-semibold text-white/50">SOC 2 Type II in progress</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[rgba(255,255,255,.04)] border border-white/[0.08] rounded-full px-3 py-1.5">
                <Star className="w-3 h-3 text-[#FFD700]" />
                <span className="text-[11px] font-semibold text-white/50">99.9% uptime SLA</span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <a href="tel:+18889247731" className="bg-white text-[#0A1628] px-6 py-3.5 rounded-[10px] text-sm font-bold hover:bg-[#0057FF] hover:text-white transition-all inline-flex items-center gap-2 whitespace-nowrap">
                <Phone className="w-4 h-4" />
                Call Sales: (888) 924-7731
              </a>
              <a href="mailto:sales@sellsig.com" className="border-[1.5px] border-[rgba(107,159,255,.3)] text-[#6B9FFF] px-5 py-3 rounded-[10px] text-sm font-semibold hover:border-[#6B9FFF] hover:bg-[rgba(107,159,255,.08)] transition-all">
                Request a Demo →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

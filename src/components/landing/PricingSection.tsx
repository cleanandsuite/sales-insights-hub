import { useState } from 'react';
import { Check, X, Shield, Users, Phone, BarChart3, HeadphonesIcon } from 'lucide-react';

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const handleGetStarted = () => {
    window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank');
  };

  const starterRegular = annual ? 103 : 129;
  const starterPromo = annual ? 79 : 99;
  const proPrice = annual ? 200 : 250;

  const starterFeatures = [
    { text: '1 user seat', included: true, bold: true },
    { text: 'Dedicated US business phone number', included: true, bold: true },
    { text: '2,000 call minutes/month', included: true, bold: true },
    { text: 'Unlimited scripts (limited time)', included: true },
    { text: 'Call recording & transcription', included: true },
    { text: 'Basic post-call scoring', included: true },
    { text: 'Basic team sharing (link-based)', included: true },
    { text: 'Export to PDF/CSV', included: true },
    { text: 'Email support (48-hr SLA)', included: true },
    { text: 'Team dashboard & leaderboard', included: false },
    { text: 'Real-time coaching prompts', included: false },
  ];

  const proFeatures = [
    { text: '5 user seats', bold: true },
    { text: 'Dedicated US business phone number', bold: true },
    { text: '15,000 call minutes/month', bold: true },
    { text: 'Unlimited script generation' },
    { text: 'Live emotion & sentiment detection' },
    { text: 'Real-time objection coaching' },
    { text: 'Full 40-dimension call scoring' },
    { text: 'Team management dashboard' },
    { text: 'Rank & stats leaderboard' },
    { text: 'Role-based access (manager vs. rep)' },
    { text: 'Custom script templates (team library)' },
    { text: 'Priority support (24-hr SLA + chat)' },
    { text: 'CRM sync (Salesforce, HubSpot)' },
  ];

  const enterpriseFeatures = [
    { icon: BarChart3, title: 'Gamified Performance Ranking System', desc: 'Leaderboards and achievement mechanics drive 300–400% faster skill adoption and create a high-energy, merit-based culture where performance is visible and celebrated.' },
    { icon: Shield, title: '5 Distinct Elite AI Coaching Systems', desc: 'Adaptive coaching engines matched to individual learning styles — visual, auditory, kinesthetic, reading/writing, and analytical — ensuring every rep receives training that resonates and sticks.' },
    { icon: Users, title: 'Full-Transparency Management Dashboard', desc: 'Complete visibility into rep activity, time allocation, call performance, and skill progression. Objective, numbers-driven insights eliminate subjectivity and bias.' },
    { icon: HeadphonesIcon, title: 'Enterprise-Grade Customization & Support', desc: 'Dedicated Account Specialist, priority 24/7 response SLA, quarterly business reviews, custom integrations, and flexible seat scaling.' },
  ];

  return (
    <section className="py-24 px-4 md:px-10" id="pricing">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-4">
           <span className="text-xs font-bold text-[#0057FF] tracking-[.08em] uppercase mb-3 block">
            Transparent Pricing
          </span>
          <h2 className="font-bricolage text-[clamp(34px,3.8vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.1] text-[#0A1628] mb-4">
            Simple pricing. <span className="text-[#0057FF]">Serious ROI.</span>
          </h2>
          <p className="text-[17px] text-[#3B4A63] leading-[1.75] max-w-[520px] mx-auto">
            Every plan includes a dedicated business phone line with live AI coaching. Teams see 34% more closes within 90 days — or we'll work with you until you do.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-14 mt-4">
          <span className={`text-sm font-semibold ${!annual ? 'text-[#0A1628]' : 'text-[#3B4A63]'}`}>Monthly</span>
          <button
            onClick={() => setAnnual(!annual)}
            className="w-11 h-6 bg-[#0057FF] rounded-full relative cursor-pointer">
            <div
              className="w-[18px] h-[18px] bg-white rounded-full absolute top-[3px] transition-[left] duration-200"
              style={{ left: annual ? '23px' : '3px' }} />
          </button>
          <span className={`text-sm font-semibold ${annual ? 'text-[#0A1628]' : 'text-[#3B4A63]'}`}>Annual</span>
          <span className="bg-[#E3F5EE] text-[#00875A] border border-[rgba(0,135,90,.2)] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            Save 20%
          </span>
        </div>

        {/* Starter + Pro Cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-[880px] mx-auto">
          {/* Starter */}
          <div className="bg-white border-[1.5px] border-[#E4E8F0] rounded-[20px] p-10 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(10,22,40,.12)]">
            <span className="text-[11px] font-bold tracking-[.1em] uppercase text-[#0057FF] block mb-2">Starter</span>
            <div className="bg-[#FFF8E1] border border-[#FFD54F] rounded-lg px-3 py-1.5 mb-3 inline-block">
              <span className="text-[11px] font-bold text-[#E65100] uppercase tracking-wide">🔥 New user promo · Only 17 spots left</span>
            </div>
            <div className="font-bricolage text-[#0A1628] leading-none mb-1">
              <span className="text-[28px] font-bold line-through opacity-40 mr-2">
                ${starterRegular}<span className="text-sm font-medium">/mo</span>
              </span>
            </div>
            <div className="font-bricolage text-[64px] font-extrabold tracking-[-3px] leading-none text-[#0A1628]">
              <sup className="text-[22px] font-bold tracking-normal align-super">$</sup>
              {starterPromo}
              <sub className="text-base font-medium tracking-normal opacity-50 font-jakarta">/mo</sub>
            </div>
            <p className="text-[15px] text-[#3B4A63] mt-2.5 mb-7">For individual reps ready to close more with AI coaching + their own phone line.</p>
            {/* Phone highlight */}
            <div className="bg-[#EEF3FF] border border-[#D0DCFF] rounded-[10px] p-3.5 mb-6 flex gap-3 items-start">
              <span className="text-lg shrink-0">📞</span>
              <div>
                <span className="text-[12px] font-bold text-[#0057FF] block">Your Own Business Phone Line</span>
                <span className="text-[11px] text-[#3B4A63]">2,000 min · Dedicated number · 99.9% uptime</span>
              </div>
            </div>
            <hr className="border-[#E4E8F0] mb-6" />
            <ul className="flex flex-col gap-[11px] mb-9">
              {starterFeatures.map((f) =>
                <li key={f.text} className="flex gap-2.5 items-start text-sm text-[#3B4A63]">
                  {f.included ?
                    <span className="w-[18px] h-[18px] rounded-full bg-[#EEF3FF] border border-[#D0DCFF] flex items-center justify-center text-[10px] text-[#0057FF] shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span> :
                    <span className="w-[18px] h-[18px] rounded-full bg-[#F7F9FC] border border-[#E4E8F0] flex items-center justify-center text-[10px] text-[#6B7A99] shrink-0 mt-0.5 opacity-30">
                      <X className="w-2.5 h-2.5" />
                    </span>
                  }
                  <span className={f.included ? '' : 'opacity-40'}>{f.bold ? <strong className="text-[#0A1628] font-semibold">{f.text}</strong> : f.text}</span>
                </li>
              )}
            </ul>
            <button
              onClick={handleGetStarted}
              className="block w-full text-center py-3.5 rounded-[10px] text-sm font-bold bg-[#0057FF] text-white shadow-[0_2px_12px_rgba(0,87,255,.25)] hover:bg-[#003FBB] hover:-translate-y-[1px] hover:shadow-[0_6px_24px_rgba(0,87,255,.35)] transition-all">
              Get Started
            </button>
          </div>

          {/* Pro */}
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
            <p className="text-[15px] text-white/50 mt-2.5 mb-7">For growing teams — real-time coaching + team visibility that actually improves win rates.</p>
            {/* Phone highlight */}
            <div className="bg-[rgba(107,159,255,.1)] border border-[rgba(107,159,255,.25)] rounded-[10px] p-4 mb-4 flex gap-3 items-start">
              <span className="text-xl shrink-0">📞</span>
              <div>
                <span className="text-[13px] font-bold text-[#6B9FFF] block">Dedicated Business Phone Line Included</span>
                <span className="text-xs text-white/40">15,000 min · 5 users · Dedicated number · 99.9% uptime</span>
              </div>
            </div>
            <div className="bg-[rgba(255,215,0,.12)] border border-[rgba(255,215,0,.3)] rounded-lg px-3 py-1.5 mb-4 text-center">
              <span className="text-[12px] font-bold text-[#FFD700]">⚡ First 30 days: +5,000 bonus minutes included</span>
            </div>
            <div className="bg-[rgba(0,200,120,.1)] border border-[rgba(0,200,120,.25)] rounded-lg px-3 py-1.5 mb-6 text-center">
              <span className="text-[11px] font-bold text-[#00C878]">🔗 CRM Sync: Salesforce & HubSpot — coming soon</span>
            </div>
            <hr className="border-white/10 mb-6" />
            <ul className="flex flex-col gap-[11px] mb-9">
              {proFeatures.map((f) =>
                <li key={f.text} className="flex gap-2.5 items-start text-sm text-white/[.65]">
                  <span className="w-[18px] h-[18px] rounded-full bg-[rgba(107,159,255,.15)] border border-[rgba(107,159,255,.3)] flex items-center justify-center text-[10px] text-[#6B9FFF] shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  {f.bold ? <strong className="text-white font-semibold">{f.text}</strong> : f.text}
                </li>
              )}
            </ul>
            <button
              onClick={handleGetStarted}
              className="block w-full text-center py-3.5 rounded-[10px] text-sm font-bold bg-white text-[#0A1628] hover:bg-[#0057FF] hover:text-white transition-all">
              Get Started
            </button>
            <p className="text-[11px] text-white/30 text-center mt-3">Go from solo to team in one click →</p>
          </div>
        </div>

        {/* Enterprise Plan — Full Card */}
        <div className="max-w-[880px] mx-auto mt-8 bg-gradient-to-br from-[#0A1628] to-[#162240] border-[1.5px] border-[#1E3260] rounded-[20px] p-8 md:p-12 relative overflow-hidden" id="enterprise">
          {/* Subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0057FF]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 relative z-10">
            {/* Left: Header + CTA */}
            <div className="md:w-[340px] shrink-0">
              <span className="text-[11px] font-bold tracking-[.1em] uppercase text-[#6B9FFF] block mb-2">Enterprise Plan</span>
              <h3 className="font-bricolage text-[28px] md:text-[32px] font-extrabold text-white tracking-[-1px] leading-[1.15] mb-3">
                Tailored for scaling revenue organizations
              </h3>
              <p className="text-[14px] text-white/50 leading-[1.7] mb-6">
                Advanced performance transparency, accelerated team development, and maximum coaching flexibility. Everything in Pro, plus:
              </p>

              <p className="text-[13px] text-white/40 mb-6">Minimum 10 seats · Custom pricing & contract terms</p>

              <div className="flex flex-col gap-2.5">
                <a href="tel:+18889247731" className="bg-[#0057FF] text-white px-6 py-3.5 rounded-[10px] text-sm font-bold hover:bg-[#003FBB] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shadow-[0_2px_12px_rgba(0,87,255,.3)]">
                  📞 Contact Sales
                </a>
                <a href="mailto:sales@sellsig.com" className="border-[1.5px] border-white/15 text-white/70 px-5 py-2.5 rounded-[10px] text-sm font-semibold hover:border-[#6B9FFF] hover:text-[#6B9FFF] transition-all text-center">
                  Request a personalized demo →
                </a>
              </div>
            </div>

            {/* Right: Feature Grid */}
            <div className="flex-1 grid sm:grid-cols-2 gap-5">
              {enterpriseFeatures.map((f) => (
                <div key={f.title} className="flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg bg-[rgba(107,159,255,.12)] border border-[rgba(107,159,255,.2)] flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon className="w-4 h-4 text-[#6B9FFF]" />
                  </div>
                  <div>
                    <span className="text-[13px] font-bold text-white block mb-1">{f.title}</span>
                    <span className="text-[12px] text-white/40 leading-[1.6]">{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance badge */}
          <div className="mt-8 pt-6 border-t border-white/8 flex flex-wrap items-center gap-4 relative z-10">
            <div className="flex items-center gap-2 bg-[rgba(107,159,255,.08)] border border-[rgba(107,159,255,.15)] rounded-lg px-3 py-1.5">
              <Shield className="w-3.5 h-3.5 text-[#6B9FFF]" />
              <span className="text-[11px] font-bold text-[#6B9FFF]">SOC 2 Type II in progress</span>
            </div>
            <span className="text-[11px] text-white/25">Custom pricing & contract terms — no hidden fees for seats, integrations, or support.</span>
          </div>
        </div>

        {/* ROI note */}
        <div className="max-w-[880px] mx-auto mt-6 text-center">
          <p className="text-[13px] text-[#3B4A63]">
            <span className="font-semibold text-[#0A1628]">Proven 25–40% faster rep ramp.</span> SellSig customers report higher win rates and shorter sales cycles within 30 days.
          </p>
        </div>
      </div>
    </section>
  );
}

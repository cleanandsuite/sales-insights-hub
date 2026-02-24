import { useState } from 'react';
import { Check, X } from 'lucide-react';

export function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const handleStartTrial = () => {
    window.open('https://buy.stripe.com/fZu6oG1zi7O7euubi69k400', '_blank');
  };

  const starterPrice = annual ? 63 : 79;
  const proPrice = annual ? 160 : 200;

  const starterFeatures = [
    { text: '1 user seat', included: true, bold: true },
    { text: 'Script Builder — 10 scripts/month', included: true },
    { text: 'Call recording & transcription', included: true },
    { text: 'Basic post-call scoring', included: true },
    { text: '500 call minutes/month', included: true },
    { text: 'Dedicated phone number', included: false },
    { text: 'Live emotion detection', included: false },
    { text: 'Real-time coaching prompts', included: false },
  ];

  const proFeatures = [
    { text: '3 user seats', bold: true },
    { text: 'Dedicated US business phone number', bold: true },
    { text: '5,000 call minutes/month', bold: true },
    { text: 'Unlimited script generation' },
    { text: 'Live emotion & sentiment detection' },
    { text: 'Real-time objection coaching' },
    { text: 'Full 40-dimension call scoring' },
    { text: 'Rep growth roadmaps + manager digest' },
    { text: 'CRM integrations (Salesforce, HubSpot)' },
  ];

  return (
    <section className="py-24 px-4 md:px-10" id="pricing">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-4">
          <span className="text-xs font-bold text-[#0057FF] tracking-[.08em] uppercase mb-3 block">
            Transparent Pricing
          </span>
          <h2 className="font-bricolage text-[clamp(34px,3.8vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.1] text-[#0A1628] mb-4">
            Simple pricing. <span className="text-[#0057FF]">No surprises.</span>
          </h2>
          <p className="text-[17px] text-[#3B4A63] leading-[1.75] max-w-[520px] mx-auto">
            Everything your team needs to close more deals, in one plan. No hidden fees, no per-minute charges, no feature gates.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-14 mt-4">
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
          {/* Starter */}
          <div className="bg-white border-[1.5px] border-[#E4E8F0] rounded-[20px] p-10 relative transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_48px_rgba(10,22,40,.12)]">
            <span className="text-[11px] font-bold tracking-[.1em] uppercase text-[#0057FF] block mb-4">Starter</span>
            <div className="font-bricolage text-[64px] font-extrabold tracking-[-3px] leading-none text-[#0A1628]">
              <sup className="text-[22px] font-bold tracking-normal align-super">$</sup>
              {starterPrice}
              <sub className="text-base font-medium tracking-normal opacity-50 font-jakarta">/mo</sub>
            </div>
            <p className="text-[15px] text-[#3B4A63] mt-2.5 mb-7">For individual reps getting started with AI coaching.</p>
            <hr className="border-[#E4E8F0] mb-6" />
            <ul className="flex flex-col gap-[11px] mb-9">
              {starterFeatures.map((f) => (
                <li key={f.text} className="flex gap-2.5 items-start text-sm text-[#3B4A63]">
                  {f.included ? (
                    <span className="w-[18px] h-[18px] rounded-full bg-[#EEF3FF] border border-[#D0DCFF] flex items-center justify-center text-[10px] text-[#0057FF] shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  ) : (
                    <span className="w-[18px] h-[18px] rounded-full bg-[#F7F9FC] border border-[#E4E8F0] flex items-center justify-center text-[10px] text-[#6B7A99] shrink-0 mt-0.5 opacity-30">
                      <X className="w-2.5 h-2.5" />
                    </span>
                  )}
                  <span className={f.included ? '' : 'opacity-40'}>{f.bold ? <strong className="text-[#0A1628] font-semibold">{f.text}</strong> : f.text}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={handleStartTrial}
              className="block w-full text-center py-3.5 rounded-[10px] text-sm font-bold bg-[#0057FF] text-white shadow-[0_2px_12px_rgba(0,87,255,.25)] hover:bg-[#003FBB] hover:-translate-y-[1px] hover:shadow-[0_6px_24px_rgba(0,87,255,.35)] transition-all"
            >
              Start free — 14 days
            </button>
          </div>

          {/* Pro */}
          <div className="bg-[#0A1628] border-[1.5px] border-transparent rounded-[20px] p-10 relative shadow-[0_24px_80px_rgba(10,22,40,.14)] transition-all duration-200 hover:-translate-y-1.5">
            {/* Most Popular badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0057FF] text-white text-[11px] font-bold tracking-[.06em] uppercase px-4 py-1.5 rounded-full whitespace-nowrap">
              Most Popular
            </div>
            <span className="text-[11px] font-bold tracking-[.1em] uppercase text-[#6B9FFF] block mb-4">Pro</span>
            <div className="font-bricolage text-[64px] font-extrabold tracking-[-3px] leading-none text-white">
              <sup className="text-[22px] font-bold tracking-normal align-super">$</sup>
              {proPrice}
              <sub className="text-base font-medium tracking-normal opacity-50 font-jakarta">/mo</sub>
            </div>
            <p className="text-[15px] text-white/50 mt-2.5 mb-7">The complete SellSig platform for your whole team.</p>
            {/* Phone highlight */}
            <div className="bg-[rgba(107,159,255,.1)] border border-[rgba(107,159,255,.25)] rounded-[10px] p-4 mb-6 flex gap-3 items-start">
              <span className="text-xl shrink-0">📞</span>
              <div>
                <span className="text-[13px] font-bold text-[#6B9FFF] block">Dedicated Business Phone Line Included</span>
                <span className="text-xs text-white/40">5,000 min · 3 users · 1 dedicated number · 99.9% uptime</span>
              </div>
            </div>
            <hr className="border-white/10 mb-6" />
            <ul className="flex flex-col gap-[11px] mb-9">
              {proFeatures.map((f) => (
                <li key={f.text} className="flex gap-2.5 items-start text-sm text-white/[.65]">
                  <span className="w-[18px] h-[18px] rounded-full bg-[rgba(107,159,255,.15)] border border-[rgba(107,159,255,.3)] flex items-center justify-center text-[10px] text-[#6B9FFF] shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  {f.bold ? <strong className="text-white font-semibold">{f.text}</strong> : f.text}
                </li>
              ))}
            </ul>
            <button
              onClick={handleStartTrial}
              className="block w-full text-center py-3.5 rounded-[10px] text-sm font-bold bg-white text-[#0A1628] hover:bg-[#0057FF] hover:text-white transition-all"
            >
              Start free — 14 days
            </button>
          </div>
        </div>

        {/* Enterprise row */}
        <div className="max-w-[880px] mx-auto mt-5 bg-[#F7F9FC] border-[1.5px] border-[#E4E8F0] rounded-[20px] p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" id="enterprise">
          <div>
            <div className="text-[11px] font-bold tracking-[.1em] uppercase text-[#0057FF] mb-1.5">Enterprise</div>
            <h3 className="font-bricolage text-[22px] font-extrabold text-[#0A1628] tracking-[-0.5px] mb-1.5">Need a full-scale revenue intelligence system?</h3>
            <p className="text-sm text-[#3B4A63]">Custom seats, unlimited minutes, white-glove onboarding, SSO, private cloud, and a dedicated success team. Built around your revenue motion.</p>
          </div>
          <div className="flex gap-2.5 flex-wrap shrink-0">
            <a href="tel:+18889247731" className="bg-[#0A1628] text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-[#0057FF] transition-colors inline-flex items-center gap-1.5 whitespace-nowrap">
              📞 Call us to discuss
            </a>
            <a href="#" className="border-[1.5px] border-[#D0D7E6] text-[#0A1628] px-5 py-2.5 rounded-lg text-sm font-semibold hover:border-[#0057FF] hover:text-[#0057FF] transition-all">
              Learn more →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

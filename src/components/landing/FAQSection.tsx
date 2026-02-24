import { useState } from 'react';

const faqs = [
  {
    q: "What's included with the dedicated phone line?",
    a: "Every Pro plan includes one dedicated US business phone number with 5,000 minutes per month shared across your 3 user seats. Calls are automatically routed through SellSig AI for real-time coaching and are recorded, transcribed, and analyzed automatically. Additional minutes are available at simple per-minute rates with no contracts.",
  },
  {
    q: 'How does the SWOT-driven script builder work?',
    a: "You provide your company's strengths, weaknesses, and your target prospect's profile (industry, size, pain points, known objections). SellSig AI cross-references this against its trained sales model to generate a full call script — opening, discovery questions, value positioning, pre-emptive objection handling, and suggested close. Scripts update automatically as you refine your competitive data.",
  },
  {
    q: 'Is the live coaching visible to my prospect?',
    a: "Never. Live coaching cards appear only in the rep's browser overlay or mobile sidebar. Your prospect hears nothing and sees nothing from their side of the call. From their perspective, your rep sounds exceptionally well-prepared and naturally responsive — because they are.",
  },
  {
    q: 'What CRMs and tools does SellSig integrate with?',
    a: 'SellSig integrates natively with Salesforce, HubSpot, Pipedrive, and Zoho CRM. We also connect with Zoom, Google Meet, and most VOIP platforms via our API. On the Pro plan, SellSig replaces your need for a separate dialer with the included phone line. Enterprise clients can request custom integrations and webhook-based automations.',
  },
  {
    q: 'How is Enterprise different from Pro?',
    a: 'Enterprise is for revenue organizations with 10+ reps, advanced security requirements, or custom automation needs. It includes unlimited seats, unlimited call minutes, custom AI model fine-tuning on your specific product and playbook, SSO and SAML support, private cloud deployment options, a dedicated Customer Success Engineer, and a guaranteed uptime SLA. Pricing is custom — call us.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-20 px-4 bg-[#F7F9FC] border-t border-[#E4E8F0]">
      <div className="max-w-[760px] mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#0057FF] tracking-[.08em] uppercase mb-3 block">FAQ</span>
          <h2 className="font-bricolage text-[clamp(34px,3.8vw,52px)] font-extrabold tracking-[-1.5px] leading-[1.1] text-[#0A1628]">
            Common questions
          </h2>
        </div>
        <div className="space-y-2.5">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`bg-white border rounded-xl overflow-hidden transition-shadow ${
                  isOpen ? 'shadow-[0_4px_16px_rgba(10,22,40,.08)] border-[#D0DCFF]' : 'border-[#E4E8F0] hover:shadow-[0_1px_3px_rgba(10,22,40,.06)]'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : i)}
                  className="flex items-center justify-between w-full px-6 py-5 text-left"
                >
                  <span className="text-[15px] font-semibold text-[#0A1628] pr-4">{faq.q}</span>
                  <span
                    className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center shrink-0 text-base transition-all ${
                      isOpen
                        ? 'bg-[#0057FF] border-[#0057FF] text-white rotate-45'
                        : 'border-[#D0D7E6] text-[#6B7A99]'
                    }`}
                  >
                    +
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[200px] pb-5 px-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-sm text-[#3B4A63] leading-[1.75]">{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

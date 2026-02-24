import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How long does it take to set up SellSig?',
    answer:
      'Most teams are fully operational within 30 minutes. Connect your CRM, install the browser extension or desktop app, and your reps start receiving AI coaching on their next call. No engineering resources required.',
  },
  {
    question: 'How does the AI coaching work during a live call?',
    answer:
      'SellSig listens to the conversation in real-time and surfaces contextual coaching prompts on screen. When a prospect raises an objection, mentions a competitor, or shows buying signals, the AI provides suggested responses and next-step recommendations. Reps see the prompts — the prospect does not.',
  },
  {
    question: 'What integrations do you support?',
    answer:
      'SellSig integrates natively with Salesforce, HubSpot, Pipedrive, Microsoft Dynamics, and 50+ other tools. Call data, coaching insights, and deal intelligence flow bi-directionally into your existing workflow. Custom integrations are available on Enterprise plans via our API.',
  },
  {
    question: 'Is my call data secure?',
    answer:
      'SellSig is SOC 2 Type II certified with 256-bit AES encryption at rest and TLS 1.3 in transit. All data is processed in isolated environments with strict access controls. We are fully GDPR compliant and offer data residency options for EU customers. Enterprise customers can deploy in dedicated infrastructure.',
  },
  {
    question: 'What makes SellSig different from Gong or Chorus?',
    answer:
      'Unlike legacy conversation intelligence platforms that analyze calls after the fact, SellSig coaches your reps during the call. Real-time coaching means the insight arrives when it matters — while the deal is still in play. We also deliver revenue forecasting powered by conversation signals, not self-reported CRM data.',
  },
  {
    question: 'Can I try SellSig before committing?',
    answer:
      'Every plan includes a 14-day free trial with full access to all features. No credit card required. You will have access to AI coaching, analytics, and integrations from day one. Our team will help you get set up and see value within the trial period.',
  },
  {
    question: 'What does the onboarding process look like?',
    answer:
      'Professional and Enterprise customers get a dedicated Customer Success Manager who handles onboarding, training, and ongoing optimization. Growth customers have access to our self-serve onboarding with live chat support. Most teams see measurable results within the first two weeks.',
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 md:py-28 bg-[#fafbfc]" id="faq">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-[600px] mx-auto text-center mb-16">
          <p className="text-[13px] font-semibold text-gray-400 uppercase tracking-[0.08em] mb-4">
            FAQ
          </p>
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#0f172a] leading-[1.15] tracking-[-0.02em]">
            Common questions
          </h2>
        </div>

        {/* FAQ list */}
        <div className="max-w-[680px] mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border-b border-gray-200/80"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex items-start justify-between gap-4 w-full py-6 text-left group"
                  aria-expanded={isOpen}
                >
                  <span className="text-[15px] font-medium text-[#0f172a] group-hover:text-gray-700 transition-colors leading-snug">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-200 ${
                    isOpen ? 'max-h-[400px] pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-[14px] text-gray-500 leading-relaxed pr-8">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { useScrollReveal } from './gsap/useGSAPAnimations';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

export function CinematicFAQ() {
  const revealRef = useScrollReveal();

  return (
    <section ref={revealRef} className="py-28 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-14" data-reveal>
          <span className="text-[11px] font-mono uppercase tracking-[.2em] text-[hsl(var(--cin-teal))] mb-4 block">
            FAQ
          </span>
          <h2 className="text-[clamp(32px,4vw,48px)] font-bold tracking-[-1.5px] leading-[1.1] text-white">
            Common Questions
          </h2>
        </div>

        <div data-reveal>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-white/[0.08] rounded-xl bg-white/[0.02] px-6 overflow-hidden data-[state=open]:bg-white/[0.04] transition-colors"
              >
                <AccordionTrigger className="text-sm font-semibold text-white hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-white/50 leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

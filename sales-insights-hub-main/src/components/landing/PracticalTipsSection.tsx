import { Lightbulb, CheckCircle } from 'lucide-react';

const tips = [
  'Encourage sales teams to review AI suggestions at the start of each day, using recommended call lists, email drafts, and priority deals to organize activity.',
  'Use AI-generated insights as a guide, while still allowing experienced agents to apply judgment, adapt language, and tailor messages to each buyer.',
  'Regularly update playbooks and templates based on AI analysis of what works best across different industries, deal sizes, and buyer roles.',
  'Share success stories where AI sales tools directly contributed to wins, so people across the organization see real value and continue adopting the tools.',
];

export function PracticalTipsSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="tips">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-warning/10 items-center justify-center mb-6">
              <Lightbulb className="h-7 w-7 text-warning" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Practical Tips for{' '}
              <span className="gradient-text">Day-to-Day Use</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              To maximize the benefits of AI in daily sales work, teams should combine structured processes 
              with flexible, data-driven experimentation.
            </p>
          </div>

          <div className="space-y-4">
            {tips.map((tip, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
              >
                <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground italic max-w-2xl mx-auto">
              Over time, this combination of human expertise and AI support transforms how sales teams work, 
              improving both performance and customer experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

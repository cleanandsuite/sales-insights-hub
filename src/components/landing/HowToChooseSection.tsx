import { Target, Search, Database, Link2, Smartphone, Shield, CheckCircle } from 'lucide-react';

const criteria = [
  {
    icon: Target,
    title: 'Clarify Objectives',
    description: 'Define whether the priority is lead generation, forecasting, conversion, or productivity, and rank these goals so each AI sales tool can be evaluated against clear criteria.',
  },
  {
    icon: Search,
    title: 'Audit Current Systems',
    description: 'Review existing CRM, marketing platforms, and communication tools to understand what AI integrations are available and how data will flow across systems.',
  },
  {
    icon: Database,
    title: 'Evaluate Data Quality',
    description: 'AI sales tools perform best with accurate, complete data, so assess current data hygiene, entry practices, and governance before implementation.',
  },
  {
    icon: Link2,
    title: 'Check Integrations',
    description: 'Confirm that each AI sales tool connects with key platforms, supports existing workflows, and does not require duplicate data entry.',
  },
  {
    icon: Smartphone,
    title: 'Consider User Experience',
    description: 'Sales teams adopt AI tools more quickly when interfaces are simple, mobile-friendly, and embedded directly in daily work screens.',
  },
  {
    icon: Shield,
    title: 'Review Security and Privacy',
    description: 'Verify how each platform manages data access, privacy, storage, and compliance with internal and external regulations.',
  },
];

export function HowToChooseSection() {
  return (
    <section className="py-20 md:py-28 bg-features-gradient" id="how-to-choose">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How to Choose the Right{' '}
            <span className="text-primary">AI Sales Platform</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Choosing AI sales tools requires a structured approach that aligns technology with sales strategy, 
            industry context, and available resources—rather than focusing only on individual features.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {criteria.map((criterion, index) => (
            <div 
              key={criterion.title}
              className="group relative bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all"
            >
              <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">{index + 1}</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <criterion.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {criterion.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {criterion.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-card rounded-xl border border-primary/20 p-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              By mapping these factors to a structured evaluation, organizations can select AI sales tools 
              that deliver long-term value instead of isolated, short-term experiments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

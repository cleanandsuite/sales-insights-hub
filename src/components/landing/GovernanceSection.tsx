import { FileText, Eye, Users, Lock, ShieldCheck } from 'lucide-react';

const pillars = [
  {
    icon: FileText,
    title: 'Data Policies',
    description: 'Clear policies on data access, usage, and retention. AI coaching respects privacy settings and local regulations.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'Leaders understand how the system works, what information is captured, and how it will be used.',
  },
  {
    icon: Users,
    title: 'Human Oversight',
    description: 'No critical decision is made solely by AI. The platform provides insights that informed leaders can use with their own judgment.',
  },
  {
    icon: Lock,
    title: 'Security',
    description: 'Data encryption, tight access controls, and incident response procedures aligned with your standards.',
  },
];

export function GovernanceSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="governance">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ethics & Trust in{' '}
            <span className="gradient-text">AI Coaching</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Any deployment of AI coaching must be grounded in ethics and trust. We design our 
            systems based on strict governance principles that define what the platform can 
            and cannot do.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {pillars.map((pillar) => (
            <div 
              key={pillar.title}
              className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 text-center hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <pillar.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {pillar.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-card/80 backdrop-blur-sm rounded-2xl border border-success/30 p-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              We maintain continuous monitoring so that as regulations evolve, your AI coaching 
              program remains compliant and trustworthy—without compromising ethics, reputation, 
              or stakeholder confidence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

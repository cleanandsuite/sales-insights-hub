import { FileText, Eye, Users, Lock, ShieldCheck } from 'lucide-react';

const pillars = [
  {
    icon: FileText,
    title: 'Data Policies',
    description: 'Establish clear policies on data access, usage, and retention, and ensure that AI sales tools respect privacy settings and local regulations.',
  },
  {
    icon: Eye,
    title: 'Bias Monitoring',
    description: 'Monitor AI scoring and recommendation models for unintended bias, and adjust inputs or rules if certain prospect groups receive unfair treatment.',
  },
  {
    icon: Users,
    title: 'Transparency',
    description: 'Provide transparency to internal stakeholders about how AI tools make recommendations, including which data sources and patterns they use.',
  },
  {
    icon: Lock,
    title: 'Vendor Security',
    description: 'Review vendor security practices regularly, including encryption, access controls, and incident response procedures.',
  },
];

export function GovernanceSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="governance">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Risk Management,{' '}
            <span className="gradient-text">Governance and Ethics</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            While AI sales tools offer strong benefits, they also require careful governance to ensure 
            responsible use of data, fair treatment of prospects, and alignment with corporate values.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {pillars.map((pillar) => (
            <div 
              key={pillar.title}
              className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
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

        <div className="mt-12 bg-card rounded-xl border border-success/30 p-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-success flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              By managing these aspects proactively, organizations can rely on AI sales tools as a secure, 
              compliant, and trusted component of their revenue systems.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

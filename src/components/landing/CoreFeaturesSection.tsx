import { Users, Mail, LineChart, Calendar, BarChart2, Link2, Shield, Scale } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Lead and Account Scoring',
    description: 'AI sales tools with advanced scoring models evaluate prospects based on activity, engagement, firmographic data, and digital signals, giving sales teams a clear view of which opportunities to pursue first.',
  },
  {
    icon: Mail,
    title: 'AI-Powered Email & Language Assistance',
    description: 'Tools that use natural language AI help sellers draft email, social messages, and call summaries faster, in accurate language that matches buyer expectations and brand guidelines.',
  },
  {
    icon: LineChart,
    title: 'Pipeline and Revenue Forecasting',
    description: 'Modern AI sales tools use historical patterns, deal stage data, and activity signals to generate forecasting reports that show realistic revenue scenarios.',
  },
  {
    icon: Calendar,
    title: 'Scheduling and Meeting Automation',
    description: 'Integrated AI tools can schedule meetings, manage calendar conflicts, and book demos without manual back-and-forth, improving response speed and engagement.',
  },
  {
    icon: BarChart2,
    title: 'Analytics and Reporting',
    description: 'Effective AI sales tools provide tailored dashboards, real-time analysis, and updates on pipeline health, conversion by stage, and performance by sales agents or areas.',
  },
  {
    icon: Link2,
    title: 'Integrations and Platform Connectivity',
    description: 'AI sales tools should connect with CRM platforms such as HubSpot and Salesforce, as well as marketing, support, and digital engagement systems.',
  },
];

export function CoreFeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-features-gradient" id="features">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Core Features to Look For in{' '}
            <span className="text-primary">AI Sales Tools</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            When assessing AI sales tools, review the features in relation to current systems, workflows, 
            and industry requirements. Check how each tool fits existing sales models and privacy policies.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group bg-card rounded-xl border border-border p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Note */}
        <div className="mt-12 bg-card rounded-xl border border-border p-6 max-w-3xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Scale className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-2">Scalability & Security</h4>
              <p className="text-sm text-muted-foreground">
                Beyond these features, check whether each AI sales tool can scale with team growth, 
                support different sales models, and offer flexible access controls to protect customer 
                data and privacy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

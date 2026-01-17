import { Database, BarChart2, HeadphonesIcon, DollarSign, ArrowRight } from 'lucide-react';

const integrations = [
  {
    icon: Database,
    title: 'CRM Systems',
    description: 'Integrations with CRM systems allow AI to track every contact, email, call, and meeting, ensuring that sales teams have a single source of truth for customer information.',
    examples: ['Salesforce', 'HubSpot', 'Pipedrive'],
  },
  {
    icon: BarChart2,
    title: 'Marketing Platforms',
    description: 'Connecting AI sales tools to marketing platforms helps align campaigns, content, and lead handoff, so both marketing and sales share consistent data and definitions.',
    examples: ['Marketo', 'Mailchimp', 'ActiveCampaign'],
  },
  {
    icon: HeadphonesIcon,
    title: 'Customer Support',
    description: 'Links to customer support and product usage data let AI identify expansion opportunities and early risk signals, which account teams can address through proactive engagement.',
    examples: ['Zendesk', 'Intercom', 'Freshdesk'],
  },
  {
    icon: DollarSign,
    title: 'Finance & Pricing',
    description: 'Integration with finance and pricing tools supports accurate revenue reporting, discount control, and compliance with internal approval workflows.',
    examples: ['Stripe', 'QuickBooks', 'CPQ Tools'],
  },
];

export function IntegrationsSection() {
  return (
    <section className="py-20 md:py-28 bg-features-gradient" id="integrations">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Integration with{' '}
            <span className="text-primary">Existing Systems</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            To unlock full value from AI sales tools, integration with core business systems is essential, 
            including CRM, marketing automation, support platforms, and finance tools.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {integrations.map((integration) => (
            <div 
              key={integration.title}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <integration.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {integration.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    {integration.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {integration.examples.map((example) => (
                      <span 
                        key={example}
                        className="px-2 py-1 rounded-md bg-secondary text-xs font-medium text-muted-foreground"
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-card rounded-xl border border-primary/20 p-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-center">
            <ArrowRight className="h-5 w-5 text-primary" />
            <p className="text-muted-foreground">
              When these integrations are in place, AI sales tools provide a holistic view of each buyer 
              journey and deliver intelligence that benefits multiple departments.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useState } from 'react';
import { Search, GitBranch, DollarSign, Users, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const useCases = [
  {
    id: 'prospecting',
    icon: Search,
    title: 'Lead Generation & Prospecting',
    points: [
      'AI-powered sales prospecting tools analyze data from social networks, company websites, and industry databases to identify new prospects and build target lists that align with ideal buyer profiles.',
      'AI sales tools automatically qualify inbound leads, assign scores, and route leads to the right sales agents or teams based on territory, product, and deal size.',
      'AI can create personalized email sequences and social messages for first contact, which helps sales teams start more conversations and move leads into active opportunities faster.',
      'With AI analysis of engagement patterns, sales teams can track which messages, times of day, and content types generate the best response from different buyer groups.',
    ],
  },
  {
    id: 'pipeline',
    icon: GitBranch,
    title: 'Pipeline Management',
    points: [
      'AI sales tools support pipeline visibility by tracking activity across deals, highlighting stalled opportunities, and recommending the next step that is most likely to move each deal forward.',
      'AI evaluates which deals are at risk, based on gaps in activity, pricing objections, or buyer silence, and alerts sales managers before forecast accuracy is affected.',
      'Sales teams can use AI to prioritize daily tasks, so every seller starts the day with a focused list of calls, email, and meetings that align with revenue goals.',
      'AI sales tools analyze win and loss reasons and share insights that help teams refine messaging, adjust pricing, and update competitive positioning.',
    ],
  },
  {
    id: 'pricing',
    icon: DollarSign,
    title: 'Pricing & Proposals',
    points: [
      'Pricing and proposal creation benefit from AI because sales tools can recommend discount levels, package structures, and offer terms based on historical results, current market conditions, and buyer profiles.',
      'AI-driven pricing guidance helps sales teams set rates and discounts that protect margin while staying competitive in each industry segment.',
      'Proposal automation tools generate documents, fill in product or service details, and ensure that legal, privacy, and compliance language is always accurate and up to date.',
      'AI sales tools can simulate scenarios to show how changes in pricing or contract length will affect revenue, enabling better investment and negotiation decisions.',
    ],
  },
  {
    id: 'engagement',
    icon: Users,
    title: 'Customer Engagement',
    points: [
      'AI sales tools support post-sale engagement by tracking customer activity, product usage, and support interactions, which allows sales teams to identify expansion opportunities early.',
      'AI signals highlight which accounts are ready for cross-sell or up-sell conversations, based on buying patterns and digital engagement.',
      'Customer health scores created by AI sales tools help account teams prioritize outreach and schedule strategic meetings for high-value clients.',
      'AI can recommend tailored content and offers that align with each buyer journey stage, improving both retention and long-term revenue.',
    ],
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="use-cases">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Use Cases of AI in the{' '}
            <span className="gradient-text">Sales Funnel</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            AI sales tools apply to many stages of the sales funnel, from initial contact to renewal. 
            The right tools help sales teams handle more opportunities with less manual work.
          </p>
        </div>

        <Tabs defaultValue="prospecting" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0 mb-8">
            {useCases.map((useCase) => (
              <TabsTrigger 
                key={useCase.id}
                value={useCase.id}
                className="flex items-center gap-2 py-3 px-4 rounded-lg border border-border bg-card data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all"
              >
                <useCase.icon className="h-4 w-4" />
                <span className="text-sm font-medium hidden sm:inline">{useCase.title.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {useCases.map((useCase) => (
            <TabsContent 
              key={useCase.id}
              value={useCase.id}
              className="mt-0 animate-fade-in"
            >
              <div className="bg-card rounded-xl border border-border p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <useCase.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                    {useCase.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  {useCase.points.map((point, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground leading-relaxed">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

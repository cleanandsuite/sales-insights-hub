import { Brain, Users, MessageSquare, Calendar, BarChart2, Link } from 'lucide-react';

export function WhatIsAISection() {
  const integrations = [
    { icon: Users, label: 'CRM Systems' },
    { icon: MessageSquare, label: 'Email & Social' },
    { icon: Calendar, label: 'Meetings' },
    { icon: BarChart2, label: 'Marketing Channels' },
    { icon: Link, label: 'Digital Activity' },
  ];

  return (
    <section className="py-20 md:py-28 bg-features-gradient" id="what-is-ai">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              What Are AI Sales Tools and{' '}
              <span className="text-primary">Why They Matter</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed">
              AI sales tools are software platforms and applications that use AI models, intelligence, 
              and advanced analysis to support sales teams in lead generation, engagement, forecasting, 
              pricing, and overall pipeline management.
            </p>

            <p className="text-base text-muted-foreground leading-relaxed">
              These AI-driven sales tools work with data from CRM systems, email, social activity, 
              meetings, and digital marketing channels, then use machine learning to show patterns, 
              score prospects, and recommend the next best action for every buyer and opportunity.
            </p>

            <p className="text-base text-muted-foreground leading-relaxed">
              With the right AI sales tools, teams can easily create accurate reports, streamline sales tasks, 
              set pricing and rates based on data, and ensure that every seller—from new agents to enterprise 
              account teams—can focus on high-value deals instead of routine work.
            </p>
          </div>

          {/* Right - Integration Visualization */}
          <div className="relative">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
              <div className="text-center mb-8">
                <div className="inline-flex h-20 w-20 rounded-2xl bg-primary/10 items-center justify-center mb-4">
                  <Brain className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">AI Sales Intelligence</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Machine learning models analyze all your data sources
                </p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                {integrations.map((item, index) => (
                  <div 
                    key={item.label}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <item.icon className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground text-center">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Connection Lines (Visual) */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  <span>Real-time data synchronization</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

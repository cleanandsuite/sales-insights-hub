import { FileSearch, MessageSquare, BarChart2, CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';

const steps = [
  {
    letter: 'A',
    title: 'Before the Call',
    description: 'Use AI prompts to prep: outline goals, anticipate pushback, test strategies.',
    icon: FileSearch,
    color: 'from-primary to-primary/80',
    details: ['Set call objectives', 'Prepare objection responses', 'Review prospect history'],
  },
  {
    letter: 'B',
    title: 'During the Call',
    description: 'Get live sync and post-call debriefs with auto-summaries of strengths/gaps.',
    icon: MessageSquare,
    color: 'from-accent to-accent/80',
    details: ['Real-time coaching cues', 'Track talk ratio', 'Capture key moments'],
  },
  {
    letter: 'C',
    title: 'After the Call',
    description: 'Link insights to pipeline, share learnings, and improve scripts/messaging fast.',
    icon: BarChart2,
    color: 'from-success to-success/80',
    details: ['Auto-generated summaries', 'CRM integration', 'Team learning library'],
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 md:py-28 bg-section-aurora relative overflow-hidden" id="use-cases">
      {/* Aurora background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/3 to-success/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Section badge */}
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 mb-6">
            <RefreshCw className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">ABC Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How It Fits Your{' '}
            <span className="gradient-text">Daily Sales Process</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            AI coaching that works with you at every stage of the sales call
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step, index) => (
              <div
                key={step.letter}
                className="group bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
              >
                {/* Letter badge */}
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl font-bold text-white">{step.letter}</span>
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <step.icon className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </div>

                {/* Details list */}
                <ul className="space-y-2 mt-4 pt-4 border-t border-border/50">
                  {step.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Connection arrows for desktop */}
          <div className="hidden md:flex items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-6 py-3 border border-border/50">
              <RefreshCw className="h-5 w-5 text-primary animate-spin-slow" />
              <span className="text-sm font-medium text-foreground">Continuous improvement loop for every sales call</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
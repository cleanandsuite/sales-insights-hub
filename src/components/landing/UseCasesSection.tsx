import { FileSearch, MessageSquare, BarChart2, CheckCircle } from 'lucide-react';

const steps = [
  {
    letter: 'A',
    title: 'Before the Call',
    description: 'Use AI prompts to prep: outline goals, anticipate pushback, test strategies.',
    icon: FileSearch,
    color: 'from-primary to-primary/80',
  },
  {
    letter: 'B',
    title: 'During the Call',
    description: 'Get live sync and post-call debriefs with auto-summaries of strengths/gaps.',
    icon: MessageSquare,
    color: 'from-accent to-accent/80',
  },
  {
    letter: 'C',
    title: 'After the Call',
    description: 'Link insights to pipeline, share learnings, and improve scripts/messaging fast.',
    icon: BarChart2,
    color: 'from-success to-success/80',
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="use-cases">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
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
            {steps.map((step) => (
              <div
                key={step.letter}
                className="group bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 text-center"
              >
                {/* Letter badge */}
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="text-3xl font-bold text-white">{step.letter}</span>
                </div>

                <div className="flex items-center justify-center gap-2 mb-3">
                  <step.icon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>

          {/* Connection line (visual) */}
          <div className="hidden md:flex items-center justify-center mt-8">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <CheckCircle className="h-5 w-5 text-success" />
              <span>Continuous improvement loop for every sales call</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

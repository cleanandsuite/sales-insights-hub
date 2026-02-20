import { Rocket, Target, GraduationCap, MessageSquare, TrendingUp } from 'lucide-react';

const steps = [
  {
    icon: Rocket,
    title: 'Start with a Pilot',
    description: 'Select one or two sales teams, define specific use cases such as lead scoring or forecasting, and implement a limited set of AI sales tools to validate results before scaling.',
    step: 1,
  },
  {
    icon: Target,
    title: 'Set Measurable Metrics',
    description: 'Agree on metrics like conversion rate, average deal size, cycle length, and activity volume, then use AI to track changes over time.',
    step: 2,
  },
  {
    icon: GraduationCap,
    title: 'Train Sales Teams',
    description: 'Provide practical training focused on everyday tasks, showing how AI tools reduce manual work, streamline data entry, and support better conversations with buyers.',
    step: 3,
  },
  {
    icon: MessageSquare,
    title: 'Gather Feedback',
    description: 'Schedule regular meetings to capture feedback on AI recommendations, usability, and data accuracy, then adjust configuration and workflows accordingly.',
    step: 4,
  },
  {
    icon: TrendingUp,
    title: 'Scale and Refine',
    description: 'Once initial goals are met, extend AI sales tools to additional teams, products, and regions while continuously optimizing settings and rules.',
    step: 5,
  },
];

export function ImplementationSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="implementation">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Implementation Strategy for{' '}
            <span className="gradient-text">AI Sales Tools</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Successful implementation of AI sales tools depends on a clear rollout plan, tailored training, 
            and continuous updates based on feedback from real sales activity.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

            <div className="space-y-8">
              {steps.map((step, index) => (
                <div 
                  key={step.title}
                  className="relative flex items-start gap-6 group"
                >
                  {/* Step Number Circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <step.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-muted-foreground italic">
              This implementation approach ensures that AI becomes a trusted sales partner rather than a separate, unused tool.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

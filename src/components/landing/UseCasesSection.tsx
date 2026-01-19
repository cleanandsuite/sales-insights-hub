import { Briefcase, Users, DollarSign, Phone, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const useCases = [
  {
    id: 'revenue',
    icon: Briefcase,
    title: 'Revenue Leadership',
    points: [
      'Commercial organizations depend on effective sales call quality and resilient managers. Focus on how leaders prepare, run, and debrief customer meetings.',
      'Regional VPs use AI coaching to simulate board-level presentations, test pricing strategies, and refine objection handling before critical sales calls.',
      'Afterward, sit with an executive coach to explore influence patterns, organizational politics, and long-term positioning with customers.',
    ],
  },
  {
    id: 'managers',
    icon: Users,
    title: 'Sales Managers',
    points: [
      'Many top sellers became managers without formal training. Practice difficult performance conversations through the AI coaching platform.',
      'Explore how AI prompts suggest more active listening during sales calls and connect individual targets to wider strategy.',
      'Set clear expectations, manage deals effectively, and provide better day-to-day support to your team.',
    ],
  },
  {
    id: 'negotiations',
    icon: DollarSign,
    title: 'High-Stakes Negotiations',
    points: [
      'Identify which sales calls stall most often—typically price negotiations—and design focused interventions for those moments.',
      'Create role-plays, targeted content, and specific behaviors your teams must demonstrate on critical calls.',
      'Track how often discounting becomes the default response versus re-anchoring on value and impact.',
    ],
  },
  {
    id: 'quality',
    icon: Phone,
    title: 'Call Quality Standards',
    points: [
      'Set quality standards for all sales calls from first contact to executive reviews. Define what "good" looks like for discovery, demos, and pricing discussions.',
      'Link standards to observation tools, feedback forms, and AI coaching insights across teams, regions, and partners.',
      'Accelerate learning, help new hires start strong, and ensure everyone benefits from top performer experience.',
    ],
  },
];

export function UseCasesSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="use-cases">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            From Sales Floor to{' '}
            <span className="gradient-text">Boardroom</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The most visible impact often starts with revenue leadership. AI coaching transforms 
            how organizations approach sales calls at every level.
          </p>
        </div>

        <Tabs defaultValue="revenue" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0 mb-8">
            {useCases.map((useCase) => (
              <TabsTrigger 
                key={useCase.id}
                value={useCase.id}
                className="flex items-center gap-2 py-3 px-4 rounded-xl border border-border/50 bg-card/80 backdrop-blur-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary transition-all"
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
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border/50 p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
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

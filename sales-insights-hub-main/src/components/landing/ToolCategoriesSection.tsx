import { Search, MessageSquare, GitBranch, TrendingUp, Zap } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const categories = [
  {
    icon: Search,
    category: 'Prospecting and Lead Generation',
    focus: 'Identify and qualify new prospects',
    features: 'Data enrichment, lead scoring, ideal customer model creation, social and email outreach automation',
  },
  {
    icon: MessageSquare,
    category: 'Engagement and Communication',
    focus: 'Improve buyer conversations',
    features: 'AI-assisted email drafting, call transcription, language analysis, sentiment detection, meeting scheduling',
  },
  {
    icon: GitBranch,
    category: 'Pipeline and Forecasting',
    focus: 'Manage and predict revenue',
    features: 'Deal scoring, forecasting dashboards, activity tracking, opportunity risk alerts, scenario analysis',
  },
  {
    icon: TrendingUp,
    category: 'Revenue Operations',
    focus: 'Align sales, marketing, and customer success',
    features: 'Data integrations, conversion funnel reports, attribution, territory planning, capacity modeling',
  },
  {
    icon: Zap,
    category: 'Productivity and Automation',
    focus: 'Reduce manual work',
    features: 'Data entry automation, workflow orchestration, document generation, proposal management',
  },
];

export function ToolCategoriesSection() {
  return (
    <section className="py-20 md:py-28 bg-background" id="categories">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Categories of{' '}
            <span className="gradient-text">AI Sales Tools</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            The market for AI sales tools continues to expand. Solutions can be grouped into several major 
            categories that address different stages of the customer journey.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block max-w-6xl mx-auto">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-foreground">Category</TableHead>
                  <TableHead className="font-semibold text-foreground">Main Focus</TableHead>
                  <TableHead className="font-semibold text-foreground">Typical Features</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.category} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <cat.icon className="h-4 w-4 text-primary" />
                        </div>
                        {cat.category}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{cat.focus}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{cat.features}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {categories.map((cat) => (
            <div key={cat.category} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <cat.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{cat.category}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Focus:</span> {cat.focus}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Features:</span> {cat.features}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Each type of AI sales tool can be used alone, but organizations gain the strongest advantage 
            when several tools are connected within a unified platform.
          </p>
        </div>
      </div>
    </section>
  );
}

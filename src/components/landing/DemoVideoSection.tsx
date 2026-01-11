import { Play } from 'lucide-react';

interface DemoVideoSectionProps {
  onWatchDemoClick: () => void;
}

export function DemoVideoSection({ onWatchDemoClick }: DemoVideoSectionProps) {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              See AI Sales Coaching In Action
            </h2>
            <p className="text-lg text-muted-foreground">
              Watch how our AI Coach transforms cold calls in under 60 seconds
            </p>
          </div>
          <div 
            className="aspect-video rounded-lg overflow-hidden cursor-pointer group relative shadow-xl hover:shadow-2xl transition-all"
            onClick={onWatchDemoClick}
            role="button"
            aria-label="Play demo video showing AI Sales Coach dashboard with real-time coaching"
          >
            {/* Video placeholder with gradient background */}
            <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center relative">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />
              
              {/* Play button */}
              <div className="relative z-10 text-center space-y-4">
                <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Play className="h-10 w-10 text-primary-foreground ml-1" fill="currentColor" />
                </div>
                <p className="text-white/80 group-hover:text-white transition-colors text-lg font-medium">
                  Click to watch 60-second demo
                </p>
              </div>
              
              {/* Alt text for SEO */}
              <span className="sr-only">
                AI Sales Coach dashboard showing real-time coaching and objection detection
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

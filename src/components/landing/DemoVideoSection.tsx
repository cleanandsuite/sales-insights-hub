import { Play } from 'lucide-react';

interface DemoVideoSectionProps {
  onWatchDemoClick: () => void;
}

export function DemoVideoSection({ onWatchDemoClick }: DemoVideoSectionProps) {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              See <span className="text-primary">AI Sales Coaching</span> In Action
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Watch how our AI Coach transforms cold calls in under 60 seconds
            </p>
          </div>
          <div 
            className="aspect-video rounded-2xl overflow-hidden cursor-pointer group relative shadow-2xl hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-300"
            onClick={onWatchDemoClick}
            role="button"
            aria-label="Play demo video showing AI Sales Coach dashboard with real-time coaching"
          >
            {/* Video placeholder with gradient background */}
            <div className="w-full h-full bg-gradient-to-br from-[#032D60] via-[#0a4d8c] to-[#1570EF] flex items-center justify-center relative">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
              
              {/* Play button */}
              <div className="relative z-10 text-center space-y-5">
                <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-all duration-300">
                  <Play className="h-12 w-12 text-primary ml-1.5" fill="currentColor" />
                </div>
                <p className="text-white/90 group-hover:text-white transition-colors text-xl font-semibold">
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

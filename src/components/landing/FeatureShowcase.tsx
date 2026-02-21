import corporateCoaching from '@/assets/corporate-coaching.jpg';
import corporateSolo from '@/assets/corporate-solo.jpg';
import corporateCelebration from '@/assets/corporate-celebration.jpg';
import corporateHero from '@/assets/corporate-hero.jpg';

interface FeatureShowcaseProps {
  onStartTrialClick: () => void;
}

const features = [
  {
    tag: 'Real-Time AI Coaching',
    title: 'AI Whispers the Perfect Response — While You Talk',
    description:
      'SellSig listens to your live sales call and surfaces real-time coaching prompts: objection handlers, competitive rebuttals, and closing techniques — all before the prospect finishes their sentence.',
    bullets: [
      'Live AI coaching overlay during every call',
      'Context-aware objection handling suggestions',
      'Automatic talk ratio and pacing alerts',
    ],
    image: corporateCoaching,
    imageAlt: 'Sales manager coaching a rep with AI-powered analytics dashboard showing real-time conversation intelligence',
  },
  {
    tag: 'Buyer Signal Detection',
    title: 'Detect Buying Intent the Moment It Happens',
    description:
      'Our AI identifies 47+ buying signals — from budget discussions to urgency language — and alerts reps instantly so they can strike while the iron is hot.',
    bullets: [
      'Real-time buying signal detection and alerts',
      'BANT scoring updated live during calls',
      'Competitive mention tracking and response prompts',
    ],
    image: corporateSolo,
    imageAlt: 'Sales professional using SellSig AI coaching software with buyer signal detection on laptop screen',
    reverse: true,
  },
  {
    tag: 'CRM Auto-Capture',
    title: 'Every Detail Logged. Zero Manual Entry.',
    description:
      'SellSig automatically captures call summaries, action items, deal intelligence, and next steps — syncing directly to your CRM so reps spend time selling, not typing.',
    bullets: [
      'Auto-generated call summaries with key moments',
      'One-click Salesforce and HubSpot sync',
      'AI-extracted action items and follow-up reminders',
    ],
    image: corporateCelebration,
    imageAlt: 'Sales team celebrating closed deals with AI-powered CRM auto-capture and conversation intelligence',
  },
  {
    tag: 'Scalable Coaching',
    title: 'Coach Every Rep Like Your Best Manager',
    description:
      'Scale your top manager\'s coaching instincts across the entire team. SellSig provides personalized improvement plans, skill tracking, and coaching ROI metrics for every rep.',
    bullets: [
      'Personalized coaching plans for each rep',
      'Team-wide performance analytics and leaderboards',
      'Coaching ROI dashboard with revenue attribution',
    ],
    image: corporateHero,
    imageAlt: 'Sales professional confidently handling AI-coached sales call with real-time coaching assistance',
    reverse: true,
  },
];

export function FeatureShowcase({ onStartTrialClick }: FeatureShowcaseProps) {
  return (
    <section className="bg-[#111111] py-24">
      <div className="container mx-auto px-4">
        <div className="space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
                feature.reverse ? 'lg:direction-rtl' : ''
              }`}
              style={feature.reverse ? { direction: 'rtl' } : undefined}
            >
              {/* Text */}
              <div style={feature.reverse ? { direction: 'ltr' } : undefined} className="max-w-lg">
                <p className="text-emerald-400 text-sm font-semibold uppercase tracking-widest mb-3">
                  {feature.tag}
                </p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  {feature.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Image */}
              <div style={feature.reverse ? { direction: 'ltr' } : undefined}>
                <div className="rounded-xl overflow-hidden border border-white/10 shadow-xl">
                  <img
                    src={feature.image}
                    alt={feature.imageAlt}
                    className="w-full h-auto object-cover aspect-video"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { CheckCircle2 } from 'lucide-react';
import dashboardPreview from '@/assets/dashboard-preview.jpg';

const checkpoints = [
  'Find the signals that drive revenue — before your competitor does',
  'Coach reps live, not after the fact when the deal is already cold',
  'Turn call insights into closed deals with personalized playbooks',
];

export function ProblemSection() {
  return (
    <section className="bg-blue-50 py-16 sm:py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Left: text content */}
          <div>
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-100 px-3 py-1 rounded-full mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight tracking-tight mb-5">
              How real-time coaching produces real pipeline growth
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              Most tools analyze calls <em>after</em> the deal has gone cold. SellSig listens live,
              detects buyer signals in the moment, and gives your reps the exact words to move deals forward — right now.
            </p>
            <ul className="space-y-4">
              {checkpoints.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: dashboard image */}
          <div className="hidden md:block">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <img
                src={dashboardPreview}
                alt="SellSig live coaching dashboard"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

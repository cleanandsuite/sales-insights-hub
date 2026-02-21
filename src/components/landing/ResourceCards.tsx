import { ArrowRight } from 'lucide-react';

const resources = [
  {
    tag: 'Guide',
    title: 'The Complete Guide to AI Sales Coaching in 2026',
    description:
      'Learn how leading sales teams use AI coaching to improve win rates, reduce ramp time, and scale coaching across their organization.',
    link: '#',
  },
  {
    tag: 'Case Study',
    title: 'How TechScale Increased Revenue 34% with Real-Time AI Coaching',
    description:
      'See how a 50-rep sales team transformed their performance using SellSig\'s buyer signal detection and live coaching.',
    link: '#',
  },
];

export function ResourceCards() {
  return (
    <section className="bg-[#0A0A0A] py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-center mb-4">
          Resources
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          Explore how AI sales coaching is transforming revenue teams
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {resources.map((res, i) => (
            <a
              key={i}
              href={res.link}
              className="group block bg-[#1A1A1A] border border-white/10 rounded-xl p-8 hover:border-emerald-500/30 transition-all"
            >
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                {res.tag}
              </span>
              <h3 className="text-xl font-bold text-white mt-3 mb-3 group-hover:text-emerald-400 transition-colors">
                {res.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{res.description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400">
                Read more
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

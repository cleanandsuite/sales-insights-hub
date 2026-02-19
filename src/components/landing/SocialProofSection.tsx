import { Quote, Star } from 'lucide-react';

const metrics = [
  { value: '2,500+', label: 'Sales Calls Analyzed Daily' },
  { value: '34%', label: 'Average Win Rate Increase' },
  { value: '12hrs', label: 'Saved Per Rep Weekly' },
  { value: '4.8/5', label: 'Customer Rating' },
];

const testimonials = [
  {
    quote:
      'SellSig helped us close 40% more deals in Q4. The real-time coaching is like having a manager in every call.',
    author: 'Sarah Chen',
    title: 'VP of Sales, TechStart Inc',
    avatar: 'SC',
  },
  {
    quote:
      "We tried Gong first. SellSig's coaching actually helps our reps during calls, not just after. Game changer.",
    author: 'Michael Johnson',
    title: 'Sales Director, GlobalTech',
    avatar: 'MJ',
  },
  {
    quote:
      "The buyer signal detection caught a deal we almost lost. We'd have missed $150K without it.",
    author: 'Emily Davis',
    title: 'CRO, InnovateCo',
    avatar: 'ED',
  },
];

export function SocialProofSection() {
  return (
    <section className="bg-white" id="customers">
      {/* Stats band */}
      <div className="bg-blue-50 py-14 px-4">
        <div className="container mx-auto max-w-5xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-blue-600 mb-8">
            Trusted by sales teams worldwide
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {metrics.map((metric) => (
              <div key={metric.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black text-blue-600 mb-1">
                  {metric.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 tracking-tight mb-10">
            Loved by Sales Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col"
              >
                <Quote className="h-7 w-7 text-blue-100 mb-4" />
                <p className="text-gray-700 leading-relaxed flex-1">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3 mt-6">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm flex-shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{testimonial.author}</p>
                    <p className="text-xs text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* G2 Rating */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm font-semibold text-amber-800">4.8/5 on G2</span>
              <span className="text-sm text-amber-600">(127 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { CheckCircle2, Star, Quote } from 'lucide-react';

// Customer logos - using text placeholders for now (can be replaced with actual logos)
const customerLogos = [
  'Acme Corp', 'TechStart', 'GlobalTech', 'InnovateCo', 'DataFlow', 'CloudNine', 'NextGen', 'SmartSync'
];

const metrics = [
  { value: '2,500+', label: 'Sales Calls Analyzed Daily' },
  { value: '34%', label: 'Average Win Rate Increase' },
  { value: '12hrs', label: 'Saved Per Rep Weekly' },
  { value: '4.8/5', label: 'Customer Rating' },
];

const testimonials = [
  {
    quote: "SellSig helped us close 40% more deals in Q4. The real-time coaching is like having a manager in every call.",
    author: "Sarah Chen",
    title: "VP of Sales, TechStart Inc",
    avatar: "SC"
  },
  {
    quote: "We tried Gong first. SellSig's coaching actually helps our reps during calls, not just after. Game changer.",
    author: "Michael Johnson",
    title: "Sales Director, GlobalTech",
    avatar: "MJ"
  },
  {
    quote: "The buyer signal detection caught a deal we almost lost. We'd have missed $150K without it.",
    author: "Emily Davis",
    title: "CRO, InnovateCo",
    avatar: "ED"
  }
];

export function SocialProofSection() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50" id="customers">
      <div className="container mx-auto px-4">
        
        {/* Trust badges */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">Trusted by sales teams at</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-60">
            {customerLogos.map((logo) => (
              <div key={logo} className="text-lg sm:text-xl font-bold text-slate-400">
                {logo}
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-16">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 mb-2">{metric.value}</div>
              <div className="text-sm sm:text-base text-slate-600">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-900 mb-10">
            Loved by Sales Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <Quote className="h-8 w-8 text-indigo-200 mb-4" />
                <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* G2 Rating */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
            <div className="flex gap-1">
              {[1,2,3,4,5].map((star) => (
                <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-amber-800">4.8/5 on G2</span>
            <span className="text-sm text-amber-600">(127 reviews)</span>
          </div>
        </div>

      </div>
    </section>
  );
}

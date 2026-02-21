import { Star } from 'lucide-react';

export function TestimonialBanner() {
  return (
    <section className="bg-[#0A0A0A] py-24 border-y border-white/5">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <div className="flex items-center justify-center gap-1 mb-6">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="h-5 w-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <blockquote className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-8">
          "SellSig's real-time AI coaching helped our team close 34% more deals in the first quarter. 
          It's like having your best sales manager whispering in every rep's ear."
        </blockquote>
        <div>
          <p className="text-white font-semibold">Sarah Chen</p>
          <p className="text-gray-500 text-sm">VP of Sales, TechScale Inc.</p>
        </div>
      </div>
    </section>
  );
}

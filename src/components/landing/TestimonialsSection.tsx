export function TestimonialsSection() {
  return (
    <section className="py-14 px-4 bg-slate-50" id="testimonials">
      <div className="container mx-auto max-w-xl">
        <div className="relative bg-white rounded-2xl shadow-lg p-8 text-center border-t-4 border-t-violet-600">
          {/* Quote mark */}
          <span className="absolute top-3 left-5 text-5xl font-serif text-violet-600/10 select-none">
            "
          </span>

          <p className="text-base sm:text-lg font-semibold text-slate-900 italic leading-relaxed mb-4 relative z-10">
            Finally, an AI that sees buyer signals in the moment—not days later.
          </p>

          <p className="text-sm font-bold text-slate-500">
            — Sales rep at scaling SaaS team
          </p>
        </div>
      </div>
    </section>
  );
}

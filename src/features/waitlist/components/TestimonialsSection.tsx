import React from "react";
import { Star } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "We caught a critical lodash prototype pollution issue in our customer portal before it made it to prod. The AI explanation was clear enough that our PM understood why it mattered.",
      author: "Sarah K.",
      role: "Lead Engineer, Fintech startup"
    },
    {
      quote: "The continuous monitoring is what sold us. We don't have to remember to scan - VulnWatch just tells us when something new breaks.",
      author: "Marcus T.",
      role: "CTO B2B SaaS"
    }
  ];

  return (
    <section className="w-full bg-white py-24 md:py-32">
      <div className="wrapper flex flex-col items-center">
        
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-6 w-6 fill-[#EAB308] text-[#EAB308]" />
            ))}
          </div>
          <p className="text-lg font-medium text-brand-gray">
            From early beta testers
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 max-w-5xl">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-none"
            >
              <p className="mb-8 text-base text-brand-gray md:text-lg leading-relaxed">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                  {testimonial.author.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-brand-dark">{testimonial.author}</span>
                  <span className="text-sm text-brand-gray">{testimonial.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

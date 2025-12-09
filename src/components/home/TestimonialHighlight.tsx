import { Link } from "react-router-dom";
import { Quote, ArrowRight, Star } from "lucide-react";

const TestimonialHighlight = () => {
  return (
    <section className="section-padding bg-warm">
      <div className="container-main">
        <div className="max-w-4xl mx-auto text-center">
          {/* Quote Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Quote size={32} className="text-primary" />
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={24} className="fill-primary text-primary" />
            ))}
          </div>

          {/* Quote */}
          <blockquote className="text-xl md:text-2xl text-foreground font-medium leading-relaxed mb-6">
            "The team at AR Advanced Woundcare changed my life. After struggling 
            with a chronic wound for months, their expert care and compassion 
            helped me heal completely. I'm forever grateful."
          </blockquote>

          {/* Attribution */}
          <div className="mb-8">
            <p className="font-semibold text-foreground">Margaret S.</p>
            <p className="text-sm text-muted-foreground">Patient since 2023</p>
          </div>

          {/* Link to more */}
          <Link 
            to="/testimonials"
            className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            Read more patient stories
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TestimonialHighlight;

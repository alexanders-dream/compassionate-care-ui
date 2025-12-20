import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, Quote } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";

const Testimonials = () => {
  const { testimonials } = useSiteData();
  return (
    <Layout>
      <Helmet>
        <title>Patient Testimonials | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="Read testimonials from patients and healthcare providers about their experience with AR Advanced Woundcare Solutions' in-home wound care services." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-[#EBF4FA] dark:bg-background py-16 md:py-24">
        <div className="container-main text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Patient <span className="text-primary">Testimonials</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear from our patients and healthcare partners about their experience with our compassionate,
            expert wound care services.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id || index} className="bg-card rounded-2xl p-6 shadow-soft relative">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {testimonial.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-primary dark:bg-card">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-white dark:text-primary-foreground mb-2">98%</div>
              <div className="text-white/80 dark:text-primary-foreground/80">Patient Satisfaction</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-white dark:text-primary-foreground mb-2">5,000+</div>
              <div className="text-white/80 dark:text-primary-foreground/80">Patients Served</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-white dark:text-primary-foreground mb-2">4.9</div>
              <div className="text-white/80 dark:text-primary-foreground/80">Average Rating</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-white dark:text-primary-foreground mb-2">50+</div>
              <div className="text-white/80 dark:text-primary-foreground/80">Partner Providers</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-main text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Experience Our Care?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of satisfied patients who have trusted AR Advanced Woundcare Solutions
            with their healing journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-white">
              <Link to="/request-visit">Book Consultation</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Testimonials;

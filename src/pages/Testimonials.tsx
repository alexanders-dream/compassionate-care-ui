import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Margaret S.",
    location: "Houston, TX",
    rating: 5,
    text: "After struggling with a diabetic foot ulcer for months, the team at AR Advanced Woundcare changed everything. Their in-home visits were convenient, and the care was exceptional. My wound healed in just 8 weeks!",
    condition: "Diabetic Foot Ulcer"
  },
  {
    name: "Robert J.",
    location: "Dallas, TX",
    rating: 5,
    text: "The compassion and expertise of the nursing staff is unmatched. They treated my mother's pressure ulcer with such care and professionalism. We couldn't be more grateful.",
    condition: "Pressure Ulcer"
  },
  {
    name: "Dr. Patricia Chen",
    location: "San Antonio, TX",
    rating: 5,
    text: "As a referring physician, I've been consistently impressed with AR Advanced Woundcare's clinical outcomes. Their communication is excellent, and my patients always speak highly of their experience.",
    condition: "Healthcare Provider"
  },
  {
    name: "James T.",
    location: "Austin, TX",
    rating: 5,
    text: "Having wound care come to my home made all the difference. I couldn't easily travel to appointments, but AR's team came to me. Professional, kind, and truly skilled at what they do.",
    condition: "Venous Leg Ulcer"
  },
  {
    name: "Linda M.",
    location: "Fort Worth, TX",
    rating: 5,
    text: "The education they provided about wound care and prevention has been invaluable. I feel empowered to take better care of myself, and my surgical wound healed beautifully.",
    condition: "Surgical Wound"
  },
  {
    name: "William H.",
    location: "El Paso, TX",
    rating: 5,
    text: "After several failed treatments elsewhere, AR Advanced Woundcare finally healed my chronic wound. Their advanced treatment options and personalized approach made all the difference.",
    condition: "Chronic Wound"
  }
];

const Testimonials = () => {
  return (
    <Layout>
      <Helmet>
        <title>Patient Testimonials | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="Read testimonials from patients and healthcare providers about their experience with AR Advanced Woundcare Solutions' in-home wound care services." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm via-background to-primary/10 py-16 md:py-24">
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
              <div key={index} className="bg-card rounded-2xl p-6 shadow-soft relative">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t border-border pt-4">
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                  <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {testimonial.condition}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-2">98%</div>
              <div className="text-primary-foreground/80">Patient Satisfaction</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-2">5,000+</div>
              <div className="text-primary-foreground/80">Patients Served</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-2">4.9</div>
              <div className="text-primary-foreground/80">Average Rating</div>
            </div>
            <div>
              <div className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-2">50+</div>
              <div className="text-primary-foreground/80">Partner Providers</div>
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
            <Button size="lg" asChild>
              <Link to="/request-visit">Book a Visit</Link>
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

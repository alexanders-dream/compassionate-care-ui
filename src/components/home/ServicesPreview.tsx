import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bandage, Stethoscope, Home, Clipboard } from "lucide-react";
import homeCareImage from "@/assets/home-care-visit.jpg";

const services = [
  {
    icon: Bandage,
    title: "Wound Assessment",
    description: "Comprehensive evaluation of wound type, size, and healing stage to create personalized treatment plans.",
    href: "/services#assessment",
  },
  {
    icon: Stethoscope,
    title: "Clinical Treatment",
    description: "Advanced wound care techniques including debridement, dressings, and evidence-based therapies.",
    href: "/services#treatment",
  },
  {
    icon: Home,
    title: "In-Home Care",
    description: "Convenient wound care services delivered in the comfort of your home by certified specialists.",
    href: "/services#home-care",
  },
  {
    icon: Clipboard,
    title: "Care Coordination",
    description: "Seamless communication with your healthcare team to ensure optimal recovery outcomes.",
    href: "/services#coordination",
  },
];

const ServicesPreview = () => {
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-main">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-foreground mb-4">Our Services</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive wound care solutions tailored to your unique needs,
            delivered with compassion and clinical excellence.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Services Grid */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <Card
                key={service.title}
                className="group bg-card border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 card-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <service.icon size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <Link
                    to={service.href}
                    className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all"
                  >
                    Learn more
                    <ArrowRight size={16} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Featured Image */}
          <div className="hidden lg:block">
            <div className="rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] overflow-hidden soft-shadow border border-primary/20">
              <img
                src={homeCareImage}
                alt="Healthcare professional providing in-home wound care"
                className="w-full h-full object-cover aspect-[4/5]"
              />
            </div>
          </div>
        </div>

        {/* View All CTA */}
        <div className="text-center mt-10">
          <Button variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
            <Link to="/services">
              View All Services
              <ArrowRight size={18} />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;

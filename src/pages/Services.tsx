import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Stethoscope, Heart, Bandage, Users, ShieldCheck, Clock, Home, Scissors } from "lucide-react";
import homeCareVisit from "@/assets/home-care-visit.jpg";
import { useSiteData } from "@/contexts/SiteDataContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Stethoscope,
  Heart,
  Bandage,
  Users,
  ShieldCheck,
  Clock,
  Home,
  Scissors,
};

const benefits = [
  { icon: ShieldCheck, title: "Licensed Clinicians", description: "All care provided by certified wound care specialists" },
  { icon: Clock, title: "Flexible Scheduling", description: "Appointments that work around your schedule" },
  { icon: Heart, title: "Patient-Centered Care", description: "Individualized treatment plans for every patient" }
];

const Services = () => {
  const { services } = useSiteData();
  return (
    <Layout>
      <Helmet>
        <title>Our Services | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="Comprehensive wound care services including chronic wound treatment, post-surgical care, and palliative wound management delivered in your home." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                Expert Wound Care, <span className="text-primary">Delivered to You</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Our certified wound care specialists provide comprehensive treatment for all types of wounds,
                bringing clinical expertise directly to your home for convenient, compassionate care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link to="/request-visit">Schedule a Visit</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/refer">Provider Referral</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src={homeCareVisit}
                alt="Wound care clinician providing in-home treatment"
                className="rounded-[40%_60%_55%_45%_/_55%_45%_55%_45%] shadow-elegant w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comprehensive Wound Care Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From chronic wounds to post-surgical care, our team provides specialized treatment tailored to your unique needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Heart;
              return (
                <div
                  key={service.id || index}
                  className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-elegant transition-shadow"
                >
                  <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mb-6">
                    <IconComponent className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24 bg-[#0B2545]">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              Why Choose AR Advanced Woundcare?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-secondary-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-secondary-foreground/80">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container-main text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Healing Journey?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Contact us today to schedule a consultation and learn how our expert wound care team can help you heal.
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

export default Services;

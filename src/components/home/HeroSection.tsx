import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Users } from "lucide-react";
import heroImage from "@/assets/hero-clinician.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-background min-h-[calc(100vh-80px)] flex items-center">

      <div className="container-main py-16 md:py-24 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-secondary">
                Advanced Wound Care
                <span className="block text-primary mt-2">You Can Trust</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                We bring specialized wound care directly to you. Our team of experienced
                clinicians delivers compassionate, evidence-based treatment for faster
                healing and better outcomes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link to="/request-visit" className="no-link-style">
                  Request a Visit
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/refer" className="no-link-style">
                  Refer a Patient
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center">
                  <Shield size={20} className="text-secondary" />
                </div>
                <span className="font-medium">Licensed & Certified</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-10 h-10 rounded-full bg-accent/50 flex items-center justify-center">
                  <Users size={20} className="text-secondary" />
                </div>
                <span className="font-medium">10,000+ Patients Served</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="aspect-square lg:aspect-[4/3] rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] overflow-hidden shadow-elevated">
              <img
                src={heroImage}
                alt="Compassionate wound care clinician ready to help"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

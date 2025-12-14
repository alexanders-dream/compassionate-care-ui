import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";
import heroImage from "@/assets/hero-clinician.jpg";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container-main pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Content */}
          <div className="space-y-8 animate-fade-in lg:pt-12">
            {/* Badge Removed */}

            <h1 className="text-foreground">
              Advanced Wound Care{" "}
              <span className="text-primary">You Can Trust</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              We bring specialized wound care directly to you. Our team of experienced
              clinicians delivers compassionate, evidence-based treatment for faster
              healing and better outcomes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base">
                <Link to="/request-visit">
                  Request a Visit
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link to="/refer">
                  Refer a Patient
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield size={20} className="text-primary" />
                <span>Licensed & Certified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users size={20} className="text-primary" />
                <span>10,000+ Patients Served</span>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="aspect-square lg:aspect-square rounded-[48%_52%_68%_32%_/_42%_66%_34%_58%] overflow-hidden soft-shadow">
              <img
                src={heroImage}
                alt="Compassionate wound care clinician ready to help"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

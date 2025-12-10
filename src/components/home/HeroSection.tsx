import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Shield, Users } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-warm via-background to-primary/10">
      <div className="container-main section-padding">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/15 rounded-full text-sm font-medium text-primary">
              <Heart size={16} className="text-primary" />
              <span>Compassionate Expert Care</span>
            </div>

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
              <Button size="lg" variant="outline" asChild className="text-base border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground">
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

          {/* Hero Image Placeholder */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="aspect-square lg:aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden soft-shadow border border-primary/20">
              <div className="w-full h-full flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Heart size={40} className="text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    [Clinician imagery placeholder]
                  </p>
                </div>
              </div>
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

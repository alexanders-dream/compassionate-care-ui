import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="gradient-navy text-white py-16 md:py-20">
      <div className="container-main">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">
            Ready to Start Your Healing Journey?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
            Our compassionate team is here to help. Request a visit today and
            experience the difference expert wound care can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link to="/request-visit" className="no-link-style">
                Request a Visit
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="border-2 border-white/80 text-white hover:bg-white/10 hover:text-white"
            >
              <a href="tel:+18001234567" className="no-link-style">
                <Phone size={18} />
                Call (800) 123-4567
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;

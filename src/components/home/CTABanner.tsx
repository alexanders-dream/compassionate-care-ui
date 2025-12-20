import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="py-16 md:py-20 bg-muted">
      <div className="container-main">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-secondary">
            Ready to Start Your Healing Journey?
          </h2>
          <p className="text-lg text-secondary/80 mb-8 max-w-xl mx-auto leading-relaxed">
            Our compassionate team is here to help. Request a consultation today and
            experience the difference expert wound care can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-primary border-2 border-primary text-white hover:bg-primary/90 hover:text-white"
            >
              <Link to="/request-visit" className="no-link-style">
                Request Consultation
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="border-2 border-secondary/60 text-secondary hover:bg-secondary/10 hover:text-secondary"
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

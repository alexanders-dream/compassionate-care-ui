import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone } from "lucide-react";

const CTABanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-primary to-blue-800 text-primary-foreground py-16 md:py-20">
      {/* Premium decorative elements */}
      <div className="absolute top-0 left-1/3 w-96 h-64 bg-white/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="container-main relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            Ready to Start Your Healing Journey?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Our compassionate team is here to help. Request a visit today and
            experience the difference expert wound care can make.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="text-base bg-background text-foreground hover:bg-background/90"
            >
              <Link to="/request-visit">
                Request a Visit
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="ghost"
              asChild
              className="text-base border border-white text-white hover:bg-white/10 hover:text-white"
            >
              <a href="tel:+18001234567">
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

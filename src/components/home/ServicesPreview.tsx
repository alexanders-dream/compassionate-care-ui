import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ArrowRight } from "lucide-react";
import homeCareImage from "@/assets/home-care-visit.jpg";
import { useSiteData } from "@/contexts/SiteDataContext";
import { getIconByName } from "@/lib/icons";

const ServicesPreview = () => {
  const { services } = useSiteData();
  const displayServices = services.slice(0, 4);

  return (
    <section className="section-padding bg-muted">
      <div className="container-main">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="mb-4">Our Services</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Comprehensive wound care solutions tailored to your unique needs,
            delivered with compassion and clinical excellence.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Services Grid */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6">
            {displayServices.map((service, index) => {
              const IconComponent = getIconByName(service.icon);
              return (
                <Card
                  key={service.id || index}
                  className="group bg-card border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 shadow-card hover:shadow-elevated"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-14 h-14 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                            <IconComponent size={28} className="text-primary" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{service.icon}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <h3 className="text-xl font-semibold mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                      {service.description}
                    </p>
                    <Link
                      to="/services"
                      className="inline-flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all"
                    >
                      Learn more
                      <ArrowRight size={16} />
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Featured Image */}
          <div className="hidden lg:block">
            <div className="rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] overflow-hidden shadow-elevated border border-accent">
              <img
                src={homeCareImage}
                alt="Healthcare professional providing in-home wound care"
                className="w-full h-full object-cover aspect-[4/5]"
              />
            </div>
          </div>
        </div>

        {/* View All CTA */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/services" className="no-link-style">
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

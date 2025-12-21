import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, Phone, FileText, CreditCard, HelpCircle, Building2, ArrowRight, Wallet, Clock, Users } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";

const processSteps = [
  {
    step: "1",
    icon: FileText,
    title: "Insurance Verification",
    description: "We verify your insurance coverage before your first visit to ensure you understand your benefits."
  },
  {
    step: "2",
    icon: Clock,
    title: "Pre-Authorization",
    description: "Our team handles all necessary pre-authorizations with your insurance company."
  },
  {
    step: "3",
    icon: CreditCard,
    title: "Treatment & Billing",
    description: "We bill your insurance directly and provide clear explanations of any out-of-pocket costs."
  },
  {
    step: "4",
    icon: Users,
    title: "Ongoing Support",
    description: "Our billing team is available to answer questions and help resolve any insurance issues."
  }
];

const Insurance = () => {
  const { insuranceProviders } = useSiteData();

  // Filter to only active providers
  const activeProviders = insuranceProviders.filter(p => p.is_active);
  const hasProviders = activeProviders.length > 0;

  // Get providers with payment details for the payment section
  const providersWithPaymentDetails = activeProviders.filter(p => p.payment_details);

  return (
    <Layout>
      <Helmet>
        <title>Insurance & Payment | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="AR Advanced Woundcare Solutions accepts Medicare, Medicaid, and most major insurance plans. Learn about our billing process and payment options." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="container-main relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary font-medium text-sm mb-6">
              <Shield className="w-4 h-4" />
              Insurance Accepted
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Insurance & <span className="text-primary">Payment</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              We work with most major insurance providers to make expert wound care accessible.
              Our team handles the paperwork so you can focus on healing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="tel:+18001234567">
                  <Phone className="w-4 h-4 mr-2" />
                  Verify Your Insurance
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/request-visit">
                  Book Consultation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Providers */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Accepted Insurance Plans
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We accept most major insurance plans and work directly with your provider to maximize your benefits.
            </p>
          </div>

          {hasProviders ? (
            <div className={activeProviders.length === 1 ? "flex justify-center" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6"}>
              {activeProviders.map((provider) => (
                <div
                  key={provider.id}
                  className={`group relative bg-gradient-to-b from-card to-card/50 hover:from-card hover:to-card/80 border border-border/50 hover:border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 ${activeProviders.length === 1 ? 'w-full max-w-xs' : ''}`}
                >
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 flex flex-col items-center w-full">
                    {provider.logo_url ? (
                      <div className="h-16 md:h-20 w-full flex items-center justify-center mb-4">
                        <img
                          src={provider.logo_url}
                          alt={provider.name}
                          className="h-full w-auto max-w-full object-contain transition-all duration-300 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="h-16 md:h-20 w-16 md:w-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:from-primary/30 group-hover:via-primary/20 group-hover:to-primary/10">
                        <Building2 className="h-8 md:h-10 w-8 md:w-10 text-primary" />
                      </div>
                    )}
                    <div className="space-y-2">
                      <span className="font-semibold text-foreground text-sm md:text-base block">{provider.name}</span>
                      {provider.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{provider.description}</p>
                      )}
                      {provider.payment_details && (
                        <div className="pt-3 border-t border-border/50 mt-3">
                          <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line leading-relaxed">{provider.payment_details}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gradient-to-br from-muted/40 via-muted/20 to-muted/40 rounded-2xl border-2 border-dashed border-border/50">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 mb-4">
                <Building2 className="w-8 h-8 text-primary/50" />
              </div>
              <p className="text-muted-foreground font-medium">No insurance providers listed at the moment.</p>
              <p className="text-sm text-muted-foreground/70 mt-2">Check back soon for updates.</p>
            </div>
          )}

          <div className="text-center mt-10">
            <p className="text-muted-foreground">
              Don't see your insurance? <Link to="/contact" className="text-primary hover:underline font-semibold inline-flex items-center gap-1">Contact us<ArrowRight className="w-4 h-4" /></Link> — we may still be able to help.
            </p>
          </div>
        </div>
      </section>

      {/* Billing Process */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Our Billing Process
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make billing simple and transparent so you can focus on what matters—your health.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative bg-card rounded-2xl p-6 shadow-soft border group hover:shadow-lg transition-shadow">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center shadow-md">
                    {step.step}
                  </div>
                  <div className="pt-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Payment Options
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Self-Pay */}
            <div className="bg-card rounded-2xl p-8 shadow-soft border">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center mb-6">
                <Wallet className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Self-Pay Options
              </h3>
              <p className="text-muted-foreground mb-6">
                For patients without insurance or with high deductibles, we offer competitive self-pay rates.
              </p>
              <ul className="space-y-3">
                {["Transparent pricing upfront", "Flexible payment plans", "All major credit cards accepted", "No hidden fees"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Insurance Coverage Check */}
            <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-primary-foreground shadow-lg">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <HelpCircle className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">
                Not Sure About Coverage?
              </h3>
              <p className="text-primary-foreground/80 mb-6">
                Contact our billing team for a free insurance verification. We'll check your benefits and explain your coverage.
              </p>
              <Button variant="secondary" size="lg" asChild className="w-full bg-white text-primary hover:bg-white/90">
                <a href="tel:+18001234567">
                  <Phone className="w-4 h-4 mr-2" />
                  Call for Verification
                </a>
              </Button>
            </div>

            {/* Billing Support */}
            <div className="bg-card rounded-2xl p-8 shadow-soft border">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Billing Questions?
              </h3>
              <p className="text-muted-foreground mb-6">
                Our dedicated team is here to help with any questions about your account or claims.
              </p>
              <div className="space-y-3">
                <Button variant="outline" asChild className="w-full">
                  <a href="tel:+18001234567">
                    <Phone className="w-4 h-4 mr-2" />
                    (800) 123-4567
                  </a>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/contact">Contact Billing Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-[#EBF4FA]">
        <div className="container-main text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Don't let insurance concerns delay your care. Contact us today and we'll help you
            understand your coverage options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/request-visit">Request Consultation</Link>
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

export default Insurance;

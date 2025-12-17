import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, Phone, FileText, CreditCard, HelpCircle } from "lucide-react";

const acceptedInsurance = [
  "Medicare",
  "Medicaid",
  "Blue Cross Blue Shield",
  "Aetna",
  "Cigna",
  "UnitedHealthcare",
  "Humana",
  "Tricare",
  "Most Private Insurance Plans"
];

const processSteps = [
  {
    step: "1",
    title: "Insurance Verification",
    description: "We verify your insurance coverage before your first visit to ensure you understand your benefits."
  },
  {
    step: "2",
    title: "Pre-Authorization",
    description: "Our team handles all necessary pre-authorizations with your insurance company."
  },
  {
    step: "3",
    title: "Treatment & Billing",
    description: "We bill your insurance directly and provide clear explanations of any out-of-pocket costs."
  },
  {
    step: "4",
    title: "Ongoing Support",
    description: "Our billing team is available to answer questions and help resolve any insurance issues."
  }
];

const Insurance = () => {
  return (
    <Layout>
      <Helmet>
        <title>Insurance & Payment | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="AR Advanced Woundcare Solutions accepts Medicare, Medicaid, and most major insurance plans. Learn about our billing process and payment options." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-background py-16 md:py-24">
        <div className="container-main text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Insurance & <span className="text-primary">Payment</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We work with most major insurance providers to make expert wound care accessible.
            Our team handles the paperwork so you can focus on healing.
          </p>
        </div>
      </section>

      {/* Accepted Insurance */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Shield className="w-12 h-12 text-primary mb-4" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Accepted Insurance Plans
              </h2>
              <p className="text-muted-foreground mb-6">
                We accept most major insurance plans and work directly with your provider to maximize
                your benefits. If you don't see your insurance listed, please contact us—we may still
                be able to help.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {acceptedInsurance.map((insurance, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground">{insurance}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-8 shadow-soft">
              <HelpCircle className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Not Sure About Your Coverage?
              </h3>
              <p className="text-muted-foreground mb-6">
                Contact our billing team for a free insurance verification. We'll check your benefits
                and explain your coverage before your first visit.
              </p>
              <Button asChild className="w-full">
                <a href="tel:+18001234567">
                  <Phone className="w-4 h-4 mr-2" />
                  Call for Verification
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Billing Process */}
      <section className="py-16 md:py-24 bg-warm dark:bg-muted/30">
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
            {processSteps.map((step, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-soft text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Options */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-8 shadow-soft">
              <CreditCard className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Self-Pay Options
              </h3>
              <p className="text-muted-foreground mb-4">
                For patients without insurance or with high deductibles, we offer competitive self-pay
                rates and flexible payment plans.
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Transparent pricing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Payment plans available
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Major credit cards accepted
                </li>
              </ul>
            </div>
            <div className="bg-card rounded-2xl p-8 shadow-soft">
              <FileText className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                Billing Questions?
              </h3>
              <p className="text-muted-foreground mb-4">
                Our dedicated billing team is here to help with any questions about your account,
                insurance claims, or payment options.
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
      <section className="py-16 md:py-24 bg-muted dark:bg-[#0B2545]">
        <div className="container-main text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground dark:text-primary-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground dark:text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Don't let insurance concerns delay your care. Contact us today and we'll help you
            understand your coverage options.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary text-white hover:bg-primary/90 dark:bg-white dark:!text-primary dark:hover:bg-white/90">
              <Link to="/request-visit">Request a Visit</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="border border-foreground text-foreground hover:bg-foreground/10 dark:border-white dark:text-white dark:hover:bg-white/10 dark:hover:text-white">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Insurance;

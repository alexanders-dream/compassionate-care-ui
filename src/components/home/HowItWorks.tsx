import { Phone, ClipboardCheck, HeartHandshake } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Phone,
    title: "Request a Visit",
    description: "Fill out our simple form or call us directly. We'll gather your information and understand your needs.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Schedule Assessment",
    description: "Our care coordinator will contact you within 24 hours to schedule a convenient appointment time.",
  },
  {
    number: "03",
    icon: HeartHandshake,
    title: "Receive Expert Care",
    description: "A certified wound care specialist will visit you, assess your condition, and begin personalized treatment.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section-padding bg-background">
      <div className="container-main">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg">
            Getting started is easy. We've simplified the process so you can
            focus on what matters most—your healing.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative text-center group"
            >
              {/* Connector Line (hidden on mobile, last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              {/* Step Number & Icon */}
              <div className="relative inline-flex flex-col items-center mb-6">
                {/* Number Removed */}
                <div className="relative z-10 w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                  <step.icon size={36} className="text-primary" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;

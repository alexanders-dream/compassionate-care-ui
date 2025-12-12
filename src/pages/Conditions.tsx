import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Activity, Droplets, Zap, Heart, Shield, AlertCircle } from "lucide-react";

const conditions = [
  {
    icon: Droplets,
    title: "Diabetic Foot Ulcers",
    description: "Specialized care for foot wounds caused by diabetes, focusing on infection prevention and healing promotion.",
    symptoms: ["Open sores on feet", "Drainage or odor", "Redness and swelling", "Numbness or tingling"]
  },
  {
    icon: Activity,
    title: "Pressure Ulcers",
    description: "Expert treatment for bedsores and pressure injuries at all stages, with focus on healing and prevention.",
    symptoms: ["Skin discoloration", "Tissue breakdown", "Open wounds", "Pain or tenderness"]
  },
  {
    icon: Zap,
    title: "Surgical Wounds",
    description: "Post-operative wound care to ensure proper healing and reduce risk of complications.",
    symptoms: ["Incision sites", "Drainage concerns", "Delayed healing", "Signs of infection"]
  },
  {
    icon: Heart,
    title: "Venous Leg Ulcers",
    description: "Comprehensive care for wounds caused by poor circulation in the legs.",
    symptoms: ["Leg swelling", "Open sores on legs", "Skin discoloration", "Aching or heaviness"]
  },
  {
    icon: Shield,
    title: "Traumatic Wounds",
    description: "Treatment for wounds from accidents, falls, or injuries that require specialized care.",
    symptoms: ["Cuts and lacerations", "Skin tears", "Abrasions", "Slow-healing injuries"]
  },
  {
    icon: AlertCircle,
    title: "Chronic Non-Healing Wounds",
    description: "Advanced care for wounds that have not responded to traditional treatment methods.",
    symptoms: ["Wounds lasting 30+ days", "Recurring infections", "Failed previous treatments", "Complex wound beds"]
  }
];

const Conditions = () => {
  return (
    <Layout>
      <Helmet>
        <title>Conditions We Treat | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="AR Advanced Woundcare Solutions treats diabetic ulcers, pressure wounds, surgical wounds, venous ulcers, and chronic non-healing wounds with expert in-home care." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm via-background to-primary/10 py-16 md:py-24">
        <div className="container-main text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Conditions We <span className="text-primary">Treat</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our specialized team provides expert care for a wide range of wound types, 
            delivering personalized treatment plans in the comfort of your home.
          </p>
        </div>
      </section>

      {/* Conditions Grid */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {conditions.map((condition, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-soft">
                <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mb-4">
                  <condition.icon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  {condition.title}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {condition.description}
                </p>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Common Signs:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {condition.symptoms.map((symptom, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {symptom}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-warm">
        <div className="container-main text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Not Sure About Your Condition?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Our clinical team can assess your wound and recommend the best treatment approach. 
            Contact us for a consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/request-visit">Request a Visit</Link>
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

export default Conditions;

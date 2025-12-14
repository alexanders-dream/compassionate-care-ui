import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Heart, Building, Calendar, MapPin, Phone } from "lucide-react";

const initiatives = [
  {
    icon: Building,
    title: "Skilled Nursing Facility Partnerships",
    description: "We partner with skilled nursing facilities to provide specialized wound care expertise, reducing hospital readmissions and improving patient outcomes."
  },
  {
    icon: Heart,
    title: "Health Fairs & Screenings",
    description: "Our team participates in community health fairs, offering free wound assessments and educational materials on wound prevention."
  },
  {
    icon: Users,
    title: "Provider Education",
    description: "We offer continuing education opportunities for healthcare providers on advanced wound care techniques and best practices."
  },
  {
    icon: Calendar,
    title: "Support Groups",
    description: "We sponsor and participate in support groups for patients living with chronic conditions that affect wound healing."
  }
];

const partnerTypes = [
  "Home Health Agencies",
  "Skilled Nursing Facilities",
  "Hospitals & Health Systems",
  "Primary Care Physicians",
  "Endocrinologists",
  "Vascular Surgeons",
  "Podiatrists",
  "Case Managers"
];

const Community = () => {
  return (
    <Layout>
      <Helmet>
        <title>Community Outreach | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="AR Advanced Woundcare Solutions is committed to community health through partnerships, education, and outreach programs across our service areas." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-warm via-background to-primary/10 py-16 md:py-24">
        <div className="container-main text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Community <span className="text-primary">Outreach</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to improving wound care outcomes across our communities through education,
            partnerships, and accessible care initiatives.
          </p>
        </div>
      </section>

      {/* Initiatives */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Our Community Initiatives
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From health screenings to provider education, we're actively working to improve
              wound care awareness and outcomes in our community.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {initiatives.map((initiative, index) => (
              <div key={index} className="bg-card rounded-2xl p-6 shadow-soft flex gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                  <initiative.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {initiative.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {initiative.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Section */}
      <section className="py-16 md:py-24 bg-warm">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Partner With Us
              </h2>
              <p className="text-muted-foreground mb-6">
                We collaborate with healthcare providers and facilities across our service area to
                deliver coordinated, comprehensive wound care. Our partnerships ensure patients
                receive seamless care transitions and optimal outcomes.
              </p>
              <h3 className="font-semibold text-foreground mb-3">We Partner With:</h3>
              <div className="grid grid-cols-2 gap-2">
                {partnerTypes.map((type, index) => (
                  <div key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {type}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl p-8 shadow-soft">
              <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                Interested in Partnering?
              </h3>
              <p className="text-muted-foreground mb-6">
                Contact our partnership team to learn how we can work together to improve wound care
                outcomes in your patient population.
              </p>
              <div className="space-y-3">
                <Button asChild className="w-full">
                  <Link to="/refer">Refer a Patient</Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/contact">Contact Partnership Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 md:py-24">
        <div className="container-main text-center">
          <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
            Our Service Area
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We provide in-home wound care services throughout the greater metropolitan area and
            surrounding communities. Contact us to confirm service availability in your location.
          </p>
          <Button size="lg" variant="outline" asChild>
            <a href="tel:+18001234567">
              <Phone className="w-4 h-4 mr-2" />
              Call to Check Availability
            </a>
          </Button>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-blue-600 via-primary to-blue-800 relative overflow-hidden">
        {/* Premium decorative elements */}
        <div className="absolute top-0 left-1/4 w-80 h-64 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container-main relative z-10 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
            Join Our Mission
          </h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Together, we can improve wound care outcomes and quality of life for patients
            across our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90">
              <Link to="/refer">Refer a Patient</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="border border-white text-white hover:bg-white/10 hover:text-white">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Community;

import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Shield, Users, Award, Target, Eye } from "lucide-react";
import heroClinician from "@/assets/hero-clinician.jpg";
import { useSiteData } from "@/contexts/SiteDataContext";

const values = [
  {
    icon: Heart,
    title: "Compassion",
    description: "We treat every patient with empathy, dignity, and respect, understanding the challenges they face on their healing journey."
  },
  {
    icon: Shield,
    title: "Clinical Excellence",
    description: "Our team maintains the highest standards of evidence-based wound care through continuous education and training."
  },
  {
    icon: Users,
    title: "Patient-Centered Care",
    description: "We develop individualized treatment plans that address each patient's unique needs, lifestyle, and goals."
  },
  {
    icon: Award,
    title: "Integrity",
    description: "We operate with transparency, honesty, and accountability in every interaction with patients and partners."
  }
];

const stats = [
  { value: "10,000+", label: "Patients Served" },
  { value: "98%", label: "Patient Satisfaction" },
  { value: "15+", label: "Years Experience" },
  { value: "50+", label: "Healthcare Partners" }
];

const About = () => {
  const { teamMembers } = useSiteData();
  return (
    <Layout>
      <Helmet>
        <title>About Us | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="Learn about AR Advanced Woundcare Solutions' mission to provide compassionate, expert wound care in the comfort of your home." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-background py-16 md:py-24">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                Healing with <span className="text-primary">Compassion</span> & Expertise
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                AR Advanced Woundcare Solutions was founded on a simple belief: everyone deserves access to
                exceptional wound care delivered with compassion, in the comfort of their own home.
              </p>
            </div>
            <div className="relative">
              <img
                src={heroClinician}
                alt="AR Advanced Woundcare team providing compassionate care"
                className="rounded-2xl shadow-elegant w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-24 bg-warm dark:bg-background">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card rounded-2xl p-8 shadow-soft">
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                To deliver exceptional, patient-centered wound care that promotes healing, improves quality of life,
                and empowers patients and their families through education and compassionate support.
              </p>
            </div>
            <div className="bg-card rounded-2xl p-8 shadow-soft">
              <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">Our Vision</h2>
              <p className="text-muted-foreground">
                To be the most trusted provider of in-home wound care services, recognized for clinical excellence,
                innovation, and unwavering commitment to patient outcomes and satisfaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These values guide everything we do, from patient care to partnership relationships.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-6 shadow-soft text-center"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-primary dark:bg-card">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-display text-4xl md:text-5xl font-bold text-white dark:text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-white/80 dark:text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our dedicated team of wound care specialists brings years of experience and a passion for patient care.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-card rounded-2xl overflow-hidden shadow-soft group"
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Users className="w-16 h-16 text-primary/40" />
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-primary font-medium text-sm mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container-main text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Partner With Us
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Whether you're a patient seeking care or a healthcare provider looking to refer patients,
            we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="no-link-style" asChild>
              <Link to="/request-visit">Book a Visit</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/refer">Refer a Patient</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;

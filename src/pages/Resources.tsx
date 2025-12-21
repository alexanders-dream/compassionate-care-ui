import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { FileText, Download, BookOpen, Video, Phone } from "lucide-react";
import { useSiteData } from "@/contexts/SiteDataContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText,
  BookOpen,
  Video,
};

const Resources = () => {
  const { patientResources } = useSiteData();
  return (
    <Layout>
      <Helmet>
        <title>Patient Resources | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="Access wound care guides, educational materials, videos, and FAQs to support your healing journey with AR Advanced Woundcare Solutions." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-[#EBF4FA] dark:bg-background py-16 md:py-24">
        <div className="container-main text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Patient <span className="text-primary">Resources</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Educational materials and guides to support your wound care journey and empower you
            with knowledge for better healing outcomes.
          </p>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            Educational Materials
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patientResources.map((resource, index) => {
              const IconComponent = iconMap[resource.icon] || FileText;
              return (
                <div key={resource.id || index} className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-elegant transition-shadow h-full flex flex-col">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 flex flex-col h-full">
                      <span className="text-xs text-primary font-medium">Resource</span>
                      <h3 className="font-display text-lg font-semibold text-foreground mt-1 mb-2">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 flex-1">
                        {resource.description}
                      </p>
                      <Button variant="outline" size="sm" className="gap-2 mt-auto self-start" asChild>
                        <a
                          href={resource.file_url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={resource.file_name}
                        >
                          <Download className="w-4 h-4" />
                          Access Resource
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* Contact CTA */}
      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="bg-[#EBF4FA] dark:bg-card rounded-2xl p-8 md:p-12 shadow-soft text-center">
            <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
              Have More Questions?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Our patient care team is here to help. Contact us for personalized support
              and answers to your specific questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-white">
                <Link to="/contact">Contact Us</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:+18001234567">Call (800) 123-4567</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;

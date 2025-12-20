import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Accessibility = () => {
  return (
    <Layout>
      <Helmet>
        <title>Accessibility Statement | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="AR Advanced Woundcare Solutions is committed to ensuring digital accessibility for people with disabilities." />
      </Helmet>

      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
              Accessibility Statement
            </h1>

            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-sm text-muted-foreground mb-8">
                Last updated: January 1, 2024
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Our Commitment
              </h2>
              <p>
                AR Advanced Woundcare Solutions is committed to ensuring digital accessibility
                for people with disabilities. We continually work to improve the user experience
                for everyone and apply relevant accessibility standards.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Accessibility Standards
              </h2>
              <p>
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                standards. These guidelines help make web content more accessible to people with
                disabilities, including those who are blind or have low vision, deaf or hard of
                hearing, have mobility impairments, or have cognitive disabilities.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Accessibility Features
              </h2>
              <p>Our website includes the following accessibility features:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Keyboard navigation support throughout the site</li>
                <li>Clear and consistent navigation structure</li>
                <li>Descriptive alt text for images</li>
                <li>Sufficient color contrast for text readability</li>
                <li>Resizable text without loss of functionality</li>
                <li>Form labels and instructions for all input fields</li>
                <li>Focus indicators for interactive elements</li>
                <li>Semantic HTML structure</li>
              </ul>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Assistive Technology Compatibility
              </h2>
              <p>
                Our website is designed to be compatible with the following assistive technologies:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
              </ul>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Known Limitations
              </h2>
              <p>
                While we strive for comprehensive accessibility, some areas of our website may
                have limitations. We are actively working to address these issues and improve
                accessibility across all pages.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Alternative Access
              </h2>
              <p>
                If you experience difficulty accessing any content on our website, we're here to
                help. You can always reach us by phone at (800) 123-4567 during business hours,
                and our team will be happy to assist you with any information or services you need.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Feedback
              </h2>
              <p>
                We welcome your feedback on the accessibility of our website. If you encounter
                any accessibility barriers or have suggestions for improvement, please let us know:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Email: accessibility@arwoundcare.com</li>
                <li>Phone: (800) 123-4567</li>
                <li>Mail: 123 Healthcare Blvd, Suite 100, Medical City, ST 12345</li>
              </ul>
              <p className="mt-4">
                We aim to respond to accessibility feedback within 5 business days.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Continuous Improvement
              </h2>
              <p>
                We are committed to ongoing accessibility improvements. Our team regularly reviews
                our website and makes updates to ensure we meet or exceed accessibility standards.
              </p>
            </div>

            <div className="mt-12 p-6 bg-warm dark:bg-muted/30 rounded-2xl">
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                Need Assistance?
              </h3>
              <p className="text-muted-foreground mb-4">
                If you need help accessing our services or have questions about accessibility,
                our team is here to help.
              </p>
              <Button asChild>
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Accessibility;

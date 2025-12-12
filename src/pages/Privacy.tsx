import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";

const Privacy = () => {
  return (
    <Layout>
      <Helmet>
        <title>Privacy Policy | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="Learn about how AR Advanced Woundcare Solutions collects, uses, and protects your personal and health information." />
      </Helmet>

      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-sm text-muted-foreground mb-8">
                Last updated: January 1, 2024
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Introduction
              </h2>
              <p>
                AR Advanced Woundcare Solutions ("we," "our," or "us") is committed to protecting 
                your privacy. This Privacy Policy explains how we collect, use, disclose, and 
                safeguard your information when you use our services or visit our website.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Information We Collect
              </h2>
              <p>We may collect information about you in various ways, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Personal identification information (name, email address, phone number)</li>
                <li>Health information necessary to provide wound care services</li>
                <li>Insurance and billing information</li>
                <li>Information you provide when contacting us or requesting services</li>
              </ul>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                How We Use Your Information
              </h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Provide, maintain, and improve our wound care services</li>
                <li>Process your requests and appointments</li>
                <li>Communicate with you about your care</li>
                <li>Process insurance claims and billing</li>
                <li>Comply with legal obligations and healthcare regulations</li>
              </ul>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                HIPAA Compliance
              </h2>
              <p>
                As a healthcare provider, we are committed to protecting your Protected Health 
                Information (PHI) in accordance with the Health Insurance Portability and 
                Accountability Act (HIPAA). We maintain appropriate administrative, technical, 
                and physical safeguards to protect your health information.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Information Sharing
              </h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may 
                share your information with:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Healthcare providers involved in your care</li>
                <li>Insurance companies for billing purposes</li>
                <li>Service providers who assist our operations</li>
                <li>Legal authorities when required by law</li>
              </ul>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Your Rights
              </h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Access your health records</li>
                <li>Request corrections to your information</li>
                <li>Request restrictions on certain uses of your information</li>
                <li>Receive a copy of this privacy policy</li>
              </ul>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Contact Us
              </h2>
              <p>
                If you have questions about this Privacy Policy or our privacy practices, please 
                contact us at:
              </p>
              <p className="mt-4">
                <strong className="text-foreground">AR Advanced Woundcare Solutions</strong><br />
                123 Healthcare Blvd, Suite 100<br />
                Medical City, ST 12345<br />
                Phone: (800) 123-4567<br />
                Email: privacy@arwoundcare.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Privacy;

import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";

const Terms = () => {
  return (
    <Layout>
      <Helmet>
        <title>Terms of Service | AR Advanced Woundcare Solutions</title>
        <meta name="description" content="Read the terms and conditions for using AR Advanced Woundcare Solutions' website and services." />
      </Helmet>

      <section className="py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-8">
              Terms of Service
            </h1>
            
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-sm text-muted-foreground mb-8">
                Last updated: January 1, 2024
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Acceptance of Terms
              </h2>
              <p>
                By accessing or using the AR Advanced Woundcare Solutions website and services, 
                you agree to be bound by these Terms of Service. If you do not agree to these 
                terms, please do not use our services.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Services Description
              </h2>
              <p>
                AR Advanced Woundcare Solutions provides in-home wound care services, including 
                assessment, treatment, and patient education. Our services are provided by 
                licensed healthcare professionals and are intended to complement, not replace, 
                your primary healthcare provider.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Medical Disclaimer
              </h2>
              <p>
                The information provided on this website is for general informational purposes 
                only and is not intended as medical advice. Always consult with a qualified 
                healthcare provider for diagnosis and treatment of any medical condition.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Patient Responsibilities
              </h2>
              <p>As a patient, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Provide accurate and complete health information</li>
                <li>Follow your prescribed treatment plan</li>
                <li>Notify us of any changes in your condition</li>
                <li>Keep scheduled appointments or provide adequate notice of cancellation</li>
                <li>Provide a safe environment for home visits</li>
              </ul>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Insurance and Payment
              </h2>
              <p>
                We accept most major insurance plans. You are responsible for understanding 
                your insurance coverage and for any costs not covered by insurance. Payment 
                is due at the time of service unless other arrangements have been made.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Intellectual Property
              </h2>
              <p>
                All content on this website, including text, graphics, logos, and images, is 
                the property of AR Advanced Woundcare Solutions and is protected by copyright 
                and other intellectual property laws.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Limitation of Liability
              </h2>
              <p>
                AR Advanced Woundcare Solutions shall not be liable for any indirect, incidental, 
                special, or consequential damages arising from the use of our services or website. 
                Our liability is limited to the maximum extent permitted by law.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. Changes will 
                be effective immediately upon posting to this website. Your continued use of our 
                services constitutes acceptance of any changes.
              </p>

              <h2 className="font-display text-xl font-semibold text-foreground mt-8 mb-4">
                Contact Information
              </h2>
              <p>
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-4">
                <strong className="text-foreground">AR Advanced Woundcare Solutions</strong><br />
                123 Healthcare Blvd, Suite 100<br />
                Medical City, ST 12345<br />
                Phone: (800) 123-4567<br />
                Email: info@arwoundcare.com
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Terms;

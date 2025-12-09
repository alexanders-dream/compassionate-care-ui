import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import ServicesPreview from "@/components/home/ServicesPreview";
import HowItWorks from "@/components/home/HowItWorks";
import TrustSection from "@/components/home/TrustSection";
import TestimonialHighlight from "@/components/home/TestimonialHighlight";
import CTABanner from "@/components/home/CTABanner";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AR Advanced Woundcare Solutions | Expert Wound Care You Can Trust</title>
        <meta 
          name="description" 
          content="AR Advanced Woundcare Solutions provides compassionate, expert wound care services. Request a visit or refer a patient today for personalized treatment and faster healing." 
        />
        <meta name="keywords" content="wound care, advanced wound treatment, chronic wound care, wound healing, in-home wound care" />
      </Helmet>
      <Layout>
        <HeroSection />
        <ServicesPreview />
        <HowItWorks />
        <TrustSection />
        <TestimonialHighlight />
        <CTABanner />
      </Layout>
    </>
  );
};

export default Index;

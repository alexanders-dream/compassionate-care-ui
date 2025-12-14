export interface SiteCopySection {
  id: string;
  page: string;
  section: string;
  fields: {
    key: string;
    label: string;
    value: string;
    type: "text" | "textarea";
  }[];
}

export const defaultSiteCopy: SiteCopySection[] = [
  {
    id: "home-hero",
    page: "Home",
    section: "Hero Section",
    fields: [
      { key: "badge", label: "Badge Text", value: "Compassionate Expert Care", type: "text" },
      { key: "headlineMain", label: "Main Headline", value: "Advanced Wound Care", type: "text" },
      { key: "headlineAccent", label: "Headline Accent", value: "You Can Trust", type: "text" },
      { key: "subheadline", label: "Subheadline", value: "We bring specialized wound care directly to you. Our team of experienced clinicians delivers compassionate, evidence-based treatment for faster healing and better outcomes.", type: "textarea" },
      { key: "trustIndicator1", label: "Trust Indicator 1", value: "Licensed & Certified", type: "text" },
      { key: "trustIndicator2", label: "Trust Indicator 2", value: "10,000+ Patients Served", type: "text" },
    ]
  },
  {
    id: "home-services",
    page: "Home",
    section: "Services Preview",
    fields: [
      { key: "title", label: "Section Title", value: "Comprehensive Wound Care Services", type: "text" },
      { key: "subtitle", label: "Section Subtitle", value: "Our Services", type: "text" },
      { key: "description", label: "Description", value: "We offer a full range of specialized wound care services, delivered with expertise and compassion.", type: "textarea" },
    ]
  },
  {
    id: "home-how-it-works",
    page: "Home",
    section: "How It Works",
    fields: [
      { key: "title", label: "Section Title", value: "How It Works", type: "text" },
      { key: "description", label: "Description", value: "Getting the wound care you need is simple. Our streamlined process ensures you receive expert treatment quickly.", type: "textarea" },
      { key: "step1Title", label: "Step 1 Title", value: "Request a Visit", type: "text" },
      { key: "step1Description", label: "Step 1 Description", value: "Fill out our simple form or call us to schedule your initial consultation.", type: "textarea" },
      { key: "step2Title", label: "Step 2 Title", value: "Assessment", type: "text" },
      { key: "step2Description", label: "Step 2 Description", value: "Our clinician evaluates your wound and creates a personalized treatment plan.", type: "textarea" },
      { key: "step3Title", label: "Step 3 Title", value: "Treatment & Healing", type: "text" },
      { key: "step3Description", label: "Step 3 Description", value: "Receive expert care with regular visits to monitor progress and adjust treatment.", type: "textarea" },
    ]
  },
  {
    id: "home-trust",
    page: "Home",
    section: "Trust Section",
    fields: [
      { key: "title", label: "Section Title", value: "Why Families Trust Us", type: "text" },
      { key: "description", label: "Description", value: "We are committed to providing the highest quality wound care with compassion and expertise.", type: "textarea" },
    ]
  },
  {
    id: "home-cta",
    page: "Home",
    section: "CTA Banner",
    fields: [
      { key: "title", label: "CTA Title", value: "Ready to Start Your Healing Journey?", type: "text" },
      { key: "description", label: "CTA Description", value: "Whether you need care for yourself or want to refer a patient, we're here to help. Get in touch today.", type: "textarea" },
    ]
  },
  {
    id: "about-intro",
    page: "About Us",
    section: "Introduction",
    fields: [
      { key: "title", label: "Page Title", value: "About AR Advanced Woundcare", type: "text" },
      { key: "subtitle", label: "Subtitle", value: "Dedicated to Healing, Committed to Care", type: "text" },
      { key: "description", label: "Description", value: "AR Advanced Woundcare Solutions was founded with a simple mission: to provide exceptional, compassionate wound care to patients in the comfort of their homes.", type: "textarea" },
    ]
  },
  {
    id: "about-mission",
    page: "About Us",
    section: "Mission & Vision",
    fields: [
      { key: "missionTitle", label: "Mission Title", value: "Our Mission", type: "text" },
      { key: "missionText", label: "Mission Statement", value: "To deliver exceptional wound care that promotes healing, restores independence, and improves quality of life for every patient we serve.", type: "textarea" },
      { key: "visionTitle", label: "Vision Title", value: "Our Vision", type: "text" },
      { key: "visionText", label: "Vision Statement", value: "To be the most trusted provider of advanced wound care services, known for clinical excellence and patient-centered care.", type: "textarea" },
    ]
  },
  {
    id: "about-team",
    page: "About Us",
    section: "Team Section",
    fields: [
      { key: "title", label: "Section Title", value: "Meet Our Team", type: "text" },
      { key: "description", label: "Description", value: "Our dedicated team of wound care specialists brings years of experience and a passion for patient care.", type: "textarea" },
    ]
  },
  {
    id: "contact-intro",
    page: "Contact",
    section: "Introduction",
    fields: [
      { key: "title", label: "Page Title", value: "Contact Us", type: "text" },
      { key: "subtitle", label: "Subtitle", value: "We're Here to Help", type: "text" },
      { key: "description", label: "Description", value: "Have questions or ready to schedule a visit? Reach out to our team and we'll get back to you promptly.", type: "textarea" },
    ]
  },
  {
    id: "services-intro",
    page: "Services",
    section: "Introduction",
    fields: [
      { key: "title", label: "Page Title", value: "Our Services", type: "text" },
      { key: "subtitle", label: "Subtitle", value: "Comprehensive Wound Care Solutions", type: "text" },
      { key: "description", label: "Description", value: "We offer a complete range of wound care services, from initial assessment to ongoing treatment and healing.", type: "textarea" },
    ]
  },
  {
    id: "footer",
    page: "Global",
    section: "Footer",
    fields: [
      { key: "companyDescription", label: "Company Description", value: "AR Advanced Woundcare Solutions provides expert wound care services with compassion and clinical excellence.", type: "textarea" },
      { key: "phone", label: "Phone Number", value: "(555) 123-4567", type: "text" },
      { key: "email", label: "Email", value: "info@arwoundcare.com", type: "text" },
      { key: "address", label: "Address", value: "123 Healthcare Drive, Houston, TX 77001", type: "text" },
    ]
  },
];

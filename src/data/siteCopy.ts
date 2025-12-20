export interface SiteCopyField {
  key: string;
  label: string;
  value: string;
  type: "text" | "textarea" | "image";
}

export interface SiteCopySection {
  id: string;
  page: string;
  section: string;
  fields: SiteCopyField[];
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
      { key: "heroImage", label: "Hero Image", value: "/src/assets/hero-clinician.jpg", type: "image" },
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
      { key: "step1Title", label: "Step 1 Title", value: "Request Consultation", type: "text" },
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
    section: "Hero Section",
    fields: [
      { key: "title", label: "Page Title", value: "Healing with Compassion & Expertise", type: "text" },
      { key: "description", label: "Description", value: "AR Advanced Woundcare Solutions was founded on a simple belief: everyone deserves access to exceptional wound care delivered with compassion, in the comfort of their own home.", type: "textarea" },
      { key: "heroImage", label: "About Hero Image", value: "/src/assets/hero-clinician.jpg", type: "image" },
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
      { key: "description", label: "Description", value: "Have questions or ready to schedule a consultation? Reach out to our team and we'll get back to you promptly.", type: "textarea" },
    ]
  },
  {
    id: "services-intro",
    page: "Services",
    section: "Hero Section",
    fields: [
      { key: "title", label: "Page Title", value: "Expert Wound Care, Delivered to You", type: "text" },
      { key: "description", label: "Description", value: "Our certified wound care specialists provide comprehensive treatment for all types of wounds, bringing clinical expertise directly to your home for convenient, compassionate care.", type: "textarea" },
      { key: "heroImage", label: "Services Hero Image", value: "/src/assets/home-care-visit.jpg", type: "image" },
    ]
  },
  {
    id: "request-visit",
    page: "Request Visit",
    section: "Page Content",
    fields: [
      { key: "title", label: "Page Title", value: "Request Consultation", type: "text" },
      { key: "description", label: "Description", value: "Take the first step toward healing. Fill out the form below and our care team will contact you within 24 hours.", type: "textarea" },
      { key: "sidebarImage", label: "Sidebar Image", value: "/src/assets/wound-care-supplies.jpg", type: "image" },
    ]
  },
  {
    id: "refer-patient",
    page: "Provider Referral",
    section: "Page Content",
    fields: [
      { key: "title", label: "Page Title", value: "Refer a Patient", type: "text" },
      { key: "description", label: "Description", value: "Partner with us to provide your patients with specialized wound care. We keep you informed every step of the way.", type: "textarea" },
    ]
  },
  {
    id: "community-hero",
    page: "Community",
    section: "Hero Section",
    fields: [
      { key: "title", label: "Page Title", value: "Community Outreach", type: "text" },
      { key: "description", label: "Description", value: "We're committed to improving wound care outcomes across our communities through education, partnerships, and accessible care initiatives.", type: "textarea" },
    ]
  },
  {
    id: "community-initiatives",
    page: "Community",
    section: "Community Initiatives",
    fields: [
      { key: "sectionTitle", label: "Section Title", value: "Our Community Initiatives", type: "text" },
      { key: "sectionDescription", label: "Section Description", value: "From health screenings to provider education, we're actively working to improve wound care awareness and outcomes in our community.", type: "textarea" },
      { key: "initiative1Title", label: "Initiative 1 Title", value: "Skilled Nursing Facility Partnerships", type: "text" },
      { key: "initiative1Description", label: "Initiative 1 Description", value: "We partner with skilled nursing facilities to provide specialized wound care expertise, reducing hospital readmissions and improving patient outcomes.", type: "textarea" },
      { key: "initiative2Title", label: "Initiative 2 Title", value: "Health Fairs & Screenings", type: "text" },
      { key: "initiative2Description", label: "Initiative 2 Description", value: "Our team participates in community health fairs, offering free wound assessments and educational materials on wound prevention.", type: "textarea" },
      { key: "initiative3Title", label: "Initiative 3 Title", value: "Provider Education", type: "text" },
      { key: "initiative3Description", label: "Initiative 3 Description", value: "We offer continuing education opportunities for healthcare providers on advanced wound care techniques and best practices.", type: "textarea" },
      { key: "initiative4Title", label: "Initiative 4 Title", value: "Support Groups", type: "text" },
      { key: "initiative4Description", label: "Initiative 4 Description", value: "We sponsor and participate in support groups for patients living with chronic conditions that affect wound healing.", type: "textarea" },
    ]
  },
  {
    id: "community-partnership",
    page: "Community",
    section: "Partnership Section",
    fields: [
      { key: "title", label: "Section Title", value: "Partner With Us", type: "text" },
      { key: "description", label: "Description", value: "We collaborate with healthcare providers and facilities across our service area to deliver coordinated, comprehensive wound care. Our partnerships ensure patients receive seamless care transitions and optimal outcomes.", type: "textarea" },
      { key: "cardTitle", label: "Card Title", value: "Interested in Partnering?", type: "text" },
      { key: "cardDescription", label: "Card Description", value: "Contact our partnership team to learn how we can work together to improve wound care outcomes in your patient population.", type: "textarea" },
    ]
  },
  {
    id: "community-service-area",
    page: "Community",
    section: "Service Area",
    fields: [
      { key: "title", label: "Section Title", value: "Our Service Area", type: "text" },
      { key: "description", label: "Description", value: "We provide in-home wound care services throughout the greater metropolitan area and surrounding communities. Contact us to confirm service availability in your location.", type: "textarea" },
    ]
  },
  {
    id: "community-cta",
    page: "Community",
    section: "CTA Section",
    fields: [
      { key: "title", label: "CTA Title", value: "Join Our Mission", type: "text" },
      { key: "description", label: "CTA Description", value: "Together, we can improve wound care outcomes and quality of life for patients across our community.", type: "textarea" },
    ]
  },
  {
    id: "insurance-hero",
    page: "Insurance",
    section: "Hero Section",
    fields: [
      { key: "title", label: "Page Title", value: "Insurance & Payment", type: "text" },
      { key: "description", label: "Description", value: "We work with most major insurance providers to make expert wound care accessible. Our team handles the paperwork so you can focus on healing.", type: "textarea" },
    ]
  },
  {
    id: "insurance-plans",
    page: "Insurance",
    section: "Accepted Insurance",
    fields: [
      { key: "title", label: "Section Title", value: "Accepted Insurance Plans", type: "text" },
      { key: "description", label: "Description", value: "We accept most major insurance plans and work directly with your provider to maximize your benefits. If you don't see your insurance listed, please contact us—we may still be able to help.", type: "textarea" },
      { key: "cardTitle", label: "Coverage Card Title", value: "Not Sure About Your Coverage?", type: "text" },
      { key: "cardDescription", label: "Coverage Card Description", value: "Contact our billing team for a free insurance verification. We'll check your benefits and explain your coverage before your first visit.", type: "textarea" },
    ]
  },
  {
    id: "insurance-billing",
    page: "Insurance",
    section: "Billing Process",
    fields: [
      { key: "title", label: "Section Title", value: "Our Billing Process", type: "text" },
      { key: "description", label: "Description", value: "We make billing simple and transparent so you can focus on what matters—your health.", type: "textarea" },
      { key: "step1Title", label: "Step 1 Title", value: "Insurance Verification", type: "text" },
      { key: "step1Description", label: "Step 1 Description", value: "We verify your insurance coverage before your first visit to ensure you understand your benefits.", type: "textarea" },
      { key: "step2Title", label: "Step 2 Title", value: "Pre-Authorization", type: "text" },
      { key: "step2Description", label: "Step 2 Description", value: "Our team handles all necessary pre-authorizations with your insurance company.", type: "textarea" },
      { key: "step3Title", label: "Step 3 Title", value: "Treatment & Billing", type: "text" },
      { key: "step3Description", label: "Step 3 Description", value: "We bill your insurance directly and provide clear explanations of any out-of-pocket costs.", type: "textarea" },
      { key: "step4Title", label: "Step 4 Title", value: "Ongoing Support", type: "text" },
      { key: "step4Description", label: "Step 4 Description", value: "Our billing team is available to answer questions and help resolve any insurance issues.", type: "textarea" },
    ]
  },
  {
    id: "insurance-payment",
    page: "Insurance",
    section: "Payment Options",
    fields: [
      { key: "selfPayTitle", label: "Self-Pay Title", value: "Self-Pay Options", type: "text" },
      { key: "selfPayDescription", label: "Self-Pay Description", value: "For patients without insurance or with high deductibles, we offer competitive self-pay rates and flexible payment plans.", type: "textarea" },
      { key: "billingTitle", label: "Billing Questions Title", value: "Billing Questions?", type: "text" },
      { key: "billingDescription", label: "Billing Questions Description", value: "Our dedicated billing team is here to help with any questions about your account, insurance claims, or payment options.", type: "textarea" },
    ]
  },
  {
    id: "insurance-cta",
    page: "Insurance",
    section: "CTA Section",
    fields: [
      { key: "title", label: "CTA Title", value: "Ready to Get Started?", type: "text" },
      { key: "description", label: "CTA Description", value: "Don't let insurance concerns delay your care. Contact us today and we'll help you understand your coverage options.", type: "textarea" },
    ]
  },
  {
    id: "conditions-hero",
    page: "Conditions",
    section: "Hero Section",
    fields: [
      { key: "title", label: "Page Title", value: "Conditions We Treat", type: "text" },
      { key: "description", label: "Description", value: "Our specialized team provides expert care for a wide range of wound types, delivering personalized treatment plans in the comfort of your home.", type: "textarea" },
    ]
  },
  {
    id: "conditions-cta",
    page: "Conditions",
    section: "CTA Section",
    fields: [
      { key: "title", label: "CTA Title", value: "Not Sure About Your Condition?", type: "text" },
      { key: "description", label: "CTA Description", value: "Our clinical team can assess your wound and recommend the best treatment approach. Contact us for a consultation.", type: "textarea" },
    ]
  },
  {
    id: "testimonials-hero",
    page: "Testimonials",
    section: "Hero Section",
    fields: [
      { key: "title", label: "Page Title", value: "Patient Testimonials", type: "text" },
      { key: "description", label: "Description", value: "Hear from our patients and healthcare partners about their experience with our compassionate, expert wound care services.", type: "textarea" },
    ]
  },
  {
    id: "testimonials-stats",
    page: "Testimonials",
    section: "Statistics",
    fields: [
      { key: "stat1Value", label: "Satisfaction Rate", value: "98%", type: "text" },
      { key: "stat1Label", label: "Satisfaction Label", value: "Patient Satisfaction", type: "text" },
      { key: "stat2Value", label: "Patients Served", value: "10,000+", type: "text" },
      { key: "stat2Label", label: "Patients Label", value: "Patients Served", type: "text" },
      { key: "stat3Value", label: "Average Rating", value: "4.9", type: "text" },
      { key: "stat3Label", label: "Rating Label", value: "Average Rating", type: "text" },
      { key: "stat4Value", label: "Partner Providers", value: "50+", type: "text" },
      { key: "stat4Label", label: "Partners Label", value: "Partner Providers", type: "text" },
    ]
  },
  {
    id: "testimonials-cta",
    page: "Testimonials",
    section: "CTA Section",
    fields: [
      { key: "title", label: "CTA Title", value: "Ready to Experience Our Care?", type: "text" },
      { key: "description", label: "CTA Description", value: "Join thousands of satisfied patients who have trusted AR Advanced Woundcare Solutions with their healing journey.", type: "textarea" },
    ]
  },
  {
    id: "resources-hero",
    page: "Resources",
    section: "Hero Section",
    fields: [
      { key: "title", label: "Page Title", value: "Patient Resources", type: "text" },
      { key: "description", label: "Description", value: "Educational materials and guides to support your wound care journey and empower you with knowledge for better healing outcomes.", type: "textarea" },
    ]
  },
  {
    id: "resources-materials",
    page: "Resources",
    section: "Educational Materials",
    fields: [
      { key: "title", label: "Section Title", value: "Educational Materials", type: "text" },
    ]
  },
  {
    id: "resources-faq",
    page: "Resources",
    section: "FAQ Section",
    fields: [
      { key: "title", label: "Section Title", value: "Frequently Asked Questions", type: "text" },
      { key: "description", label: "Description", value: "Common questions about our wound care services and what to expect.", type: "textarea" },
    ]
  },
  {
    id: "resources-contact",
    page: "Resources",
    section: "Contact CTA",
    fields: [
      { key: "title", label: "Section Title", value: "Have More Questions?", type: "text" },
      { key: "description", label: "Description", value: "Our patient care team is here to help. Contact us for personalized support and answers to your specific questions.", type: "textarea" },
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
  {
    id: "site-images",
    page: "Global",
    section: "Site Images",
    fields: [
      { key: "heroClinician", label: "Hero Clinician Image", value: "/src/assets/hero-clinician.jpg", type: "image" },
      { key: "homeCareVisit", label: "Home Care Visit Image", value: "/src/assets/home-care-visit.jpg", type: "image" },
      { key: "woundCareSupplies", label: "Wound Care Supplies Image", value: "/src/assets/wound-care-supplies.jpg", type: "image" },
    ]
  },
];

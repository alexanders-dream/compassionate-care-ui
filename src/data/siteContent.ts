export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const defaultTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Maria Johnson",
    role: "Patient",
    content: "The care I received was exceptional. The team was compassionate and professional throughout my treatment.",
    rating: 5
  },
  {
    id: "2",
    name: "Dr. Robert Chen",
    role: "Referring Physician",
    content: "I consistently refer my patients to AR Advanced Woundcare. Their expertise and patient outcomes are outstanding.",
    rating: 5
  },
  {
    id: "3",
    name: "Susan Williams",
    role: "Family Caregiver",
    content: "They made the home care process so much easier for our family. Highly recommend their services.",
    rating: 5
  }
];

export const defaultServices: Service[] = [
  {
    id: "1",
    title: "Wound Assessment",
    description: "Comprehensive evaluation of wound type, size, and healing progress to create personalized treatment plans.",
    icon: "Stethoscope"
  },
  {
    id: "2",
    title: "Chronic Wound Care",
    description: "Specialized treatment for diabetic ulcers, pressure injuries, and venous wounds.",
    icon: "Heart"
  },
  {
    id: "3",
    title: "Post-Surgical Care",
    description: "Expert management of surgical wounds to prevent complications and promote healing.",
    icon: "Scissors"
  },
  {
    id: "4",
    title: "In-Home Visits",
    description: "Convenient wound care services delivered in the comfort of your home.",
    icon: "Home"
  }
];

export const defaultTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Dr. Amanda Richards",
    role: "Medical Director",
    bio: "Board-certified wound care specialist with over 15 years of experience."
  },
  {
    id: "2",
    name: "James Thompson, RN",
    role: "Lead Wound Care Nurse",
    bio: "Certified wound care nurse specializing in chronic wound management."
  },
  {
    id: "3",
    name: "Lisa Chen",
    role: "Patient Care Coordinator",
    bio: "Dedicated to ensuring seamless care coordination for all patients."
  }
];

export const defaultFAQs: FAQ[] = [
  {
    id: "1",
    question: "What types of wounds do you treat?",
    answer: "We treat all types of wounds including diabetic ulcers, pressure injuries, surgical wounds, venous ulcers, and traumatic wounds.",
    category: "Services"
  },
  {
    id: "2",
    question: "Do you accept insurance?",
    answer: "Yes, we accept most major insurance plans including Medicare and Medicaid. Contact us for verification.",
    category: "Insurance"
  },
  {
    id: "3",
    question: "How do I schedule a visit?",
    answer: "You can schedule a visit by calling us, filling out our online form, or having your physician send a referral.",
    category: "Appointments"
  }
];

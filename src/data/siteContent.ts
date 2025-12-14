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

export interface VisitRequest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  preferredContact: string;
  woundType: string;
  additionalInfo?: string;
  submittedAt: string;
  status: "pending" | "contacted" | "scheduled" | "completed";
  emailSent?: boolean;
}

export interface ProviderReferralSubmission {
  id: string;
  providerName: string;
  practiceName: string;
  providerPhone: string;
  providerEmail: string;
  providerNPI?: string;
  patientFirstName: string;
  patientLastName: string;
  patientPhone: string;
  patientAddress: string;
  patientDOB: string;
  woundType: string;
  urgency: string;
  clinicalNotes?: string;
  submittedAt: string;
  status: "pending" | "contacted" | "scheduled" | "completed";
  emailSent?: boolean;
}

export interface PatientResource {
  id: string;
  title: string;
  description: string;
  type: "PDF Guide" | "Educational Article" | "Video Tutorial";
  icon: string;
  url?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number; // in minutes
  type: "initial" | "follow-up" | "wound-assessment" | "dressing-change";
  clinician: string;
  location: "in-home" | "clinic";
  address?: string;
  notes?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show";
  linkedSubmissionId?: string;
  linkedSubmissionType?: "visit" | "referral";
  createdAt: string;
}

export const sampleAppointments: Appointment[] = [
  {
    id: "apt1",
    patientName: "John Smith",
    patientPhone: "(555) 123-4567",
    patientEmail: "john.smith@email.com",
    appointmentDate: "2024-01-20",
    appointmentTime: "09:00",
    duration: 60,
    type: "initial",
    clinician: "James Thompson, RN",
    location: "in-home",
    address: "123 Main St, Houston, TX 77001",
    notes: "First wound assessment",
    status: "scheduled",
    linkedSubmissionId: "vr1",
    linkedSubmissionType: "visit",
    createdAt: "2024-01-15T10:45:00"
  },
  {
    id: "apt2",
    patientName: "Robert Davis",
    patientPhone: "(555) 444-5555",
    patientEmail: "rdavis@email.com",
    appointmentDate: "2024-01-21",
    appointmentTime: "14:00",
    duration: 45,
    type: "wound-assessment",
    clinician: "Dr. Amanda Richards",
    location: "in-home",
    address: "456 Oak Ave, Houston, TX 77002",
    notes: "Stage 2 pressure ulcer - referred by Dr. Wilson",
    status: "confirmed",
    linkedSubmissionId: "ref1",
    linkedSubmissionType: "referral",
    createdAt: "2024-01-15T09:30:00"
  }
];

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

export const defaultPatientResources: PatientResource[] = [
  {
    id: "1",
    title: "Wound Care Guide",
    description: "Comprehensive guide to understanding wound types, healing stages, and proper care techniques.",
    type: "PDF Guide",
    icon: "FileText"
  },
  {
    id: "2",
    title: "Diabetic Foot Care",
    description: "Essential information for diabetic patients on preventing foot ulcers and maintaining foot health.",
    type: "Educational Article",
    icon: "BookOpen"
  },
  {
    id: "3",
    title: "Dressing Change Instructions",
    description: "Step-by-step video guide for proper wound dressing changes between visits.",
    type: "Video Tutorial",
    icon: "Video"
  },
  {
    id: "4",
    title: "Nutrition for Healing",
    description: "Learn how proper nutrition supports wound healing and what foods promote recovery.",
    type: "PDF Guide",
    icon: "FileText"
  },
  {
    id: "5",
    title: "Pressure Ulcer Prevention",
    description: "Tips and techniques for preventing pressure ulcers in bedridden or mobility-limited patients.",
    type: "Educational Article",
    icon: "BookOpen"
  },
  {
    id: "6",
    title: "Understanding Your Treatment",
    description: "Overview of advanced wound care treatments and what to expect during your care journey.",
    type: "Video Tutorial",
    icon: "Video"
  }
];

// Sample form submissions for demo purposes
export const sampleVisitRequests: VisitRequest[] = [
  {
    id: "vr1",
    firstName: "John",
    lastName: "Smith",
    phone: "(555) 123-4567",
    email: "john.smith@email.com",
    address: "123 Main St, Houston, TX 77001",
    preferredContact: "phone",
    woundType: "diabetic",
    additionalInfo: "Need morning appointments if possible",
    submittedAt: "2024-01-15T10:30:00",
    status: "pending",
    emailSent: false
  },
  {
    id: "vr2",
    firstName: "Mary",
    lastName: "Johnson",
    phone: "(555) 987-6543",
    email: "mary.j@email.com",
    address: "456 Oak Ave, Houston, TX 77002",
    preferredContact: "email",
    woundType: "surgical",
    submittedAt: "2024-01-14T14:15:00",
    status: "contacted",
    emailSent: true
  }
];

export const sampleReferrals: ProviderReferralSubmission[] = [
  {
    id: "ref1",
    providerName: "Dr. Sarah Wilson",
    practiceName: "Wilson Family Practice",
    providerPhone: "(555) 222-3333",
    providerEmail: "swilson@wilsonfp.com",
    providerNPI: "1234567890",
    patientFirstName: "Robert",
    patientLastName: "Davis",
    patientPhone: "(555) 444-5555",
    patientAddress: "789 Elm St, Houston, TX 77003",
    patientDOB: "1955-03-20",
    woundType: "pressure",
    urgency: "soon",
    clinicalNotes: "Patient is bedridden, stage 2 pressure ulcer on sacrum",
    submittedAt: "2024-01-15T09:00:00",
    status: "pending",
    emailSent: false
  }
];

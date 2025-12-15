// Re-export types from SiteDataContext for consistency
export type { 
  Testimonial, 
  Service, 
  TeamMember, 
  FAQ, 
  PatientResource,
  FormConfig 
} from "@/contexts/SiteDataContext";

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

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
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

// Default data removed - now fetched from Supabase

// Re-export types from SiteDataContext for consistency
export type {
  Testimonial,
  Service,
  TeamMember,
  FAQ,
  PatientResource,
  FormConfig,
  VisitRequest,
  ProviderReferralSubmission
} from "@/contexts/SiteDataContext";

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

// Mock data removed in favor of Supabase data


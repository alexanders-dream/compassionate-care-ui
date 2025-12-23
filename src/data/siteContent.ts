// Re-export types from SiteDataContext for consistency
export type {
  Testimonial,
  Service,
  TeamMember,
  FAQ,
  PatientResource,
  VisitRequest,
  ProviderReferralSubmission,
  Appointment
} from "@/contexts/SiteDataContext";

// Note: All data is now fetched from Supabase via SiteDataContext

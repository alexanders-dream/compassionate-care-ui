import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

// Types based on Supabase schema
export interface Testimonial {
  id: string;
  name: string;
  role?: string | null;
  quote: string;
  rating: number;
  is_featured: boolean;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  image_url?: string | null;
  display_order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
}

export interface PatientResource {
  id: string;
  title: string;
  description: string;
  icon: string;
  file_url?: string | null;
  file_name?: string | null;
  file_size?: string | null;
  download_count: number;
}


export interface FormConfig {
  id: string;
  form_name: string;
  config: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  // Legacy support for admin UI
  name?: string;
  fields?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
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

// Database record types for Supabase responses
interface VisitRequestRecord {
  id: string;
  patient_name: string;
  phone: string;
  email: string;
  address: string;
  wound_type: string;
  additional_notes?: string;
  created_at: string;
  status?: string;
}

interface ProviderReferralRecord {
  id: string;
  provider_name: string;
  provider_organization?: string;
  provider_phone: string;
  provider_email: string;
  patient_name: string;
  patient_phone: string;
  patient_address: string;
  wound_type: string;
  urgency?: string;
  clinical_notes?: string;
  created_at: string;
  status?: string;
}

interface SiteDataContextType {
  // Data
  testimonials: Testimonial[];
  services: Service[];
  teamMembers: TeamMember[];
  faqs: FAQ[];
  patientResources: PatientResource[];
  visitRequests: VisitRequest[];
  referrals: ProviderReferralSubmission[];
  formConfigs: FormConfig[];
  loading: boolean;

  // Refresh functions
  refreshTestimonials: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshTeamMembers: () => Promise<void>;
  refreshFaqs: () => Promise<void>;
  refreshPatientResources: () => Promise<void>;
  refreshVisitRequests: () => Promise<void>;
  refreshReferrals: () => Promise<void>;
  refreshFormConfigs: () => Promise<void>;

  // Legacy setters for admin (will be replaced with mutations)
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  setFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>;
  setPatientResources: React.Dispatch<React.SetStateAction<PatientResource[]>>;
  setVisitRequests: React.Dispatch<React.SetStateAction<VisitRequest[]>>;
  setReferrals: React.Dispatch<React.SetStateAction<ProviderReferralSubmission[]>>;
  setFormConfigs: React.Dispatch<React.SetStateAction<FormConfig[]>>;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (!context) {
    throw new Error("useSiteData must be used within a SiteDataProvider");
  }
  return context;
};

interface SiteDataProviderProps {
  children: ReactNode;
}

export const SiteDataProvider = ({ children }: SiteDataProviderProps) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [patientResources, setPatientResources] = useState<PatientResource[]>([]);
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>([]);
  const [referrals, setReferrals] = useState<ProviderReferralSubmission[]>([]);
  const [formConfigs, setFormConfigs] = useState<FormConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTestimonials(data);
    }
  };

  const refreshServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setServices(data);
    }
  };

  const refreshTeamMembers = async () => {
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setTeamMembers(data);
    }
  };

  const refreshFaqs = async () => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setFaqs(data);
    }
  };

  const refreshPatientResources = async () => {
    const { data, error } = await supabase
      .from("patient_resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setPatientResources(data);
    }
  };

  const refreshVisitRequests = async () => {
    const { data, error } = await supabase
      .from("visit_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVisitRequests(data.map((item: VisitRequestRecord) => {
        // Handle name splitting helper
        const [firstName, ...lastNameParts] = (item.patient_name || "").split(" ");
        const lastName = lastNameParts.join(" ");

        return {
          id: item.id,
          firstName: firstName || "",
          lastName: lastName || "",
          phone: item.phone,
          email: item.email, // Schema has 'email'
          address: item.address, // Schema has 'address'
          preferredContact: "phone", // Schema missing this, defaulting to phone or could derive from preferred_time?
          woundType: item.wound_type,
          additionalInfo: item.additional_notes || "",
          submittedAt: item.created_at,
          status: (item.status || "pending") as VisitRequest["status"],
          emailSent: false // not in provided schema for visit_requests, defaulting
        };
      }));
    }
  };

  const refreshReferrals = async () => {
    const { data, error } = await supabase
      .from("provider_referrals")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReferrals(data.map((item: ProviderReferralRecord) => {
        // Handle name splitting
        const [pFirst, ...pLastParts] = (item.patient_name || "").split(" ");
        const pLast = pLastParts.join(" ");

        return {
          id: item.id,
          providerName: item.provider_name,
          practiceName: item.provider_organization || "", // Map provider_organization to practiceName
          providerPhone: item.provider_phone,
          providerEmail: item.provider_email,
          providerNPI: "", // Schema missing NPI? User schema didn't show it in CREATE TABLE public.provider_referrals... wait, checking schema again.
          // User schema: provider_name, provider_organization, provider_email, provider_phone, patient_name... No NPI.

          patientFirstName: pFirst || "",
          patientLastName: pLast || "",
          patientPhone: item.patient_phone,
          patientAddress: item.patient_address,
          patientDOB: "", // Schema missing DOB?? User schema: patient_name, patient_email, patient_phone, patient_address, wound_type... No DOB.
          woundType: item.wound_type,
          urgency: item.urgency || "routine",
          clinicalNotes: item.clinical_notes || "",
          submittedAt: item.created_at,
          status: (item.status || "pending") as ProviderReferralSubmission["status"],
          emailSent: false
        };
      }));
    }
  };

  const refreshFormConfigs = async () => {
    const { data, error } = await supabase
      .from("form_configs")
      .select("*");

    if (!error && data) {
      setFormConfigs(data);
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        refreshTestimonials(),
        refreshServices(),
        refreshTeamMembers(),
        refreshFaqs(),
        refreshPatientResources(),
        refreshVisitRequests(),
        refreshReferrals(),
        refreshFormConfigs(),
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <SiteDataContext.Provider
      value={{
        testimonials,
        services,
        teamMembers,
        faqs,
        patientResources,
        visitRequests,
        referrals,
        formConfigs,
        loading,
        refreshTestimonials,
        refreshServices,
        refreshTeamMembers,
        refreshFaqs,
        refreshPatientResources,
        refreshVisitRequests,
        refreshReferrals,
        refreshFormConfigs,
        setTestimonials,
        setServices,
        setTeamMembers,
        setFaqs,
        setPatientResources,
        setVisitRequests,
        setReferrals,
        setFormConfigs,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
};

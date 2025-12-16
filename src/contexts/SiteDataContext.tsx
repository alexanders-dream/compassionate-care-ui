import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

import { defaultSiteCopy, SiteCopySection } from "@/data/siteCopy";
import { defaultFormConfigs } from "@/data/formConfig";

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
  status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled";
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
  status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled";
  emailSent?: boolean;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string | null;
  patientEmail: string | null;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: "initial" | "follow-up" | "wound-assessment" | "dressing-change"; // Added type
  clinician: string;
  location: "in-home" | "clinic"; // Added location
  address?: string | null;
  notes?: string | null;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  visitRequestId?: string | null;
  providerReferralId?: string | null;
  reminderSent: boolean;
  createdAt: string;
}

// Database record type for Supabase response
interface AppointmentRecord {
  id: string;
  patient_name: string;
  patient_phone: string | null;
  patient_email: string | null;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  clinician: string;
  patient_address: string | null;
  notes: string | null;
  status: string;
  visit_request_id: string | null;
  provider_referral_id: string | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
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

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  status: "draft" | "published" | "scheduled";
  imageUrl?: string;
  readTime?: string;
  publishedAt?: string;
  scheduledAt?: string;
  tags?: string[];
  slug: string;
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
  appointments: Appointment[];
  blogPosts: BlogPost[];
  siteCopy: SiteCopySection[];
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
  refreshAppointments: () => Promise<void>;
  refreshBlogPosts: () => Promise<void>;
  refreshSiteCopy: () => Promise<void>;

  // Legacy setters for admin (will be replaced with mutations)
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  setFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>;
  setPatientResources: React.Dispatch<React.SetStateAction<PatientResource[]>>;
  setVisitRequests: React.Dispatch<React.SetStateAction<VisitRequest[]>>;
  setReferrals: React.Dispatch<React.SetStateAction<ProviderReferralSubmission[]>>;
  setFormConfigs: React.Dispatch<React.SetStateAction<FormConfig[]>>;
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setBlogPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
  setSiteCopy: React.Dispatch<React.SetStateAction<SiteCopySection[]>>;
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
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [siteCopy, setSiteCopy] = useState<SiteCopySection[]>([]);
  const [loading, setLoading] = useState(true);

  // ... (existing refresh functions) ...

  const refreshBlogPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBlogPosts(data.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        category: post.category,
        status: (post.status as BlogPost["status"]) || "draft",
        imageUrl: post.image_url || undefined,
        readTime: post.read_time || undefined,
        publishedAt: post.published_at || undefined,
        scheduledAt: post.scheduled_at || undefined,
        tags: post.tags || [],
        slug: post.slug
      })));
    }
  };

  const refreshSiteCopy = async () => {
    const { data, error } = await supabase
      .from("site_copy")
      .select("*");

    if (!error && data) {
      // Merge DB content with default structure
      const mergedCopy = defaultSiteCopy.map(section => {
        const dbSection = data.find(item => item.id === section.id);
        if (dbSection && dbSection.content) {
          const content = dbSection.content as Record<string, string>;
          return {
            ...section,
            fields: section.fields.map(field => ({
              ...field,
              value: content[field.key] !== undefined ? content[field.key] : field.value
            }))
          };
        }
        return section;
      });
      setSiteCopy(mergedCopy);
    } else {
      // Fallback to defaults if no DB data or error (or empty table)
      if (!data || data.length === 0) {
        setSiteCopy(defaultSiteCopy);
      }
    }
  };

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
          providerNPI: "",
          patientFirstName: pFirst || "",
          patientLastName: pLast || "",
          patientPhone: item.patient_phone,
          patientAddress: item.patient_address,
          patientDOB: "",
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

    if (!error && data && data.length > 0) {
      setFormConfigs(data.map(item => {
        const config = item.config as any;
        return {
          id: item.id,
          form_name: item.form_name,
          config: item.config,
          name: item.form_name,
          fields: config?.fields || []
        };
      }));
    } else {
      // Fallback to defaults if DB is empty
      setFormConfigs(defaultFormConfigs.map(c => ({
        id: c.id,
        form_name: c.name,
        config: { description: c.description, fields: c.fields },
        name: c.name,
        fields: c.fields
      })));
    }
  };

  const refreshAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true });

    if (!error && data) {
      const validAppointments: Appointment[] = (data || []).map(item => ({
        id: item.id,
        patientName: item.patient_name,
        patientPhone: item.patient_phone,
        patientEmail: item.patient_email,
        appointmentDate: item.appointment_date,
        appointmentTime: item.appointment_time,
        duration: item.duration_minutes,
        type: (item as any).type || "initial", // Default until migration run & types updated
        clinician: item.clinician,
        location: (item as any).location || "in-home", // Default until migration run & types updated
        address: item.patient_address,
        notes: item.notes,
        status: (item.status as Appointment["status"]) || "scheduled", // Cast to ensure type safety
        visitRequestId: item.visit_request_id,
        providerReferralId: item.provider_referral_id,
        reminderSent: item.reminder_sent,
        createdAt: item.created_at
      }));
      setAppointments(validAppointments);
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
        refreshAppointments(),
        refreshBlogPosts(),
        refreshSiteCopy()
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
        appointments,
        blogPosts,
        siteCopy,
        loading,
        refreshTestimonials,
        refreshServices,
        refreshTeamMembers,
        refreshFaqs,
        refreshPatientResources,
        refreshVisitRequests,
        refreshReferrals,
        refreshFormConfigs,
        refreshAppointments,
        refreshBlogPosts,
        refreshSiteCopy,
        setTestimonials,
        setServices,
        setTeamMembers,
        setFaqs,
        setPatientResources,
        setVisitRequests,
        setReferrals,
        setFormConfigs,
        setAppointments,
        setBlogPosts,
        setSiteCopy,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
};

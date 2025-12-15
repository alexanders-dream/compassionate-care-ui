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
  config: any;
  // Legacy support for admin UI
  name?: string;
  fields?: any[];
}

interface SiteDataContextType {
  // Data
  testimonials: Testimonial[];
  services: Service[];
  teamMembers: TeamMember[];
  faqs: FAQ[];
  patientResources: PatientResource[];
  formConfigs: FormConfig[];
  loading: boolean;
  
  // Refresh functions
  refreshTestimonials: () => Promise<void>;
  refreshServices: () => Promise<void>;
  refreshTeamMembers: () => Promise<void>;
  refreshFaqs: () => Promise<void>;
  refreshPatientResources: () => Promise<void>;
  refreshFormConfigs: () => Promise<void>;
  
  // Legacy setters for admin (will be replaced with mutations)
  setTestimonials: React.Dispatch<React.SetStateAction<Testimonial[]>>;
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
  setFaqs: React.Dispatch<React.SetStateAction<FAQ[]>>;
  setPatientResources: React.Dispatch<React.SetStateAction<PatientResource[]>>;
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
        formConfigs,
        loading,
        refreshTestimonials,
        refreshServices,
        refreshTeamMembers,
        refreshFaqs,
        refreshPatientResources,
        refreshFormConfigs,
        setTestimonials,
        setServices,
        setTeamMembers,
        setFaqs,
        setPatientResources,
        setFormConfigs,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
};

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Testimonial,
  Service,
  TeamMember,
  FAQ,
  PatientResource,
  defaultTestimonials,
  defaultServices,
  defaultTeamMembers,
  defaultFAQs,
  defaultPatientResources,
} from "@/data/siteContent";
import { defaultFormConfigs, FormConfig } from "@/data/formConfig";

interface SiteDataContextType {
  // Data
  testimonials: Testimonial[];
  services: Service[];
  teamMembers: TeamMember[];
  faqs: FAQ[];
  patientResources: PatientResource[];
  formConfigs: FormConfig[];
  
  // Setters
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeamMembers);
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs);
  const [patientResources, setPatientResources] = useState<PatientResource[]>(defaultPatientResources);
  const [formConfigs, setFormConfigs] = useState<FormConfig[]>(defaultFormConfigs);

  return (
    <SiteDataContext.Provider
      value={{
        testimonials,
        services,
        teamMembers,
        faqs,
        patientResources,
        formConfigs,
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

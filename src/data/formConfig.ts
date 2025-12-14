export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  id: string;
  key: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "select" | "textarea";
  placeholder?: string;
  required: boolean;
  enabled: boolean;
  options?: FormFieldOption[];
  helpText?: string;
  order: number;
}

export interface FormConfig {
  id: string;
  name: string;
  description: string;
  fields: FormFieldConfig[];
}

export const defaultFormConfigs: FormConfig[] = [
  {
    id: "request-visit",
    name: "Request a Visit",
    description: "Form for patients to request a home visit",
    fields: [
      { id: "rv-1", key: "firstName", label: "First Name", type: "text", placeholder: "John", required: true, enabled: true, order: 1 },
      { id: "rv-2", key: "lastName", label: "Last Name", type: "text", placeholder: "Doe", required: true, enabled: true, order: 2 },
      { id: "rv-3", key: "phone", label: "Phone Number", type: "tel", placeholder: "(555) 123-4567", required: true, enabled: true, order: 3 },
      { id: "rv-4", key: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true, enabled: true, order: 4 },
      { id: "rv-5", key: "address", label: "Home Address", type: "text", placeholder: "123 Main St, City, State ZIP", required: true, enabled: true, helpText: "Required for scheduling in-home wound care visits", order: 5 },
      { id: "rv-6", key: "preferredContact", label: "Preferred Contact Method", type: "select", required: true, enabled: true, order: 6, options: [
        { value: "phone", label: "Phone Call" },
        { value: "text", label: "Text Message" },
        { value: "email", label: "Email" },
      ]},
      { id: "rv-7", key: "woundType", label: "Wound Type", type: "select", required: true, enabled: true, order: 7, options: [
        { value: "diabetic", label: "Diabetic Ulcer" },
        { value: "pressure", label: "Pressure Ulcer" },
        { value: "venous", label: "Venous Ulcer" },
        { value: "surgical", label: "Surgical Wound" },
        { value: "other", label: "Other / Not Sure" },
      ]},
      { id: "rv-8", key: "additionalInfo", label: "Additional Information", type: "textarea", placeholder: "Please share any additional details about your wound care needs...", required: false, enabled: true, order: 8 },
    ]
  },
  {
    id: "provider-referral",
    name: "Provider Referral",
    description: "Form for healthcare providers to refer patients",
    fields: [
      // Provider fields
      { id: "pr-1", key: "providerName", label: "Provider Name", type: "text", placeholder: "Dr. Jane Smith", required: true, enabled: true, order: 1 },
      { id: "pr-2", key: "practiceName", label: "Practice Name", type: "text", placeholder: "City Medical Group", required: true, enabled: true, order: 2 },
      { id: "pr-3", key: "providerPhone", label: "Provider Phone", type: "tel", placeholder: "(555) 123-4567", required: true, enabled: true, order: 3 },
      { id: "pr-4", key: "providerEmail", label: "Provider Email", type: "email", placeholder: "provider@practice.com", required: true, enabled: true, order: 4 },
      { id: "pr-5", key: "providerNPI", label: "NPI Number", type: "text", placeholder: "1234567890", required: false, enabled: true, order: 5 },
      // Patient fields
      { id: "pr-6", key: "patientFirstName", label: "Patient First Name", type: "text", placeholder: "John", required: true, enabled: true, order: 6 },
      { id: "pr-7", key: "patientLastName", label: "Patient Last Name", type: "text", placeholder: "Doe", required: true, enabled: true, order: 7 },
      { id: "pr-8", key: "patientPhone", label: "Patient Phone", type: "tel", placeholder: "(555) 987-6543", required: true, enabled: true, order: 8 },
      { id: "pr-9", key: "patientDOB", label: "Date of Birth", type: "date", required: true, enabled: true, order: 9 },
      { id: "pr-10", key: "patientAddress", label: "Patient Address", type: "text", placeholder: "123 Main St, City, State ZIP", required: true, enabled: true, helpText: "Required for scheduling in-home wound care visits", order: 10 },
      { id: "pr-11", key: "woundType", label: "Wound Type", type: "select", required: true, enabled: true, order: 11, options: [
        { value: "diabetic", label: "Diabetic Ulcer" },
        { value: "pressure", label: "Pressure Ulcer" },
        { value: "venous", label: "Venous Ulcer" },
        { value: "arterial", label: "Arterial Ulcer" },
        { value: "surgical", label: "Surgical Wound" },
        { value: "traumatic", label: "Traumatic Wound" },
        { value: "other", label: "Other" },
      ]},
      { id: "pr-12", key: "urgency", label: "Urgency Level", type: "select", required: true, enabled: true, order: 12, options: [
        { value: "routine", label: "Routine (within 1 week)" },
        { value: "soon", label: "Soon (within 48 hours)" },
        { value: "urgent", label: "Urgent (within 24 hours)" },
      ]},
      { id: "pr-13", key: "clinicalNotes", label: "Clinical Notes", type: "textarea", placeholder: "Wound description, current treatments, relevant medical history...", required: false, enabled: true, order: 13 },
    ]
  },
  {
    id: "contact",
    name: "Contact Form",
    description: "General contact form",
    fields: [
      { id: "cf-1", key: "name", label: "Full Name", type: "text", placeholder: "John Doe", required: true, enabled: true, order: 1 },
      { id: "cf-2", key: "email", label: "Email Address", type: "email", placeholder: "john@example.com", required: true, enabled: true, order: 2 },
      { id: "cf-3", key: "phone", label: "Phone Number", type: "tel", placeholder: "(555) 123-4567", required: false, enabled: true, order: 3 },
      { id: "cf-4", key: "subject", label: "Subject", type: "select", required: true, enabled: true, order: 4, options: [
        { value: "general", label: "General Inquiry" },
        { value: "services", label: "Services Question" },
        { value: "billing", label: "Billing Question" },
        { value: "careers", label: "Careers" },
        { value: "other", label: "Other" },
      ]},
      { id: "cf-5", key: "message", label: "Message", type: "textarea", placeholder: "How can we help you?", required: true, enabled: true, order: 5 },
    ]
  }
];

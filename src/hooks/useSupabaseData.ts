import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Hook for visit requests submissions
export function useVisitRequests() {
  const { toast } = useToast();

  const submitVisitRequest = async (data: {
    patient_name: string;
    email: string;
    phone: string;
    address: string;
    wound_type?: string;
    preferred_date?: string;
    preferred_time?: string;
    preferred_contact?: string;
    additional_notes?: string;
  }) => {
    try {
      const { error } = await supabase.from("visit_requests").insert([data]);

      if (error) throw error;


      toast({
        title: "Request Submitted",
        description: "Your request has been securely recorded.",
      });

      // Trigger Email Worker
      try {
        const workerUrl = import.meta.env.VITE_WORKER_URL;
        if (workerUrl) {
          let emailErrors = [];

          // 1. Notify Admin
          const adminResp = await fetch(`${workerUrl}/notify-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'visit_request', details: data }),
          });
          if (!adminResp.ok) emailErrors.push("Admin notification");

          // 2. Notify Patient (Confirmation)
          const patientResp = await fetch(`${workerUrl}/notify-patient`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.email,
              name: data.patient_name,
              type: 'visit_request'
            }),
          });
          if (!patientResp.ok) emailErrors.push("Patient confirmation");

          if (emailErrors.length === 0) {
            toast({
              title: "Confirmation Sent",
              description: "Emails have been sent successfully.",
            });
          } else {
            console.error("Email errors:", emailErrors);
            toast({
              variant: "destructive",
              title: "Email Delivery Issue",
              description: "Form saved, but confirmation emails failed to send.",
            });
          }
        }
      } catch (workerError) {
        console.error("Worker notification failed:", workerError);
        toast({
          variant: "destructive",
          title: "Email System Error",
          description: "Form saved, but email system is unreachable.",
        });
      }

      return { success: true };
    } catch (err) {
      console.error("Error submitting visit request:", err);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  };

  return { submitVisitRequest };
}

// Hook for provider referrals
export function useProviderReferrals() {
  const { toast } = useToast();

  const submitReferral = async (data: {
    provider_name: string;
    provider_organization?: string;
    provider_phone: string;
    provider_email: string;
    patient_name: string;
    patient_phone: string;
    patient_email?: string;
    patient_address: string;
    wound_type?: string;
    urgency?: string;
    clinical_notes?: string;
  }) => {
    try {
      const { error } = await supabase.from("provider_referrals").insert([data]);

      if (error) throw error;


      toast({
        title: "Referral Submitted",
        description: "Referral has been recorded in the system.",
      });

      // Trigger Email Worker
      try {
        const workerUrl = import.meta.env.VITE_WORKER_URL;
        if (workerUrl) {
          let emailErrors = [];

          // 1. Notify Admin
          const adminResp = await fetch(`${workerUrl}/notify-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'referral', details: data }),
          });
          if (!adminResp.ok) emailErrors.push("Admin notification");

          // 2. Notify Patient (if email provided)
          if (data.patient_email) {
            const patientResp = await fetch(`${workerUrl}/notify-patient`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: data.patient_email,
                name: data.patient_name,
                type: 'referral'
              }),
            });
            if (!patientResp.ok) emailErrors.push("Patient notification");
          }

          if (emailErrors.length === 0) {
            toast({
              title: "Confirmation Sent",
              description: "Notification emails sent successfully.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Email Delivery Issue",
              description: "Referral saved, but some emails failed to send.",
            });
          }
        }
      } catch (workerError) {
        console.error("Worker notification failed:", workerError);
        toast({
          variant: "destructive",
          title: "Email System Error",
          description: "Referral saved, but email system is unreachable.",
        });
      }

      return { success: true };
    } catch (err) {
      console.error("Error submitting referral:", err);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting the referral. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  };

  return { submitReferral };
}

// Hook for contact submissions
export function useContactSubmissions() {
  const { toast } = useToast();

  const submitContact = async (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => {
    try {
      const { error } = await supabase.from("contact_submissions").insert([data]);

      if (error) throw error;


      toast({
        title: "Message Saved",
        description: "We have received your message.",
      });

      // Trigger Email Worker
      try {
        const workerUrl = import.meta.env.VITE_WORKER_URL;
        if (workerUrl) {
          // 1. Notify Admin
          const adminResp = await fetch(`${workerUrl}/notify-admin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'contact', details: data }),
          });

          if (adminResp.ok) {
            toast({
              title: "Notification Sent",
              description: "Admin has been notified of your message.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Notification Failed",
              description: "Message saved, but failed to notify admin.",
            });
          }
        }
      } catch (workerError) {
        console.error("Worker notification failed:", workerError);
        toast({
          variant: "destructive",
          title: "Email System Error",
          description: "Message saved, but email system is unreachable.",
        });
      }

      return { success: true };
    } catch (err) {
      console.error("Error submitting contact form:", err);
      toast({
        title: "Submission Failed",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: err };
    }
  };

  return { submitContact };
}

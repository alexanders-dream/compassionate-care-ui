import { useSiteData } from "@/contexts/SiteDataContext";
import VisitRequestsTab from "@/components/admin/tabs/VisitRequestsTab";
import ReferralsTab from "@/components/admin/tabs/ReferralsTab";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ScheduleDialog, AppointmentFormData, useClinicians } from "@/components/admin/AppointmentScheduler";
import { useAppointmentMutations } from "@/hooks/useAppointmentMutations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Send, Mail } from "lucide-react";

// Types extracted from Admin.tsx logic
import { VisitRequest, ProviderReferralSubmission } from "@/contexts/SiteDataContext";

const SubmissionsPage = () => {
    const {
        visitRequests,
        referrals,
        appointments,
        refreshVisitRequests,
        refreshReferrals,
        refreshAppointments
    } = useSiteData();
    const { toast } = useToast();
    const { createAppointment } = useAppointmentMutations();
    const { clinicians } = useClinicians();

    const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
    const [scheduleInitialData, setScheduleInitialData] = useState<Partial<AppointmentFormData> | undefined>(undefined);

    // Email dialog state
    const [emailOpen, setEmailOpen] = useState(false);
    const [emailData, setEmailData] = useState<{ id: string; type: "visit" | "referral"; to: string; subject: string; message: string } | null>(null);

    // Internal function to update visit status directly (without opening dialog)
    const updateVisitStatusDirect = async (id: string, status: VisitRequest["status"]) => {
        const { error } = await supabase.from("visit_requests").update({ status }).eq("id", id);
        if (error) toast({ title: "Failed to update status", variant: "destructive" });
        else {
            toast({ title: "Status updated" });
            refreshVisitRequests();
        }
    };

    // Internal function to update referral status directly (without opening dialog)
    const updateReferralStatusDirect = async (id: string, status: ProviderReferralSubmission["status"]) => {
        const { error } = await supabase.from("provider_referrals").update({ status }).eq("id", id);
        if (error) toast({ title: "Failed to update status", variant: "destructive" });
        else {
            toast({ title: "Status updated" });
            refreshReferrals();
        }
    };

    const updateVisitStatus = async (id: string, status: VisitRequest["status"]) => {
        // If changing to "scheduled", open the schedule dialog instead of just updating status
        if (status === "scheduled") {
            // Prevent duplicate dialogs
            if (isScheduleDialogOpen) return;

            const request = visitRequests.find(vr => vr.id === id);
            if (request) {
                openScheduleDialog("visit", request);
                return;
            }
        }

        await updateVisitStatusDirect(id, status);
    };

    const updateReferralStatus = async (id: string, status: ProviderReferralSubmission["status"]) => {
        // If changing to "scheduled", open the schedule dialog instead of just updating status
        if (status === "scheduled") {
            // Prevent duplicate dialogs
            if (isScheduleDialogOpen) return;

            const referral = referrals.find(r => r.id === id);
            if (referral) {
                openScheduleDialog("referral", referral);
                return;
            }
        }

        await updateReferralStatusDirect(id, status);
    };

    const deleteVisitRequest = async (id: string) => {
        // Also delete any linked appointment
        await supabase.from("appointments").delete().eq("visit_request_id", id);

        const { error } = await supabase.from("visit_requests").delete().eq("id", id);
        if (error) {
            toast({ title: "Failed to delete request", variant: "destructive" });
        } else {
            toast({ title: "Visit request deleted" });
            refreshVisitRequests();
            refreshAppointments();
        }
    };

    const deleteReferral = async (id: string) => {
        // Also delete any linked appointment
        await supabase.from("appointments").delete().eq("provider_referral_id", id);

        const { error } = await supabase.from("provider_referrals").delete().eq("id", id);
        if (error) {
            toast({ title: "Failed to delete referral" });
        } else {
            toast({ title: "Referral deleted" });
            refreshReferrals();
            refreshAppointments();
        }
    };

    const openScheduleDialog = (type: "visit" | "referral", item: any) => {
        // Prevent duplicate dialogs
        if (isScheduleDialogOpen) return;

        if (type === "visit") {
            const req = item as VisitRequest;
            setScheduleInitialData({
                patientName: `${req.firstName} ${req.lastName}`.trim(),
                patientPhone: req.phone,
                patientEmail: req.email,
                type: "initial",
                notes: `From Visit Request\nWound Type: ${req.woundType}\nDetails: ${req.additionalInfo}`,
                visitRequestId: req.id // Pass ID to link
            });
        } else {
            const ref = item as ProviderReferralSubmission;
            setScheduleInitialData({
                patientName: `${ref.patientFirstName} ${ref.patientLastName}`.trim(),
                patientPhone: ref.patientPhone,
                type: "initial",
                notes: `From Referral by ${ref.providerName}\nWound Type: ${ref.woundType}\nClinical Notes: ${ref.clinicalNotes}`,
                providerReferralId: ref.id // Pass ID to link
            });
        }
        setIsScheduleDialogOpen(true);
    };

    const handleEmail = (type: "visit" | "referral", item: any) => {
        let email = "";

        if (type === "visit") {
            const req = item as VisitRequest;
            email = req.email;
        } else {
            const ref = item as ProviderReferralSubmission;
            email = ref.providerEmail;
        }

        if (email) {
            window.location.href = `mailto:${email}`;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
                <p className="text-muted-foreground">Manage visit requests and provider referrals</p>
            </div>

            <div className="space-y-8">
                <VisitRequestsTab
                    visitRequests={visitRequests}
                    appointments={appointments}
                    onUpdateStatus={updateVisitStatus}
                    onSchedule={(req) => openScheduleDialog("visit", req)}
                    onEmail={(req) => handleEmail("visit", req)}
                    onDelete={deleteVisitRequest}
                />

                <div className="border-t border-border" />

                <ReferralsTab
                    referrals={referrals}
                    appointments={appointments}
                    onUpdateStatus={updateReferralStatus}
                    onSchedule={(ref) => openScheduleDialog("referral", ref)}
                    onEmail={(ref) => handleEmail("referral", ref)}
                    onDelete={deleteReferral}
                />
            </div>

            <ScheduleDialog
                open={isScheduleDialogOpen}
                onOpenChange={setIsScheduleDialogOpen}
                initialData={scheduleInitialData}
                onSchedule={(apt) => {
                    createAppointment.mutate({
                        patient_name: apt.patientName,
                        patient_phone: apt.patientPhone,
                        patient_email: apt.patientEmail,
                        appointment_date: apt.appointmentDate,
                        appointment_time: apt.appointmentTime,
                        duration_minutes: apt.duration,
                        clinician: apt.clinician,
                        notes: apt.notes,
                        status: apt.status,
                        visit_request_id: apt.visitRequestId,
                        provider_referral_id: apt.providerReferralId
                    });
                    // Also update status of linked request to "scheduled" using direct update
                    if (apt.visitRequestId) updateVisitStatusDirect(apt.visitRequestId, "scheduled");
                    if (apt.providerReferralId) updateReferralStatusDirect(apt.providerReferralId, "scheduled");
                    setIsScheduleDialogOpen(false);
                }}
                existingAppointments={appointments} // We could pass appointments if needed for conflict checking
                visitRequests={visitRequests}
                referrals={referrals}
                availableClinicians={clinicians}
            />
        </div>
    );
};

export default SubmissionsPage;

import { useSiteData } from "@/contexts/SiteDataContext";
import AppointmentsTab from "@/components/admin/tabs/AppointmentsTab";
import { useAppointmentMutations } from "@/hooks/useAppointmentMutations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const AppointmentsPage = () => {
    const {
        appointments,
        visitRequests,
        referrals,
        refreshVisitRequests,
        refreshReferrals
    } = useSiteData();
    const { toast } = useToast();
    // We don't really need onAppointmentsChange since we use React Query now, 
    // but AppointmentsTab expects it. We can just provide a no-op or a local update if needed for optimistic UI before refetch.
    // Actually, useAppointmentMutations handles invalidation.

    const { deleteAppointment, updateAppointmentStatus, createAppointment, updateAppointment } = useAppointmentMutations();

    const handleUpdateVisitStatus = async (id: string, status: "scheduled" | "completed" | "cancelled" | "pending" | "contacted") => {
        const { error } = await supabase
            .from("visit_requests")
            .update({ status })
            .eq("id", id);

        if (error) {
            toast({ title: "Failed to update visit status", variant: "destructive" });
        } else {
            toast({ title: "Visit status updated" });
            refreshVisitRequests();
        }
    };

    const handleUpdateReferralStatus = async (id: string, status: "scheduled" | "completed" | "cancelled" | "pending" | "contacted") => {
        const { error } = await supabase
            .from("provider_referrals")
            .update({ status })
            .eq("id", id);

        if (error) {
            toast({ title: "Failed to update referral status", variant: "destructive" });
        } else {
            toast({ title: "Referral status updated" });
            refreshReferrals();
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Appointments"
                description="Manage schedule and appointments"
            />

            <AppointmentsTab
                visitRequests={visitRequests}
                referrals={referrals}
                externalAppointments={appointments}
                onUpdateVisitStatus={handleUpdateVisitStatus}
                onUpdateReferralStatus={handleUpdateReferralStatus}
                onUpdateAppointmentStatus={(id, status) => updateAppointmentStatus.mutate({ id, status })}
                onAppointmentsChange={() => { }} // Handled by mutations
                onDelete={(id) => deleteAppointment.mutate(id)}
                onSchedule={(formData) => {
                    createAppointment.mutate({
                        patient_name: formData.patientName,
                        patient_phone: formData.patientPhone,
                        patient_email: formData.patientEmail,
                        appointment_date: formData.appointmentDate!,
                        appointment_time: formData.appointmentTime,
                        duration_minutes: formData.duration,
                        clinician: formData.clinician,
                        notes: formData.notes,
                        status: "scheduled",
                        visit_request_id: formData.visitRequestId,
                        provider_referral_id: formData.providerReferralId,
                        patient_address: formData.location === 'in-home' ? formData.address : undefined
                    });
                }}
                onUpdate={(apt) => {
                    updateAppointment.mutate({
                        id: apt.id,
                        patient_name: apt.patientName,
                        patient_phone: apt.patientPhone,
                        patient_email: apt.patientEmail,
                        appointment_date: apt.appointmentDate,
                        appointment_time: apt.appointmentTime,
                        duration_minutes: apt.duration,
                        clinician: apt.clinician,
                        notes: apt.notes,
                        status: apt.status,
                        patient_address: apt.location === 'in-home' ? apt.address : null,
                        // Ensure we don't wipe existing fields if not in form, but here apt is full object
                        visit_request_id: apt.visitRequestId,
                        provider_referral_id: apt.providerReferralId
                    });
                }}
            />
        </div>
    );
};

export default AppointmentsPage;

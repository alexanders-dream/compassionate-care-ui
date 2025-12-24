import { useSiteData } from "@/contexts/SiteDataContext";
import AppointmentsTab from "@/components/admin/tabs/AppointmentsTab";
import { useAppointmentMutations } from "@/hooks/useAppointmentMutations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

    const { deleteAppointment, updateAppointmentStatus } = useAppointmentMutations();

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
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
                <p className="text-muted-foreground">Manage schedule and appointments</p>
            </div>

            <AppointmentsTab
                visitRequests={visitRequests}
                referrals={referrals}
                externalAppointments={appointments}
                onUpdateVisitStatus={handleUpdateVisitStatus}
                onUpdateReferralStatus={handleUpdateReferralStatus}
                onUpdateAppointmentStatus={(id, status) => updateAppointmentStatus.mutate({ id, status })}
                onAppointmentsChange={() => { }} // Handled by mutations
                onDelete={(id) => deleteAppointment.mutate(id)}
            />
        </div>
    );
};

export default AppointmentsPage;

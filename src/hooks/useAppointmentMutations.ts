import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuditLog } from "@/hooks/useAuditLog";
import { Appointment } from "@/contexts/SiteDataContext";

interface AppointmentInsert {
    patient_name: string;
    patient_phone?: string | null;
    patient_email?: string | null;
    patient_address?: string | null;
    appointment_date: string;
    appointment_time: string;
    duration_minutes?: number;
    clinician: string;
    notes?: string | null;
    status?: "scheduled" | "completed" | "cancelled" | "no_show";
    visit_request_id?: string | null;
    provider_referral_id?: string | null;
}

interface AppointmentUpdate extends Partial<AppointmentInsert> {
    id: string;
}

export const useAppointmentMutations = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const { logAction } = useAuditLog();

    const createAppointment = useMutation({
        mutationFn: async (data: AppointmentInsert) => {
            const { data: result, error } = await supabase
                .from("appointments")
                .insert(data)
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            logAction({
                action: "create",
                entityType: "appointment",
                entityId: data.id,
                entityName: data.patient_name,
                newData: data,
            });
            toast({ title: "Appointment created successfully" });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to create appointment",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    const updateAppointment = useMutation({
        mutationFn: async ({ id, ...data }: AppointmentUpdate) => {
            const { data: result, error } = await supabase
                .from("appointments")
                .update(data)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            logAction({
                action: "update",
                entityType: "appointment",
                entityId: data.id,
                entityName: data.patient_name,
                newData: data,
            });
            toast({ title: "Appointment updated successfully" });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to update appointment",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    const deleteAppointment = useMutation({
        mutationFn: async (id: string) => {
            // First get the appointment for audit logging
            const { data: existing } = await supabase
                .from("appointments")
                .select()
                .eq("id", id)
                .single();

            const { error } = await supabase
                .from("appointments")
                .delete()
                .eq("id", id);

            if (error) throw error;
            return { id, existing };
        },
        onSuccess: ({ id, existing }) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            logAction({
                action: "delete",
                entityType: "appointment",
                entityId: id,
                entityName: existing?.patient_name || "Unknown",
                previousData: existing,
            });
            toast({ title: "Appointment deleted successfully" });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to delete appointment",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    const updateAppointmentStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: Appointment["status"] }) => {
            const { data: result, error } = await supabase
                .from("appointments")
                .update({ status })
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return result;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            logAction({
                action: "update",
                entityType: "appointment",
                entityId: data.id,
                entityName: data.patient_name,
                metadata: { statusChange: data.status },
            });
            toast({ title: `Appointment status updated to ${data.status}` });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to update status",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    return {
        createAppointment,
        updateAppointment,
        deleteAppointment,
        updateAppointmentStatus,
    };
};

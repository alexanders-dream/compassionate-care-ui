import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AuditLogEntry {
    action: "create" | "update" | "delete";
    entityType: string;
    entityId: string;
    entityName?: string;
    previousData?: unknown;
    newData?: unknown;
    metadata?: Record<string, unknown>;
}

export const useAuditLog = () => {
    const { user } = useAuth();

    const logAction = useCallback(
        async (entry: AuditLogEntry) => {
            if (!user) {
                console.warn("Audit log: No user context available");
                return;
            }

            try {
                const { error } = await supabase.from("audit_logs").insert({
                    user_id: user.id,
                    action: entry.action,
                    entity_type: entry.entityType,
                    entity_id: entry.entityId,
                    entity_name: entry.entityName || null,
                    previous_data: entry.previousData ? JSON.stringify(entry.previousData) : null,
                    new_data: entry.newData ? JSON.stringify(entry.newData) : null,
                    metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
                });

                if (error) {
                    // Log error but don't throw - audit logging shouldn't break the app
                    console.error("Failed to log audit action:", error);
                }
            } catch (err) {
                console.error("Audit log error:", err);
            }
        },
        [user]
    );

    return { logAction };
};

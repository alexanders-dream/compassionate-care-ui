import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailLog {
    id: string;
    recipient_email: string;
    recipient_name: string | null;
    subject: string;
    body: string;
    template_id: string | null;
    sent_by: string | null;
    context_type: 'visit_request' | 'referral' | 'appointment' | 'custom' | null;
    context_id: string | null;
    status: 'sent' | 'failed';
    created_at: string;
}

export interface SendEmailData {
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    body: string;
    templateId?: string;
    contextType?: 'visit_request' | 'referral' | 'appointment' | 'custom';
    contextId?: string;
}

// Placeholder replacer utility
export const replacePlaceholders = (
    text: string,
    data: Record<string, string | undefined>
): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
    });
};

export const useEmailLogs = () => {
    const { toast } = useToast();
    const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const fetchLogs = useCallback(async (limit: number = 50) => {
        try {
            const { data, error } = await supabase
                .from('email_logs' as any)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            setEmailLogs((data as EmailLog[]) || []);
        } catch (error) {
            console.error('Error fetching email logs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const sendEmail = async (data: SendEmailData): Promise<boolean> => {
        setSending(true);
        try {
            const workerUrl = import.meta.env.VITE_WORKER_URL;
            if (!workerUrl) throw new Error('Worker URL not configured');

            // Send email via worker
            const response = await fetch(`${workerUrl}/send-custom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: data.recipientEmail,
                    subject: data.subject,
                    message: data.body,
                }),
            });

            const status = response.ok ? 'sent' : 'failed';

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            // Log the email
            await supabase.from('email_logs' as any).insert({
                recipient_email: data.recipientEmail,
                recipient_name: data.recipientName || null,
                subject: data.subject,
                body: data.body,
                template_id: data.templateId || null,
                sent_by: user?.id || null,
                context_type: data.contextType || null,
                context_id: data.contextId || null,
                status,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || 'Failed to send email');
            }

            toast({
                title: 'Email Sent',
                description: `Email sent to ${data.recipientEmail}`,
            });

            await fetchLogs();
            return true;
        } catch (error: any) {
            console.error('Error sending email:', error);
            toast({
                title: 'Error sending email',
                description: error.message,
                variant: 'destructive',
            });
            return false;
        } finally {
            setSending(false);
        }
    };

    const getLogsForContext = async (
        contextType: string,
        contextId: string
    ): Promise<EmailLog[]> => {
        try {
            const { data, error } = await supabase
                .from('email_logs' as any)
                .select('*')
                .eq('context_type', contextType)
                .eq('context_id', contextId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return (data as EmailLog[]) || [];
        } catch (error) {
            console.error('Error fetching context logs:', error);
            return [];
        }
    };

    return {
        emailLogs,
        loading,
        sending,
        sendEmail,
        getLogsForContext,
        refreshLogs: fetchLogs,
    };
};

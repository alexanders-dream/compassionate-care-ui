import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    body: string;
    category: string;
    default_for_context: string | null; // 'appointment', 'visit_request', 'referral'
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateTemplateData {
    name: string;
    subject: string;
    body: string;
    category?: string;
    default_for_context?: string | null;
}

export interface UpdateTemplateData {
    name?: string;
    subject?: string;
    body?: string;
    category?: string;
    default_for_context?: string | null;
    is_active?: boolean;
}

export const useEmailTemplates = () => {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTemplates = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('email_templates' as any)
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setTemplates((data as unknown as EmailTemplate[]) || []);
        } catch (error) {
            console.error('Error fetching email templates:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const createTemplate = async (data: CreateTemplateData): Promise<EmailTemplate | null> => {
        try {
            const { data: newTemplate, error } = await supabase
                .from('email_templates' as any)
                .insert({
                    name: data.name,
                    subject: data.subject,
                    body: data.body,
                    category: data.category || 'general',
                    default_for_context: data.default_for_context || null,
                })
                .select()
                .single();

            if (error) throw error;

            toast({ title: 'Template created successfully' });
            await fetchTemplates();
            return newTemplate as unknown as EmailTemplate;
        } catch (error: any) {
            console.error('Error creating template:', error);
            toast({
                title: 'Error creating template',
                description: error.message,
                variant: 'destructive',
            });
            return null;
        }
    };

    const updateTemplate = async (id: string, data: UpdateTemplateData): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('email_templates' as any)
                .update({
                    ...data,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id);

            if (error) throw error;

            toast({ title: 'Template updated successfully' });
            await fetchTemplates();
            return true;
        } catch (error: any) {
            console.error('Error updating template:', error);
            toast({
                title: 'Error updating template',
                description: error.message,
                variant: 'destructive',
            });
            return false;
        }
    };

    const deleteTemplate = async (id: string): Promise<boolean> => {
        try {
            // Soft delete - set is_active to false
            const { error } = await supabase
                .from('email_templates' as any)
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .eq('id', id);

            if (error) throw error;

            toast({ title: 'Template deleted successfully' });
            await fetchTemplates();
            return true;
        } catch (error: any) {
            console.error('Error deleting template:', error);
            toast({
                title: 'Error deleting template',
                description: error.message,
                variant: 'destructive',
            });
            return false;
        }
    };

    // Get the default template for a specific context
    const getDefaultTemplate = (contextType: string): EmailTemplate | undefined => {
        return templates.find(t => t.default_for_context === contextType);
    };

    // Set a template as the default for a context (clears previous default)
    const setDefaultTemplate = async (templateId: string, contextType: string): Promise<boolean> => {
        try {
            // First, clear any existing default for this context
            const { error: clearError } = await supabase
                .from('email_templates' as any)
                .update({ default_for_context: null })
                .eq('default_for_context', contextType);

            if (clearError) throw clearError;

            // Then set the new default
            const { error } = await supabase
                .from('email_templates' as any)
                .update({ default_for_context: contextType })
                .eq('id', templateId);

            if (error) throw error;

            toast({ title: `Default template set for ${contextType.replace('_', ' ')}` });
            await fetchTemplates();
            return true;
        } catch (error: any) {
            console.error('Error setting default template:', error);
            toast({
                title: 'Error setting default',
                description: error.message,
                variant: 'destructive',
            });
            return false;
        }
    };

    // Clear a template's default status
    const clearDefaultTemplate = async (templateId: string): Promise<boolean> => {
        try {
            const { error } = await supabase
                .from('email_templates' as any)
                .update({ default_for_context: null })
                .eq('id', templateId);

            if (error) throw error;

            toast({ title: 'Default removed' });
            await fetchTemplates();
            return true;
        } catch (error: any) {
            console.error('Error clearing default:', error);
            return false;
        }
    };

    return {
        templates,
        loading,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        getDefaultTemplate,
        setDefaultTemplate,
        clearDefaultTemplate,
        refreshTemplates: fetchTemplates,
    };
};

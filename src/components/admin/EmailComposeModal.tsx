import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2, Star } from 'lucide-react';
import { useEmailTemplates, EmailTemplate } from '@/hooks/useEmailTemplates';
import { useEmailLogs, replacePlaceholders } from '@/hooks/useEmailLogs';

interface EmailComposeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipientEmail: string;
    recipientName?: string;
    contextType?: 'visit_request' | 'referral' | 'appointment' | 'custom';
    contextId?: string;
    onSuccess?: () => void;
    // Additional context data for placeholder replacement
    placeholderData?: {
        patient_name?: string;
        appointment_date?: string;
        appointment_time?: string;
        wound_type?: string;
        clinician?: string;
        provider_name?: string;
        practice_name?: string;
        [key: string]: string | undefined;
    };
}

const EmailComposeModal = ({
    open,
    onOpenChange,
    recipientEmail,
    recipientName,
    contextType = 'custom',
    contextId,
    onSuccess,
    placeholderData = {},
}: EmailComposeModalProps) => {
    const { templates, loading: templatesLoading, getDefaultTemplate } = useEmailTemplates();
    const { sendEmail, sending } = useEmailLogs();

    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [hasInitialized, setHasInitialized] = useState(false);

    // Merge placeholder data with recipient name
    const allPlaceholders = {
        patient_name: recipientName || placeholderData.patient_name || '',
        ...placeholderData,
    };

    // Apply a template to the form
    const applyTemplate = (template: EmailTemplate) => {
        setSelectedTemplateId(template.id);
        setSubject(replacePlaceholders(template.subject, allPlaceholders));
        setBody(replacePlaceholders(template.body, allPlaceholders));
    };

    // Handle template selection from dropdown
    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);

        if (templateId === 'custom') {
            // Custom - clear subject/body for user to type
            setSubject('');
            setBody('');
            return;
        }

        const template = templates.find(t => t.id === templateId);
        if (template) {
            // Replace placeholders with actual data
            setSubject(replacePlaceholders(template.subject, allPlaceholders));
            setBody(replacePlaceholders(template.body, allPlaceholders));
        }
    };

    // Determine if a template is the default for current context
    const isDefaultForContext = (template: EmailTemplate) => {
        return template.default_for_context === contextType;
    };

    // Auto-select default template when modal opens and templates are loaded
    useEffect(() => {
        if (open && !templatesLoading && templates.length > 0 && !hasInitialized) {
            const defaultTemplate = getDefaultTemplate(contextType);
            if (defaultTemplate) {
                applyTemplate(defaultTemplate);
            } else {
                // If no default, start with custom
                setSelectedTemplateId('custom');
            }
            setHasInitialized(true);
        }
    }, [open, templatesLoading, templates, contextType, hasInitialized]);

    // Reset form when modal closes
    useEffect(() => {
        if (!open) {
            setSelectedTemplateId('');
            setSubject('');
            setBody('');
            setHasInitialized(false);
        }
    }, [open]);

    const handleSend = async () => {
        if (!subject.trim() || !body.trim()) {
            return;
        }

        const success = await sendEmail({
            recipientEmail,
            recipientName,
            subject,
            body,
            templateId: selectedTemplateId && selectedTemplateId !== 'custom' ? selectedTemplateId : undefined,
            contextType,
            contextId,
        });

        if (success) {
            onOpenChange(false);
            onSuccess?.();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Compose Email</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Recipient */}
                    <div className="space-y-2">
                        <Label>To</Label>
                        <Input
                            value={recipientName ? `${recipientName} <${recipientEmail}>` : recipientEmail}
                            disabled
                            className="bg-muted"
                        />
                    </div>

                    {/* Template Selector */}
                    <div className="space-y-2">
                        <Label>Template</Label>
                        <Select
                            value={selectedTemplateId}
                            onValueChange={handleTemplateSelect}
                            disabled={templatesLoading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a template..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="custom">Custom Email (no template)</SelectItem>
                                {templates.map(template => (
                                    <SelectItem key={template.id} value={template.id}>
                                        <div className="flex items-center gap-2">
                                            {template.name}
                                            {isDefaultForContext(template) && (
                                                <Badge variant="secondary" className="text-xs ml-2">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    Default
                                                </Badge>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="email-subject">Subject</Label>
                        <Input
                            id="email-subject"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Email subject..."
                        />
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                        <Label htmlFor="email-body">Message</Label>
                        <Textarea
                            id="email-body"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            placeholder="Type your message here..."
                            className="min-h-[200px]"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={sending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={sending || !subject.trim() || !body.trim()}
                        className="gap-2"
                    >
                        {sending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Send Email
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EmailComposeModal;


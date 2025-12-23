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
import { Loader2 } from 'lucide-react';
import { EmailTemplate, CreateTemplateData, UpdateTemplateData } from '@/hooks/useEmailTemplates';

interface EmailTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template?: EmailTemplate | null;
    onSave: (data: CreateTemplateData | UpdateTemplateData) => Promise<boolean>;
    saving?: boolean;
}

const CATEGORIES = [
    { value: 'general', label: 'General' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'welcome', label: 'Welcome' },
    { value: 'scheduling', label: 'Scheduling' },
];

const EmailTemplateDialog = ({
    open,
    onOpenChange,
    template,
    onSave,
    saving = false,
}: EmailTemplateDialogProps) => {
    const [name, setName] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('general');

    const isEditing = !!template;

    // Reset form when modal opens or template changes
    useEffect(() => {
        if (open) {
            if (template) {
                setName(template.name);
                setSubject(template.subject);
                setBody(template.body);
                setCategory(template.category || 'general');
            } else {
                setName('');
                setSubject('');
                setBody('');
                setCategory('general');
            }
        }
    }, [open, template]);

    const handleSave = async () => {
        if (!name.trim() || !subject.trim() || !body.trim()) {
            return;
        }

        const data = {
            name: name.trim(),
            subject: subject.trim(),
            body: body.trim(),
            category,
        };

        const success = await onSave(data);
        if (success) {
            onOpenChange(false);
        }
    };

    const isValid = name.trim() && subject.trim() && body.trim();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? 'Edit Template' : 'Create New Template'}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Template Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="template-name">Template Name *</Label>
                            <Input
                                id="template-name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="e.g., Appointment Reminder"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map(cat => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                        <Label htmlFor="template-subject">Subject Line *</Label>
                        <Input
                            id="template-subject"
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                            placeholder="Email subject..."
                        />
                    </div>

                    {/* Body */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="template-body">Email Body *</Label>
                            <span className="text-xs text-muted-foreground">
                                Use {'{{patient_name}}'}, {'{{appointment_date}}'}, {'{{appointment_time}}'} for placeholders
                            </span>
                        </div>
                        <Textarea
                            id="template-body"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            placeholder="Type your email template here..."
                            className="min-h-[200px] font-mono text-sm"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving || !isValid}
                        className="gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            isEditing ? 'Update Template' : 'Create Template'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EmailTemplateDialog;

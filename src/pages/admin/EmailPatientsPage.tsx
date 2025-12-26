import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, FileText, Plus, Pencil, Trash2, Mail, History, Loader2, Star } from "lucide-react";
import { useEmailTemplates, EmailTemplate } from "@/hooks/useEmailTemplates";
import { useEmailLogs, replacePlaceholders } from "@/hooks/useEmailLogs";
import EmailTemplateDialog from "@/components/admin/EmailTemplateDialog";
import { CardActionFooter } from "@/components/admin/CardActionFooter";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { format } from "date-fns";

const EmailPatientsPage = () => {
    const {
        templates,
        loading: templatesLoading,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        setDefaultTemplate,
        clearDefaultTemplate,
    } = useEmailTemplates();
    const { emailLogs, loading: logsLoading, sendEmail, sending } = useEmailLogs();

    // Compose state
    const [recipient, setRecipient] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");

    // Template dialog state
    const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
    const [savingTemplate, setSavingTemplate] = useState(false);

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);
        if (templateId === "custom") {
            return;
        }
        const template = templates.find(t => t.id === templateId);
        if (template) {
            setSubject(template.subject);
            setMessage(template.body);
        }
    };

    const handleSend = async () => {
        if (!recipient || !subject || !message) {
            return;
        }

        const success = await sendEmail({
            recipientEmail: recipient,
            subject,
            body: message,
            templateId: selectedTemplateId && selectedTemplateId !== "custom" ? selectedTemplateId : undefined,
            contextType: "custom",
        });

        if (success) {
            setRecipient("");
            setSubject("");
            setMessage("");
            setSelectedTemplateId("");
        }
    };

    const handleSaveTemplate = async (data: any) => {
        setSavingTemplate(true);
        let success = false;
        if (editingTemplate) {
            success = await updateTemplate(editingTemplate.id, data);
        } else {
            const result = await createTemplate(data);
            success = result !== null;
        }
        setSavingTemplate(false);
        return success;
    };

    const handleDeleteTemplate = async () => {
        if (templateToDelete) {
            await deleteTemplate(templateToDelete);
            setTemplateToDelete(null);
        }
    };

    const openEditTemplate = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setTemplateDialogOpen(true);
    };

    const openNewTemplate = () => {
        setEditingTemplate(null);
        setTemplateDialogOpen(true);
    };

    const getCategoryBadge = (category: string) => {
        const colors: Record<string, string> = {
            general: "bg-gray-100 text-gray-700",
            "follow-up": "bg-blue-100 text-blue-700",
            reminder: "bg-amber-100 text-amber-700",
            welcome: "bg-green-100 text-green-700",
            scheduling: "bg-indigo-100 text-indigo-700",
        };
        return (
            <Badge className={`${colors[category] || colors.general} border-0 capitalize`}>
                {category}
            </Badge>
        );
    };

    const getDefaultContextLabel = (context: string | null) => {
        const labels: Record<string, string> = {
            appointment: "Appointments",
            visit_request: "Visit Requests",
            referral: "Referrals",
        };
        return context ? labels[context] || context : null;
    };

    const handleSetDefault = async (templateId: string, contextType: string) => {
        await setDefaultTemplate(templateId, contextType);
    };

    const handleClearDefault = async (templateId: string) => {
        await clearDefaultTemplate(templateId);
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Email Patients"
                description="Manage email templates and send messages to patients."
            />

            <Tabs defaultValue="compose" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
                    <TabsTrigger value="compose" className="gap-2 px-2 sm:px-4">
                        <Send className="h-4 w-4" />
                        Compose
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="gap-2 px-2 sm:px-4">
                        <FileText className="h-4 w-4" />
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="history" className="gap-2 px-2 sm:px-4">
                        <History className="h-4 w-4" />
                        History
                    </TabsTrigger>
                </TabsList>

                {/* Compose Tab */}
                <TabsContent value="compose">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Mail className="h-5 w-5" />
                                Compose Message
                            </CardTitle>
                            <CardDescription>
                                Send a custom email or use a template.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recipient">Recipient Email *</Label>
                                    <Input
                                        id="recipient"
                                        type="email"
                                        placeholder="patient@example.com"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Use Template</Label>
                                    <Select
                                        value={selectedTemplateId}
                                        onValueChange={handleTemplateSelect}
                                        disabled={templatesLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a template..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom">Custom Email</SelectItem>
                                            {templates.map(template => (
                                                <SelectItem key={template.id} value={template.id}>
                                                    {template.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject *</Label>
                                <Input
                                    id="subject"
                                    placeholder="Email subject..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message *</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Type your message here..."
                                    className="min-h-[200px]"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={handleSend}
                                    disabled={sending || !recipient || !subject || !message}
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
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    Email Templates
                                </CardTitle>
                                <CardDescription>
                                    Create and manage reusable email templates.
                                </CardDescription>
                            </div>
                            <Button onClick={openNewTemplate} className="gap-2 w-full sm:w-auto">
                                <Plus className="h-4 w-4" />
                                New Template
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {templatesLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No templates yet. Create your first template to get started.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>Name</TableHead>
                                                    <TableHead>Subject</TableHead>
                                                    <TableHead>Category</TableHead>
                                                    <TableHead>Default For</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {templates.map((template, index) => (
                                                    <TableRow key={template.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                                                        <TableCell className="font-medium">{template.name}</TableCell>
                                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                                            {template.subject}
                                                        </TableCell>
                                                        <TableCell>{getCategoryBadge(template.category)}</TableCell>
                                                        <TableCell>
                                                            {template.default_for_context ? (
                                                                <div className="flex items-center gap-2">
                                                                    <Badge className="bg-amber-100 text-amber-700 border-0">
                                                                        <Star className="h-3 w-3 mr-1" />
                                                                        {getDefaultContextLabel(template.default_for_context)}
                                                                    </Badge>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                                                        onClick={() => handleClearDefault(template.id)}
                                                                    >
                                                                        Clear
                                                                    </Button>
                                                                </div>
                                                            ) : (
                                                                <Select
                                                                    onValueChange={(value) => handleSetDefault(template.id, value)}
                                                                >
                                                                    <SelectTrigger className="h-8 w-[140px]">
                                                                        <SelectValue placeholder="Set default..." />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="appointment">Appointments</SelectItem>
                                                                        <SelectItem value="visit_request">Visit Requests</SelectItem>
                                                                        <SelectItem value="referral">Referrals</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-1">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => openEditTemplate(template)}
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => setTemplateToDelete(template.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden grid grid-cols-1 gap-4">
                                        {templates.map((template) => (
                                            <div key={template.id} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                                                <div className="p-4 space-y-3">
                                                    <div className="flex items-start justify-between">
                                                        <div className="space-y-1">
                                                            <h3 className="font-medium text-base leading-none tracking-tight">{template.name}</h3>
                                                            <p className="text-sm text-muted-foreground line-clamp-1">{template.subject}</p>
                                                        </div>
                                                        {getCategoryBadge(template.category)}
                                                    </div>

                                                    <div className="flex items-center justify-between pt-2">
                                                        <div className="text-sm">
                                                            {template.default_for_context ? (
                                                                <Badge className="bg-amber-100 text-amber-700 border-0">
                                                                    <Star className="h-3 w-3 mr-1" />
                                                                    {getDefaultContextLabel(template.default_for_context)}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs italic">No default set</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <CardActionFooter
                                                    actions={[
                                                        {
                                                            label: "Edit",
                                                            icon: Pencil,
                                                            onClick: () => openEditTemplate(template),
                                                        },
                                                        {
                                                            label: "Delete",
                                                            icon: Trash2,
                                                            onClick: () => setTemplateToDelete(template.id),
                                                            className: "text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        }
                                                    ]}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <History className="h-5 w-5" />
                                Email History
                            </CardTitle>
                            <CardDescription>
                                View all sent emails and their status.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {logsLoading ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : emailLogs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No emails sent yet.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Desktop Table View */}
                                    <div className="hidden md:block rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead>Recipient</TableHead>
                                                    <TableHead>Subject</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead>Sent At</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {emailLogs.map((log, index) => (
                                                    <TableRow key={log.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                                                        <TableCell>
                                                            <div>
                                                                <p className="font-medium">{log.recipient_name || "—"}</p>
                                                                <p className="text-sm text-muted-foreground">{log.recipient_email}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="max-w-[250px] truncate">
                                                            {log.subject}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                className={
                                                                    log.status === "sent"
                                                                        ? "bg-green-100 text-green-700 border-0"
                                                                        : "bg-red-100 text-red-700 border-0"
                                                                }
                                                            >
                                                                {log.status}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground">
                                                            {format(new Date(log.created_at), "MMM d, yyyy h:mm a")}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    {/* Mobile Card View */}
                                    <div className="md:hidden space-y-4">
                                        {emailLogs.map((log) => (
                                            <div key={log.id} className="relative flex flex-col gap-2 rounded-lg border p-4 text-sm shadow-sm">
                                                <div className="flex w-full flex-col gap-1">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <div className="font-semibold">{log.recipient_name || "—"}</div>
                                                            <Badge
                                                                variant="outline"
                                                                className={
                                                                    log.status === "sent"
                                                                        ? "bg-green-50 text-green-700 border-green-200"
                                                                        : "bg-red-50 text-red-700 border-red-200"
                                                                }
                                                            >
                                                                {log.status}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground">
                                                            {format(new Date(log.created_at), "MMM d")}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">{log.recipient_email}</div>
                                                </div>
                                                <div className="line-clamp-2 text-muted-foreground">
                                                    <span className="font-medium text-foreground">Subject: </span>
                                                    {log.subject}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Template Dialog */}
            <EmailTemplateDialog
                open={templateDialogOpen}
                onOpenChange={setTemplateDialogOpen}
                template={editingTemplate}
                onSave={handleSaveTemplate}
                saving={savingTemplate}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Template?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the template from your list. This action can be undone by contacting support.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTemplate}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EmailPatientsPage;

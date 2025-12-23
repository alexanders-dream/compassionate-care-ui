import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, FileText } from "lucide-react";

const TEMPLATES = [
    {
        id: "review",
        name: "Request Review",
        subject: "How was your visit with Compassionate Care?",
        message: "Hi there,\n\nWe hope your recent visit went well. We would love to hear your feedback to help us improve.\n\nPlease take a moment to leave us a review.\n\nBest,\nCompassionate Care"
    },
    {
        id: "follow-up",
        name: "Follow Up",
        subject: "Checking in on your progress",
        message: "Hi,\n\nJust checking in to see how your wound is healing. Do you have any questions or concerns?\n\nBest,\nCompassionate Care Team"
    },
    {
        id: "visit-prep",
        name: "Visit Preparation",
        subject: "Preparing for your upcoming visit",
        message: "Hi,\n\nFor our upcoming visit, please ensure the wound area is accessible and you have a clean space prepared.\n\nSee you soon!"
    }
];

const EmailPatientsPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [recipient, setRecipient] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleTemplateSelect = (templateId: string) => {
        const template = TEMPLATES.find(t => t.id === templateId);
        if (template) {
            setSubject(template.subject);
            setMessage(template.message);
        }
    };

    const handleSend = async () => {
        if (!recipient || !subject || !message) {
            toast({
                title: "Missing Fields",
                description: "Please fill in all fields before sending.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const workerUrl = import.meta.env.VITE_WORKER_URL;
            if (!workerUrl) throw new Error("Worker URL not configured");

            const response = await fetch(`${workerUrl}/send-custom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: recipient, subject, message }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error || "Failed to send email");
            }

            toast({
                title: "Email Sent",
                description: `Sent to ${recipient}`,
            });

            // Reset form
            setRecipient("");
            setSubject("");
            setMessage("");

        } catch (error: any) {
            console.error("Error sending email", error);
            toast({
                title: "Error",
                description: error.message || "Failed to send email.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Email Patients</h2>
                <p className="text-muted-foreground">
                    Send custom messages or use templates to contact patients directly.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Templates Sidebar */}
                <div className="md:col-span-1 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Templates</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {TEMPLATES.map(template => (
                                <Button
                                    key={template.id}
                                    variant="outline"
                                    className="w-full justify-start gap-2 h-auto py-3 whitespace-normal text-left"
                                    onClick={() => handleTemplateSelect(template.id)}
                                >
                                    <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{template.name}</span>
                                        <span className="text-xs text-muted-foreground truncate w-32">{template.subject}</span>
                                    </div>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Email Composer */}
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Compose Message</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="recipient">To (Email)</Label>
                                <Input
                                    id="recipient"
                                    placeholder="patient@example.com"
                                    value={recipient}
                                    onChange={(e) => setRecipient(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="Email subject..."
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Type your message here..."
                                    className="min-h-[200px]"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSend} disabled={loading} className="gap-2">
                                    <Send className="h-4 w-4" />
                                    {loading ? "Sending..." : "Send Email"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmailPatientsPage;

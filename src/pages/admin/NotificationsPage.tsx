import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Clock, Mail } from "lucide-react";

interface NotificationSettings {
    adminEmail: string;
    enablePatientConfirmations: boolean;
    enableAdminAlerts: boolean;
    reminderTime: string; // "24", "48", "72" hours
    reminderTimeOfDay: string; // "09:00", "14:00" etc.
}

const NotificationsPage = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<NotificationSettings>({
        adminEmail: "",
        enablePatientConfirmations: true,
        enableAdminAlerts: true,
        reminderTime: "24",
        reminderTimeOfDay: "09:00",
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // In a real app, this would come from the 'app_config' table
            // mocking initial load from what might be in DB or defaults
            const { data, error } = await supabase
                .from('app_config' as any)
                .select('*')
                .in('key', ['admin_email', 'enable_patient_confirmations', 'enable_admin_alerts', 'reminder_time', 'reminder_time_of_day']);

            if (error) throw error;

            if (data) {
                const newSettings = { ...settings };
                (data as any[]).forEach(item => {
                    if (item.key === 'admin_email') newSettings.adminEmail = item.value || "";
                    if (item.key === 'enable_patient_confirmations') newSettings.enablePatientConfirmations = item.value === 'true';
                    if (item.key === 'enable_admin_alerts') newSettings.enableAdminAlerts = item.value === 'true';
                    if (item.key === 'reminder_time') newSettings.reminderTime = item.value || "24";
                    if (item.key === 'reminder_time_of_day') newSettings.reminderTimeOfDay = item.value || "09:00";
                });
                setSettings(newSettings);
            }
        } catch (error) {
            console.error("Error fetching settings", error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            const updates = [
                { key: 'admin_email', value: settings.adminEmail },
                { key: 'enable_patient_confirmations', value: String(settings.enablePatientConfirmations) },
                { key: 'enable_admin_alerts', value: String(settings.enableAdminAlerts) },
                { key: 'reminder_time', value: settings.reminderTime },
                { key: 'reminder_time_of_day', value: settings.reminderTimeOfDay },
            ];

            const { error } = await supabase.from('app_config' as any).upsert(updates);

            if (error) throw error;

            toast({
                title: "Settings Saved",
                description: "Notification preferences have been updated.",
            });
        } catch (error) {
            console.error("Error saving settings", error);
            toast({
                title: "Error",
                description: "Failed to save settings.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading settings...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
                <p className="text-muted-foreground">
                    Manage email alerts and appointment reminders.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* General Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Email Settings
                        </CardTitle>
                        <CardDescription>
                            Configure who receives system notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="adminEmail">Admin Notification Email</Label>
                            <Input
                                id="adminEmail"
                                value={settings.adminEmail}
                                onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                                placeholder="admin@example.com"
                            />
                            <p className="text-xs text-muted-foreground">
                                This email will receive alerts for new bookings and referrals.
                            </p>
                        </div>

                        <div className="flex items-center justify-between space-x-2 pt-2">
                            <Label htmlFor="admin-alerts" className="flex flex-col space-y-1">
                                <span>Admin Alerts</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Receive emails when new forms are submitted
                                </span>
                            </Label>
                            <Switch
                                id="admin-alerts"
                                checked={settings.enableAdminAlerts}
                                onCheckedChange={(c) => setSettings({ ...settings, enableAdminAlerts: c })}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="patient-confirms" className="flex flex-col space-y-1">
                                <span>Patient Confirmations</span>
                                <span className="font-normal text-xs text-muted-foreground">
                                    Send automated confirmation emails to patients
                                </span>
                            </Label>
                            <Switch
                                id="patient-confirms"
                                checked={settings.enablePatientConfirmations}
                                onCheckedChange={(c) => setSettings({ ...settings, enablePatientConfirmations: c })}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Reminder Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Appointment Reminders
                        </CardTitle>
                        <CardDescription>
                            Configure automated appointment reminders for patients.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Reminder Timing</Label>
                            <Select
                                value={settings.reminderTime}
                                onValueChange={(v) => setSettings({ ...settings, reminderTime: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="24">24 Hours Before</SelectItem>
                                    <SelectItem value="48">48 Hours Before</SelectItem>
                                    <SelectItem value="72">3 Days Before</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Time of Day to Send</Label>
                            <Select
                                value={settings.reminderTimeOfDay}
                                onValueChange={(v) => setSettings({ ...settings, reminderTimeOfDay: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select time of day" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="08:00">8:00 AM</SelectItem>
                                    <SelectItem value="09:00">9:00 AM</SelectItem>
                                    <SelectItem value="12:00">12:00 PM</SelectItem>
                                    <SelectItem value="17:00">5:00 PM</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Emails are sent daily at this time for appointments falling in the window.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </div>
    );
};

export default NotificationsPage;

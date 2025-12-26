
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Calendar as CalendarIcon, Clock, MapPin, User, FileText, Pencil } from "lucide-react";
import { Appointment, VisitRequest, ProviderReferralSubmission } from "@/contexts/SiteDataContext";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppointmentDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointment: Appointment | null;
    onEmail: (item: any) => void;
    onEdit: (item: any) => void;
    visitRequest?: VisitRequest;
    referral?: ProviderReferralSubmission;
}

export function AppointmentDetailsDialog({
    open,
    onOpenChange,
    appointment,
    onEmail,
    onEdit,
    visitRequest,
    referral
}: AppointmentDetailsDialogProps) {
    const isMobile = useIsMobile();

    if (!appointment) return null;

    const Content = () => (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-muted/30 p-4 rounded-lg">
                <div>
                    <h3 className="font-semibold text-lg">{appointment.patientName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>{format(new Date(appointment.appointmentDate), "MMM d, yyyy")} @ {appointment.appointmentTime} ({appointment.duration} min)</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize border-primary/20 bg-primary/5 text-primary">
                        {appointment.type}
                    </Badge>
                    <Badge variant={appointment.status === 'scheduled' ? 'default' : 'secondary'} className="capitalize">
                        {appointment.status}
                    </Badge>
                </div>
            </div>

            {/* Logistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                        <User className="h-4 w-4" /> Patient Info
                    </h4>
                    <div className="space-y-3 border p-4 rounded-lg bg-card text-sm">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">Phone</span>
                            <div className="flex items-center gap-2 mt-1">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a href={`tel:${appointment.patientPhone}`} className="hover:underline font-medium">
                                    {appointment.patientPhone || "N/A"}
                                </a>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">Email</span>
                            <div className="flex items-center gap-2 mt-1">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <button onClick={() => onEmail(appointment)} className="hover:underline font-medium text-left">
                                    {appointment.patientEmail || "N/A"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                        <MapPin className="h-4 w-4" /> Visit Info
                    </h4>
                    <div className="space-y-3 border p-4 rounded-lg bg-card text-sm">
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">Clinician</span>
                            <span className="font-medium">{appointment.clinician}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-muted-foreground text-xs">Location</span>
                            <span className="font-medium capitalize">{appointment.location.replace("-", " ")}</span>
                        </div>
                        {appointment.address && (
                            <div className="flex flex-col">
                                <span className="text-muted-foreground text-xs">Address</span>
                                <span className="font-medium">{appointment.address}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Notes */}
            <div>
                <h4 className="font-medium mb-2 flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wider">
                    <FileText className="h-4 w-4" /> Appointment Notes
                </h4>
                <div className="bg-muted/20 p-4 rounded-lg border text-sm whitespace-pre-wrap leading-relaxed">
                    {appointment.notes || "No notes for this appointment."}
                </div>
            </div>

            {/* Original Request Context (if linked) */}
            {(visitRequest || referral) && (
                <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                        Original Submission
                    </h4>
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg text-sm">
                        {visitRequest && (
                            <div className="space-y-2">
                                <p><span className="font-medium">Type:</span> Visit Request</p>
                                <p><span className="font-medium">Wound:</span> {visitRequest.woundType}</p>
                                <p><span className="font-medium">Submitted:</span> {format(new Date(visitRequest.submittedAt), "MMM d, yyyy")}</p>
                                {visitRequest.additionalInfo && <p className="text-muted-foreground mt-2 border-t border-blue-200 pt-2 text-xs">{visitRequest.additionalInfo}</p>}
                            </div>
                        )}
                        {referral && (
                            <div className="space-y-2">
                                <p><span className="font-medium">Type:</span> Referral from {referral.providerName}</p>
                                <p><span className="font-medium">Practice:</span> {referral.practiceName}</p>
                                <p><span className="font-medium">Wound:</span> {referral.woundType}</p>
                                {referral.clinicalNotes && <p className="text-muted-foreground mt-2 border-t border-blue-200 pt-2 text-xs">{referral.clinicalNotes}</p>}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    const Actions = ({ className }: { className?: string }) => (
        <div className={className}>
            <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = `tel:${appointment.patientPhone}`}
                disabled={!appointment.patientPhone}
            >
                <Phone className="h-4 w-4 mr-2" /> Call
            </Button>
            <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                    onEmail(appointment);
                    onOpenChange(false);
                }}
                disabled={!appointment.patientEmail}
            >
                <Mail className="h-4 w-4 mr-2" /> Email
            </Button>
            <Button
                className="flex-1"
                onClick={() => {
                    onEdit(appointment);
                    onOpenChange(false);
                }}
            >
                <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle className="flex items-center gap-2 text-xl">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Appointment Details
                        </DrawerTitle>
                    </DrawerHeader>
                    <div className="p-4 overflow-y-auto">
                        <Content />
                    </div>
                    <DrawerFooter className="pt-2">
                        <Actions className="flex gap-2 w-full" />
                        <DrawerClose asChild>
                            <Button variant="outline">Close</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Appointment Details
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-4">
                    <Content />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-4 mt-2 border-t">
                    <Actions className="flex flex-1 gap-2" />
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

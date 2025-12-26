
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
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, CalendarDays, User, FileText, Clock, MapPin, Building } from "lucide-react";
import { VisitRequest, ProviderReferralSubmission } from "@/contexts/SiteDataContext";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";

interface SubmissionDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    submission: VisitRequest | ProviderReferralSubmission | null;
    type: "visit" | "referral";
    onEmail: (item: any) => void;
    onSchedule: (item: any) => void;
}

export function SubmissionDetailsDialog({
    open,
    onOpenChange,
    submission,
    type,
    onEmail,
    onSchedule,
}: SubmissionDetailsDialogProps) {
    const isMobile = useIsMobile();

    if (!submission) return null;

    const isVisit = type === "visit";
    const visit = isVisit ? (submission as VisitRequest) : null;
    const referral = !isVisit ? (submission as ProviderReferralSubmission) : null;

    const patientName = isVisit
        ? `${visit!.firstName} ${visit!.lastName}`
        : `${referral!.patientFirstName} ${referral!.patientLastName}`;

    const phone = isVisit ? visit!.phone : referral!.patientPhone;
    const email = isVisit ? visit!.email : null;

    const Content = () => (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-muted/30 p-4 rounded-lg">
                <div>
                    <h3 className="font-semibold text-lg">{patientName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4" />
                        <span>Submitted: {format(new Date(submission.submittedAt), "MMM d, yyyy @ h:mm a")}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={submission.status === 'scheduled' ? 'default' : 'secondary'} className="capitalize">
                        {submission.status}
                    </Badge>
                    {!isVisit && referral?.urgency === 'urgent' && (
                        <Badge variant="destructive">Urgent</Badge>
                    )}
                </div>
            </div>

            {/* Contact Info */}
            <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Patient Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-card">
                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Phone</label>
                        <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                        </div>
                    </div>
                    {email && (
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Email</label>
                            <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <button onClick={() => onEmail(submission)} className="hover:underline text-left">{email}</button>
                            </div>
                        </div>
                    )}
                    <div className="space-y-1 col-span-full">
                        <label className="text-xs text-muted-foreground">Location/Address</label>
                        <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{isVisit ? visit!.address : `${referral!.patientAddress || 'N/A'}`}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clinical Info */}
            <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" /> Clinical Information
                </h4>
                <div className="space-y-4 border p-4 rounded-lg bg-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">Wound Type</label>
                            <p className="font-medium capitalize">{submission.woundType}</p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                            {isVisit ? "Additional Info / Description" : "Clinical Notes"}
                        </label>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/20 p-3 rounded border">
                            {isVisit ? visit!.additionalInfo : referral!.clinicalNotes}
                        </p>
                    </div>
                </div>
            </div>

            {/* Provider Info (Referral Only) */}
            {!isVisit && (
                <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" /> Referring Provider
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-card">
                        <div>
                            <label className="text-xs text-muted-foreground">Provider Name</label>
                            <p className="font-medium">{referral!.providerName}</p>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Practice Name</label>
                            <p className="font-medium">{referral!.practiceName}</p>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Provider Phone</label>
                            <p>{referral!.providerPhone}</p>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Provider Email</label>
                            <p>{referral!.providerEmail}</p>
                        </div>
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
                onClick={() => window.location.href = `tel:${phone}`}
                disabled={!phone}
            >
                <Phone className="h-4 w-4 mr-2" /> Call
            </Button>
            <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                    onEmail(submission);
                    onOpenChange(false);
                }}
            >
                <Mail className="h-4 w-4 mr-2" /> Email
            </Button>
            {submission.status !== 'scheduled' && submission.status !== 'completed' && (
                <Button
                    className="flex-1"
                    onClick={() => {
                        onSchedule(submission);
                        onOpenChange(false);
                    }}
                >
                    <CalendarDays className="h-4 w-4 mr-2" /> Schedule
                </Button>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader className="text-left">
                        <DrawerTitle className="flex items-center gap-2 text-xl">
                            <FileText className="h-5 w-5 text-primary" />
                            {isVisit ? "Visit Request Details" : "Provider Referral Details"}
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
                        <FileText className="h-5 w-5 text-primary" />
                        {isVisit ? "Visit Request Details" : "Provider Referral Details"}
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


import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, CalendarDays, User, FileText, Clock, MapPin, Building, Pencil, Save, X } from "lucide-react";
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
    onUpdate: (id: string, data: any) => void;
}

export function SubmissionDetailsDialog({
    open,
    onOpenChange,
    submission,
    type,
    onEmail,
    onSchedule,
    onUpdate
}: SubmissionDetailsDialogProps) {
    const isMobile = useIsMobile();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (submission) {
            setFormData({ ...submission });
        }
    }, [submission]);

    useEffect(() => {
        if (!open) {
            setIsEditing(false); // Reset edit mode on close
        }
    }, [open]);

    if (!submission) return null;

    const isVisit = type === "visit";
    const visit = isVisit ? (submission as VisitRequest) : null;
    const referral = !isVisit ? (submission as ProviderReferralSubmission) : null;

    const patientName = isVisit
        ? `${visit!.firstName} ${visit!.lastName}`
        : `${referral!.patientFirstName} ${referral!.patientLastName}`;

    const handleSave = () => {
        onUpdate(submission.id, formData);
        setIsEditing(false);
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const Content = () => (
        <div className="space-y-6">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-muted/30 p-4 rounded-lg">
                <div className="flex-1">
                    {/* Top Right Edit Button moved here for header context */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-lg">{patientName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Clock className="h-4 w-4" />
                                <span>Submitted: {format(new Date(submission.submittedAt), "MMM d, yyyy @ h:mm a")}</span>
                            </div>
                        </div>
                    </div>

                </div>
                {!isMobile && (
                    <div className="flex items-center gap-2 self-start">
                        <Badge variant={submission.status === 'scheduled' ? 'default' : 'secondary'} className="capitalize">
                            {submission.status}
                        </Badge>
                        {!isVisit && referral?.urgency === 'urgent' && (
                            <Badge variant="destructive">Urgent</Badge>
                        )}
                    </div>
                )}
            </div>

            {/* Contact Info */}
            <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" /> Patient Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border p-4 rounded-lg bg-card">
                    {isVisit ? (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">First Name</label>
                                {isEditing ? (
                                    <Input value={formData.firstName || ''} onChange={(e) => handleInputChange('firstName', e.target.value)} className="h-8" />
                                ) : (
                                    <p className="font-medium">{visit!.firstName}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Last Name</label>
                                {isEditing ? (
                                    <Input value={formData.lastName || ''} onChange={(e) => handleInputChange('lastName', e.target.value)} className="h-8" />
                                ) : (
                                    <p className="font-medium">{visit!.lastName}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Patient First Name</label>
                                {isEditing ? (
                                    <Input value={formData.patientFirstName || ''} onChange={(e) => handleInputChange('patientFirstName', e.target.value)} className="h-8" />
                                ) : (
                                    <p className="font-medium">{referral!.patientFirstName}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Patient Last Name</label>
                                {isEditing ? (
                                    <Input value={formData.patientLastName || ''} onChange={(e) => handleInputChange('patientLastName', e.target.value)} className="h-8" />
                                ) : (
                                    <p className="font-medium">{referral!.patientLastName}</p>
                                )}
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Phone</label>
                        {isEditing ? (
                            <Input value={isVisit ? formData.phone : formData.patientPhone || ''} onChange={(e) => handleInputChange(isVisit ? 'phone' : 'patientPhone', e.target.value)} className="h-8" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a href={`tel:${isVisit ? visit!.phone : referral!.patientPhone}`} className="hover:underline">{isVisit ? visit!.phone : referral!.patientPhone}</a>
                            </div>
                        )}
                    </div>
                    {isVisit && (
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Email</label>
                            {isEditing ? (
                                <Input value={formData.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} className="h-8" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3 text-muted-foreground" />
                                    <button onClick={() => onEmail(submission)} className="hover:underline text-left">{visit!.email}</button>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="space-y-1 col-span-full">
                        <label className="text-xs text-muted-foreground">Location/Address</label>
                        {isEditing ? (
                            <Input value={isVisit ? formData.address : formData.patientAddress || ''} onChange={(e) => handleInputChange(isVisit ? 'address' : 'patientAddress', e.target.value)} className="h-8" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                <span>{isVisit ? visit!.address : `${referral!.patientAddress || 'N/A'}`}</span>
                            </div>
                        )}
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
                            {isEditing ? (
                                <Input value={formData.woundType || ''} onChange={(e) => handleInputChange('woundType', e.target.value)} className="h-8" />
                            ) : (
                                <p className="font-medium capitalize">{submission.woundType}</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                            {isVisit ? "Additional Info / Description" : "Clinical Notes"}
                        </label>
                        {isEditing ? (
                            <Textarea
                                value={isVisit ? formData.additionalInfo : formData.clinicalNotes || ''}
                                onChange={(e) => handleInputChange(isVisit ? 'additionalInfo' : 'clinicalNotes', e.target.value)}
                                className="min-h-[100px]"
                            />
                        ) : (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed bg-muted/20 p-3 rounded border">
                                {isVisit ? visit!.additionalInfo : referral!.clinicalNotes}
                            </p>
                        )}
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
                            {isEditing ? (
                                <Input value={formData.providerName || ''} onChange={(e) => handleInputChange('providerName', e.target.value)} className="h-8" />
                            ) : (
                                <p className="font-medium">{referral!.providerName}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Practice Name</label>
                            {isEditing ? (
                                <Input value={formData.practiceName || ''} onChange={(e) => handleInputChange('practiceName', e.target.value)} className="h-8" />
                            ) : (
                                <p className="font-medium">{referral!.practiceName}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Provider Phone</label>
                            {isEditing ? (
                                <Input value={formData.providerPhone || ''} onChange={(e) => handleInputChange('providerPhone', e.target.value)} className="h-8" />
                            ) : (
                                <p>{referral!.providerPhone}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground">Provider Email</label>
                            {isEditing ? (
                                <Input value={formData.providerEmail || ''} onChange={(e) => handleInputChange('providerEmail', e.target.value)} className="h-8" />
                            ) : (
                                <p>{referral!.providerEmail}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const Actions = ({ className }: { className?: string }) => (
        <div className={className}>
            {isEditing ? (
                <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button onClick={handleSave} className="gap-2">
                        <Save className="h-4 w-4" /> Save Changes
                    </Button>
                </>
            ) : (
                <>
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
                </>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader className="text-left flex justify-between items-center pr-4">
                        <DrawerTitle className="flex items-center gap-2 text-xl">
                            <FileText className="h-5 w-5 text-primary" />
                            {isVisit ? "Visit Request Details" : "Provider Referral Details"}
                        </DrawerTitle>
                        {/* Edit Button for Mobile Header */}
                        {!isEditing && (
                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                                <Pencil className="h-5 w-5 text-primary" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        )}
                    </DrawerHeader>
                    <div className="p-4 overflow-y-auto">
                        <Content />
                    </div>
                    <DrawerFooter className="pt-2">
                        <Actions className="flex gap-2 w-full justify-end" />
                        {!isEditing && (
                            <DrawerClose asChild>
                                <Button variant="outline">Close</Button>
                            </DrawerClose>
                        )}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-5 w-5 text-primary" />
                        {isVisit ? "Visit Request Details" : "Provider Referral Details"}
                    </DialogTitle>
                    {!isEditing && (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                            <Pencil className="h-5 w-5 text-primary" />
                            <span className="sr-only">Edit</span>
                        </Button>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-4">
                    <Content />
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4 mt-2 border-t">
                    <Actions className="flex flex-1 gap-2 justify-end" />
                    {!isEditing && (
                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

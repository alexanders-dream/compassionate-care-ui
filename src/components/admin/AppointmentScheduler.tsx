import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, CalendarIcon, Clock, MapPin, User, Phone, Mail, FileText, AlertCircle, Send, CheckCircle2, ArrowUpDown, Filter, Search, Eye, ChevronDown, ArrowDown, ArrowUp, X } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Appointment,
  VisitRequest, ProviderReferralSubmission
} from "@/data/siteContent";
import StatusCounts from "./StatusCounts";

import { supabase } from "@/integrations/supabase/client";
import AdminPagination from "./AdminPagination";
import RoleGate from "@/components/auth/RoleGate";
import EmailComposeModal from "./EmailComposeModal";

// Shared constants
export const useClinicians = () => {
  const [clinicians, setClinicians] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinicians = async () => {
      try {
        // 1. Get User IDs with "medical_staff" role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "medical_staff");

        if (!roles || roles.length === 0) {
          setClinicians([]);
          setLoading(false);
          return;
        }

        const userIds = roles.map(r => r.user_id);

        // 2. Get names from Team Members (preferred) and Profiles
        const { data: teamMembers } = await supabase
          .from("team_members")
          .select("name, user_id")
          .in("user_id", userIds);

        const { data: profiles } = await supabase
          .from("profiles")
          .select("full_name, user_id")
          .in("user_id", userIds);

        const nameMap = new Map<string, string>();

        // Fill with profile names first
        profiles?.forEach(p => {
          if (p.full_name) nameMap.set(p.user_id, p.full_name);
        });

        // Overwrite with Team Member names (more formal usually)
        teamMembers?.forEach(tm => {
          if (tm.name) nameMap.set(tm.user_id, tm.name);
        });

        setClinicians(Array.from(nameMap.values()).sort());
      } catch (error) {
        console.error("Error fetching clinicians:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicians();
  }, []);

  return { clinicians, loading };
};


export const appointmentTypes = [
  { value: "initial", label: "Initial Assessment" },
  { value: "follow-up", label: "Follow-up Visit" },
  { value: "wound-assessment", label: "Wound Assessment" },
  { value: "dressing-change", label: "Dressing Change" }
];

export const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

// Reusable appointment form data type
export interface AppointmentFormData {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentTime: string;
  duration: number;
  type: Appointment["type"];
  clinician: string;
  location: Appointment["location"];
  address: string;
  notes: string;
  visitRequestId?: string;
  providerReferralId?: string;
  // Additional submission context
  woundType?: string;
  urgency?: string;
  preferredContact?: string;
  additionalInfo?: string;
  providerName?: string;
  practiceName?: string;
  patientDOB?: string;
  clinicalNotes?: string;
  submittedAt?: string;
  linkedSubmissionType?: "visit" | "referral"; // Keep helper for UI display logic
}

export const getDefaultFormData = (): AppointmentFormData => ({
  patientName: "",
  patientPhone: "",
  patientEmail: "",
  appointmentTime: "09:00",
  duration: 60,
  type: "initial",
  clinician: "",
  location: "in-home",
  address: "",
  notes: "",
  visitRequestId: undefined,
  providerReferralId: undefined,
  linkedSubmissionType: undefined
});

// Standalone Scheduling Dialog Component
interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<AppointmentFormData>;
  onSchedule: (appointment: Appointment) => void;
  editingAppointment?: Appointment | null;
  existingAppointments?: Appointment[];
  visitRequests: VisitRequest[];
  referrals: ProviderReferralSubmission[];
  availableClinicians: string[];
}

export const ScheduleDialog = ({
  open,
  onOpenChange,
  initialData,
  onSchedule,
  editingAppointment,
  existingAppointments = [],
  visitRequests,
  referrals,
  availableClinicians
}: ScheduleDialogProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState<AppointmentFormData>(getDefaultFormData());

  // Update form data when dialog opens with new initial data
  useEffect(() => {
    if (open) {
      if (editingAppointment) {
        setSelectedDate(new Date(editingAppointment.appointmentDate));
        setFormData({
          ...getDefaultFormData(),
          patientName: editingAppointment.patientName,
          patientPhone: editingAppointment.patientPhone || "",
          patientEmail: editingAppointment.patientEmail || "",
          appointmentTime: editingAppointment.appointmentTime,
          duration: editingAppointment.duration,
          type: editingAppointment.type,
          clinician: editingAppointment.clinician || availableClinicians[0] || "",
          location: (editingAppointment.location as Appointment["location"]) || "in-home",
          address: editingAppointment.address || "",
          notes: editingAppointment.notes || "",
          visitRequestId: editingAppointment.visitRequestId || undefined,
          providerReferralId: editingAppointment.providerReferralId || undefined,
          linkedSubmissionType: editingAppointment.visitRequestId ? "visit" : editingAppointment.providerReferralId ? "referral" : undefined
        });

        // If editing, we also need to hydrate the display fields (providerName, woundType, etc.) from the source list
        // because these aren't stored on the Appointment itself, but we want to show the Summary Card
        if (editingAppointment.visitRequestId) {
          const req = visitRequests.find(v => v.id === editingAppointment.visitRequestId);
          if (req) {
            setFormData(prev => ({
              ...prev,
              woundType: req.woundType,
              additionalInfo: req.additionalInfo,
              submittedAt: req.submittedAt
            }));
          }
        } else if (editingAppointment.providerReferralId) {
          const ref = referrals.find(r => r.id === editingAppointment.providerReferralId);
          if (ref) {
            setFormData(prev => ({
              ...prev,
              woundType: ref.woundType,
              urgency: ref.urgency,
              clinicalNotes: ref.clinicalNotes,
              submittedAt: ref.submittedAt,
              providerName: ref.providerName,
              practiceName: ref.practiceName,
              patientDOB: ref.patientDOB
            }));
          }
        }
      } else if (initialData) {
        setSelectedDate(new Date());
        setFormData({
          ...getDefaultFormData(),
          clinician: availableClinicians[0] || "",
          ...initialData
        });
      } else {
        setSelectedDate(new Date());
        setFormData({
          ...getDefaultFormData(),
          clinician: availableClinicians[0] || ""
        });
      }
    }
  }, [open, initialData, editingAppointment, availableClinicians]);

  // Helper to get all time slots blocked by an appointment based on its duration
  const getBlockedSlots = (startTime: string, duration: number): string[] => {
    const startIndex = timeSlots.indexOf(startTime);
    if (startIndex === -1) return [startTime];

    // Each slot is 30 minutes, so calculate how many slots the duration covers
    const slotsNeeded = Math.ceil(duration / 30);
    const blockedSlots: string[] = [];

    for (let i = 0; i < slotsNeeded && (startIndex + i) < timeSlots.length; i++) {
      blockedSlots.push(timeSlots[startIndex + i]);
    }

    return blockedSlots;
  };

  // Get booked time slots for the selected date and clinician (includes all slots covered by duration)
  const getBookedTimesForDate = (date: Date | undefined, clinician: string): string[] => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    const bookedTimes: string[] = [];

    existingAppointments
      .filter(apt =>
        apt.appointmentDate === dateStr &&
        apt.clinician === clinician &&
        apt.status !== "cancelled" &&
        apt.id !== editingAppointment?.id // Allow editing current appointment's time
      )
      .forEach(apt => {
        const blockedSlots = getBlockedSlots(apt.appointmentTime, apt.duration);
        bookedTimes.push(...blockedSlots);
      });

    return [...new Set(bookedTimes)]; // Remove duplicates
  };

  // Check if selecting a time slot would conflict with existing appointments
  const wouldConflict = (time: string, duration: number): boolean => {
    const bookedTimes = getBookedTimesForDate(selectedDate, formData.clinician);
    const slotsNeeded = getBlockedSlots(time, duration);
    return slotsNeeded.some(slot => bookedTimes.includes(slot));
  };

  // Get available time slots (excluding booked ones and checking if duration fits)
  const getAvailableTimeSlots = () => {
    const bookedTimes = getBookedTimesForDate(selectedDate, formData.clinician);
    return timeSlots.map(time => ({
      time,
      isBooked: bookedTimes.includes(time) || wouldConflict(time, formData.duration)
    }));
  };

  // Get dates that are fully booked for the calendar
  const getFullyBookedDates = (clinician: string): Date[] => {
    const dateBookings: Record<string, Set<string>> = {};
    existingAppointments
      .filter(apt => apt.clinician === clinician && apt.status !== "cancelled")
      .forEach(apt => {
        if (!dateBookings[apt.appointmentDate]) {
          dateBookings[apt.appointmentDate] = new Set();
        }
        const blockedSlots = getBlockedSlots(apt.appointmentTime, apt.duration);
        blockedSlots.forEach(slot => dateBookings[apt.appointmentDate].add(slot));
      });

    // Consider a date fully booked if all time slots are blocked
    return Object.entries(dateBookings)
      .filter(([_, slots]) => slots.size >= timeSlots.length)
      .map(([date]) => new Date(date));
  };

  const availableSlots = getAvailableTimeSlots();
  const hasAvailableSlots = availableSlots.some(slot => !slot.isBooked);
  const fullyBookedDates = getFullyBookedDates(formData.clinician);

  // Reset time if selected time becomes unavailable when date/clinician/duration changes
  useEffect(() => {
    if (selectedDate && formData.appointmentTime && !editingAppointment) {
      if (wouldConflict(formData.appointmentTime, formData.duration)) {
        // Find the first available slot that fits the duration
        const bookedTimes = getBookedTimesForDate(selectedDate, formData.clinician);
        const firstAvailable = timeSlots.find(t =>
          !bookedTimes.includes(t) && !wouldConflict(t, formData.duration)
        );
        if (firstAvailable) {
          setFormData(prev => ({ ...prev, appointmentTime: firstAvailable }));
        }
      }
    }
  }, [selectedDate, formData.clinician, formData.duration]);

  const handleSave = () => {
    if (!selectedDate || !formData.patientName || !formData.appointmentTime) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    // Check if the selected time is still available
    const bookedTimes = getBookedTimesForDate(selectedDate, formData.clinician);
    if (bookedTimes.includes(formData.appointmentTime)) {
      toast({ title: "This time slot is no longer available", variant: "destructive" });
      return;
    }

    const appointmentData: Appointment = {
      id: editingAppointment?.id || `apt${Date.now()}`,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      patientEmail: formData.patientEmail,
      appointmentDate: format(selectedDate, "yyyy-MM-dd"),
      appointmentTime: formData.appointmentTime,
      duration: formData.duration,
      type: formData.type || "initial",
      clinician: formData.clinician,
      // @ts-ignore
      location: formData.location || "in-home",
      address: formData.location === "in-home" ? formData.address : undefined,
      notes: formData.notes || undefined,
      status: editingAppointment?.status || "scheduled",
      visitRequestId: formData.visitRequestId,
      providerReferralId: formData.providerReferralId,
      reminderSent: editingAppointment?.reminderSent || false,
      createdAt: editingAppointment?.createdAt || new Date().toISOString()
    };

    onSchedule(appointmentData);
    onOpenChange(false);
  };

  const hasSubmissionData = !!(formData.visitRequestId || formData.providerReferralId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAppointment ? "Edit Appointment" : "Schedule Appointment"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Submission Summary Card */}
          {hasSubmissionData && (
            <Card className="bg-muted/30 border-transparent shadow-none">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-primary mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">
                        {formData.linkedSubmissionType === "visit" ? "Visit Request" : "Provider Referral"}
                      </h4>
                      {formData.submittedAt && (
                        <span className="text-xs text-muted-foreground">
                          Submitted: {new Date(formData.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formData.patientName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{formData.patientPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="truncate">{formData.patientEmail}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.woundType && (
                        <Badge variant="outline" className="text-xs">
                          Wound: {formData.woundType}
                        </Badge>
                      )}
                      {formData.urgency && (
                        <Badge
                          variant={formData.urgency === "urgent" ? "destructive" : "secondary"}
                          className="text-xs"
                        >
                          {formData.urgency}
                        </Badge>
                      )}
                      {formData.preferredContact && (
                        <Badge variant="secondary" className="text-xs">
                          Prefers: {formData.preferredContact}
                        </Badge>
                      )}
                      {formData.patientDOB && (
                        <Badge variant="secondary" className="text-xs">
                          DOB: {formData.patientDOB}
                        </Badge>
                      )}
                    </div>

                    {formData.linkedSubmissionType === "referral" && formData.providerName && (
                      <div className="pt-1 text-sm text-muted-foreground border-t mt-2">
                        <span className="font-medium">Referred by:</span> {formData.providerName}
                        {formData.practiceName && ` (${formData.practiceName})`}
                      </div>
                    )}

                    {(formData.additionalInfo || formData.clinicalNotes) && (
                      <div className="pt-1 text-sm border-t mt-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">
                            {formData.additionalInfo || formData.clinicalNotes}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Patient Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Patient Name *</Label>
              <Input
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.patientPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.patientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                placeholder="patient@email.com"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal overflow-hidden",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-4 w-4 shrink-0" />
                    <span className="truncate">{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                      fullyBookedDates.some(d =>
                        d.toDateString() === date.toDateString()
                      )
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Time * {!hasAvailableSlots && selectedDate && <span className="text-destructive text-xs">(No slots available)</span>}</Label>
              <Select
                value={formData.appointmentTime}
                onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentTime: value }))}
              >
                <SelectTrigger className={!hasAvailableSlots ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.map(({ time, isBooked }) => (
                    <SelectItem
                      key={time}
                      value={time}
                      disabled={isBooked}
                      className={isBooked ? "text-muted-foreground line-through" : ""}
                    >
                      {time} {isBooked && "(Booked)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedDate && (
                <p className="text-xs text-muted-foreground mt-1">
                  {availableSlots.filter(s => !s.isBooked).length} of {timeSlots.length} slots available
                </p>
              )}
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Select
                value={String(formData.duration)}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: Number(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">60 min</SelectItem>
                  <SelectItem value="90">90 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Appointment Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Appointment["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Clinician</Label>
              <Select
                value={formData.clinician}
                onValueChange={(value) => setFormData(prev => ({ ...prev, clinician: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableClinicians.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value as Appointment["location"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-home">In-Home Visit</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.location === "in-home" && (
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Patient's address"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <Button onClick={handleSave} className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
            {editingAppointment ? "Update Appointment" : "Schedule Appointment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Main Scheduler Props
interface AppointmentSchedulerProps {
  visitRequests: VisitRequest[];
  referrals: ProviderReferralSubmission[];
  onUpdateVisitStatus: (id: string, status: VisitRequest["status"]) => void;
  onUpdateReferralStatus: (id: string, status: ProviderReferralSubmission["status"]) => void;
  onUpdateAppointmentStatus?: (id: string, status: Appointment["status"]) => void;
  externalAppointments?: Appointment[];
  onAppointmentsChange?: (appointments: Appointment[]) => void;
  onDelete?: (id: string) => void;
}

const AppointmentScheduler = ({
  visitRequests,
  referrals,
  onUpdateVisitStatus,
  onUpdateReferralStatus,
  onUpdateAppointmentStatus,
  externalAppointments = [],
  onAppointmentsChange,
  onDelete
}: AppointmentSchedulerProps) => {
  const { toast } = useToast();
  const { clinicians, loading } = useClinicians();
  const [internalAppointments, setInternalAppointments] = useState<Appointment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState<AppointmentFormData>(getDefaultFormData());
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for action param in URL
  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "schedule") {
      resetForm();
      setIsDialogOpen(true);
      // Optional: Clear the param so it doesn't reopen on refresh, 
      // but keep it if we want the back button to maybe close it? 
      // For now, let's clear it to keep URL clean
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("action");
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);



  // View Details State
  const [viewAppointment, setViewAppointment] = useState<Appointment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailAppointment, setEmailAppointment] = useState<Appointment | null>(null);

  // Filtering and sorting state
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "date" | "status" | "type" | "clinician" | "location">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showTodayOnly, setShowTodayOnly] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, sortField, sortDirection, showTodayOnly]);
  // Removed status row background coloring - now using badges with alternating rows

  // Helper for toggling sort direction
  const toggleSort = (field: "name" | "date" | "status" | "type" | "clinician" | "location") => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Combine internal and external appointments, deduplicating by id
  const appointments = [...internalAppointments, ...externalAppointments].filter(
    (apt, index, self) => self.findIndex(a => a.id === apt.id) === index
  );

  // Filtered and sorted appointments
  const filteredAppointments = appointments
    .filter(apt => {
      const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
      const matchesSearch = searchQuery === "" ||
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.clinician.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.type.toLowerCase().includes(searchQuery.toLowerCase());

      const todayStr = format(new Date(), "yyyy-MM-dd");
      const matchesDate = !showTodayOnly || apt.appointmentDate === todayStr;

      return matchesStatus && matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.patientName.localeCompare(b.patientName);
          break;
        case "date": {
          const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
          const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
          comparison = dateA.getTime() - dateB.getTime();
          break;
        }
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
        case "clinician":
          comparison = a.clinician.localeCompare(b.clinician);
          break;
        case "location":
          comparison = a.location.localeCompare(b.location);
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Paginate the filtered results
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Wrapper to update appointments and notify parent
  const setAppointments = (updater: Appointment[] | ((prev: Appointment[]) => Appointment[])) => {
    setInternalAppointments(prev => {
      const newInternal = typeof updater === 'function' ? updater(prev) : updater;
      // Notify parent of all appointments (internal + external)
      const allApts = [...newInternal, ...externalAppointments].filter(
        (apt, index, self) => self.findIndex(a => a.id === apt.id) === index
      );
      onAppointmentsChange?.(allApts);
      return newInternal;
    });
  };

  const resetForm = () => {
    setFormData(getDefaultFormData());
    setSelectedDate(new Date());
    setEditingAppointment(null);
  };

  const handleSubmissionSelect = (value: string) => {
    if (!value) {
      setFormData(prev => ({ ...prev, visitRequestId: undefined, providerReferralId: undefined, linkedSubmissionType: undefined, patientName: "", patientPhone: "", patientEmail: "" }));
      return;
    }

    const [type, id] = value.split(":");
    if (type === "visit") {
      const request = visitRequests.find(v => v.id === id);
      if (request) {
        setFormData(prev => ({
          ...prev,
          visitRequestId: id,
          providerReferralId: undefined,
          linkedSubmissionType: "visit",
          patientName: `${request.firstName} ${request.lastName}`,
          patientPhone: request.phone,
          patientEmail: request.email
        }));
      }
    } else if (type === "referral") {
      const referral = referrals.find(r => r.id === id);
      if (referral) {
        setFormData(prev => ({
          ...prev,
          visitRequestId: undefined,
          providerReferralId: id,
          linkedSubmissionType: "referral",
          patientName: `${referral.patientFirstName} ${referral.patientLastName}`,
          patientPhone: referral.patientPhone,
          patientEmail: referral.providerEmail
        }));
      }
    }
  };

  const handleEditAppointment = (apt: Appointment) => {
    setEditingAppointment(apt);
    setSelectedDate(new Date(apt.appointmentDate));
    setFormData({
      patientName: apt.patientName,
      patientPhone: apt.patientPhone || "",
      patientEmail: apt.patientEmail || "",
      appointmentTime: apt.appointmentTime,
      duration: apt.duration,
      type: apt.type,
      clinician: apt.clinician,
      location: (apt.location as Appointment["location"]) || "in-home",
      address: apt.address || "",
      notes: apt.notes || "",
      visitRequestId: apt.visitRequestId || undefined,
      providerReferralId: apt.providerReferralId || undefined,
      linkedSubmissionType: apt.visitRequestId ? "visit" : apt.providerReferralId ? "referral" : undefined
    });
    setIsDialogOpen(true);
  };

  const handleSaveAppointment = () => {
    if (!selectedDate || !formData.patientName || !formData.appointmentTime) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const appointmentData: Appointment = {
      id: editingAppointment?.id || `apt${Date.now()}`,
      patientName: formData.patientName,
      patientPhone: formData.patientPhone,
      patientEmail: formData.patientEmail,
      appointmentDate: format(selectedDate, "yyyy-MM-dd"),
      appointmentTime: formData.appointmentTime,
      duration: formData.duration,
      type: formData.type || "initial",
      clinician: formData.clinician,
      location: (formData.location as Appointment["location"]) || "in-home",
      address: formData.location === "in-home" ? formData.address : undefined,
      notes: formData.notes || undefined,
      status: editingAppointment?.status || "scheduled",
      visitRequestId: formData.visitRequestId,
      providerReferralId: formData.providerReferralId,
      reminderSent: editingAppointment?.reminderSent || false,
      createdAt: editingAppointment?.createdAt || new Date().toISOString()
    };

    if (editingAppointment) {
      setAppointments(appointments.map(a => a.id === editingAppointment.id ? appointmentData : a));
      toast({ title: "Appointment updated" });
    } else {
      setAppointments([...appointments, appointmentData]);

      // Update linked submission status
      if (formData.visitRequestId) {
        onUpdateVisitStatus(formData.visitRequestId, "scheduled");
      } else if (formData.providerReferralId) {
        onUpdateReferralStatus(formData.providerReferralId, "scheduled");
      }

      toast({ title: "Appointment scheduled" });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteAppointment = (id: string) => {
    setItemToDelete(id);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      if (onDelete) {
        onDelete(itemToDelete);
      } else {
        // Fallback for local deletion if no handler provided (legacy behavior)
        setAppointments(appointments.filter(a => a.id !== itemToDelete));
        toast({ title: "Appointment deleted" });
      }
      setItemToDelete(null);
    }
  };

  const handleUpdateStatus = (id: string, status: Appointment["status"]) => {
    // 1. Update local state for immediate UI feedback
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));

    // 2. Persist appointment status change
    if (onUpdateAppointmentStatus) {
      onUpdateAppointmentStatus(id, status);
    }

    const apt = appointments.find(a => a.id === id);
    if (apt && status === "completed") {
      if (apt.visitRequestId) {
        onUpdateVisitStatus(apt.visitRequestId, "completed");
      } else if (apt.providerReferralId) {
        onUpdateReferralStatus(apt.providerReferralId, "completed");
      }
    }

    // Toast is handled by the mutation callback in parent usually, but keeping it here for immediate feedback if no parent handler
    if (!onUpdateAppointmentStatus) {
      toast({ title: "Status updated" });
    }
  };

  // Email handlers
  const handleEmail = (apt: Appointment) => {
    if (apt.patientEmail) {
      setEmailAppointment(apt);
      setEmailModalOpen(true);
    }
  };


  const getStatusBadge = (status: Appointment["status"], showIcon: boolean = false) => {
    // High contrast color scheme for better visibility
    const styles: Record<Appointment["status"], { bg: string; text: string; label: string }> = {
      scheduled: { bg: "bg-blue-300", text: "text-blue-900", label: "Scheduled" },
      completed: { bg: "bg-green-300", text: "text-green-900", label: "Completed" },
      cancelled: { bg: "bg-red-300", text: "text-red-900", label: "Cancelled" },
      "no_show": { bg: "bg-gray-300", text: "text-gray-900", label: "No Show" }
    };
    const style = styles[status];
    return (
      <Badge className={`${style.bg} ${style.text} hover:${style.bg} border-0 px-3 py-1.5 text-sm font-semibold ${showIcon ? 'flex items-center gap-1.5' : ''}`}>
        {style.label}
        {showIcon && <ChevronDown className="h-3.5 w-3.5" />}
      </Badge>
    );
  };

  const getTypeBadge = (type: Appointment["type"]) => {
    const labels: Record<Appointment["type"], string> = {
      "initial": "Initial",
      "follow-up": "Follow-up",
      "wound-assessment": "Assessment",
      "dressing-change": "Dressing"
    };
    return <Badge variant="outline">{labels[type]}</Badge>;
  };

  const pendingSubmissions = [
    ...visitRequests.filter(v => v.status !== "completed" && v.status !== "scheduled").map(v => ({ type: "visit" as const, id: v.id, label: `${v.firstName} ${v.lastName} (Visit Request)` })),
    ...referrals.filter(r => r.status !== "completed" && r.status !== "scheduled").map(r => ({ type: "referral" as const, id: r.id, label: `${r.patientFirstName} ${r.patientLastName} (Referral)` }))
  ];

  // Get booked time slots for the selected date and clinician (for inline dialog)
  const getBookedTimesForDateInternal = (date: Date | undefined, clinician: string): string[] => {
    if (!date) return [];
    const dateStr = format(date, "yyyy-MM-dd");
    return appointments
      .filter(apt =>
        apt.appointmentDate === dateStr &&
        apt.clinician === clinician &&
        apt.status !== "cancelled" &&
        apt.id !== editingAppointment?.id
      )
      .map(apt => apt.appointmentTime);
  };

  const internalAvailableSlots = timeSlots.map(time => ({
    time,
    isBooked: getBookedTimesForDateInternal(selectedDate, formData.clinician).includes(time)
  }));
  const internalHasAvailableSlots = internalAvailableSlots.some(slot => !slot.isBooked);

  const getFullyBookedDatesInternal = (clinician: string): Date[] => {
    const dateBookings: Record<string, number> = {};
    appointments
      .filter(apt => apt.clinician === clinician && apt.status !== "cancelled")
      .forEach(apt => {
        dateBookings[apt.appointmentDate] = (dateBookings[apt.appointmentDate] || 0) + 1;
      });
    return Object.entries(dateBookings)
      .filter(([_, count]) => count >= timeSlots.length)
      .map(([date]) => new Date(date));
  };

  const internalFullyBookedDates = getFullyBookedDatesInternal(formData.clinician);

  // Calculate status counts - High contrast color scheme
  const statusCounts = useMemo(() => [
    {
      status: "scheduled",
      count: appointments.filter(apt => apt.status === "scheduled").length,
      label: "Scheduled",
      colorClasses: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        activeBg: "bg-blue-200",
        activeText: "text-blue-900"
      }
    },
    {
      status: "completed",
      count: appointments.filter(apt => apt.status === "completed").length,
      label: "Completed",
      colorClasses: {
        bg: "bg-green-100",
        text: "text-green-700",
        activeBg: "bg-green-200",
        activeText: "text-green-900"
      }
    },
    {
      status: "cancelled",
      count: appointments.filter(apt => apt.status === "cancelled").length,
      label: "Cancelled",
      colorClasses: {
        bg: "bg-red-100",
        text: "text-red-700",
        activeBg: "bg-red-200",
        activeText: "text-red-900"
      }
    },
    {
      status: "no_show",
      count: appointments.filter(apt => apt.status === "no_show").length,
      label: "No Show",
      colorClasses: {
        bg: "bg-gray-200",
        text: "text-gray-700",
        activeBg: "bg-gray-300",
        activeText: "text-gray-900"
      }
    },
  ], [appointments]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Appointments ({filteredAppointments.length}{filterStatus !== "all" || searchQuery ? ` of ${appointments.length}` : ""})
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="hidden md:flex w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 border-transparent shadow-sm">
                <Plus className="h-4 w-4 mr-2" /> Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

              <DialogHeader>
                <DialogTitle>{editingAppointment ? "Edit Appointment" : "Schedule New Appointment"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Link to existing submission */}
                {!editingAppointment && pendingSubmissions.length > 0 && (
                  <div>
                    <Label>Link to Submission (optional)</Label>
                    <Select
                      value={formData.visitRequestId ? `visit:${formData.visitRequestId}` : formData.providerReferralId ? `referral:${formData.providerReferralId}` : ""}
                      onValueChange={handleSubmissionSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a pending request to auto-fill..." />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingSubmissions.map(sub => (
                          <SelectItem key={`${sub.type}:${sub.id}`} value={`${sub.type}:${sub.id}`}>
                            {sub.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Patient Name *</Label>
                    <Input
                      value={formData.patientName}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={formData.patientPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientPhone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.patientEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, patientEmail: e.target.value }))}
                      placeholder="patient@email.com"
                    />
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal overflow-hidden",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-1 h-4 w-4 shrink-0" />
                          <span className="truncate">{selectedDate ? format(selectedDate, "PPP") : "Pick a date"}</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="p-3 pointer-events-auto"
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                            internalFullyBookedDates.some(d =>
                              d.toDateString() === date.toDateString()
                            )
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Time * {!internalHasAvailableSlots && selectedDate && <span className="text-destructive text-xs">(No slots)</span>}</Label>
                    <Select
                      value={formData.appointmentTime}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentTime: value }))}
                    >
                      <SelectTrigger className={!internalHasAvailableSlots ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {internalAvailableSlots.map(({ time, isBooked }) => (
                          <SelectItem
                            key={time}
                            value={time}
                            disabled={isBooked}
                            className={isBooked ? "text-muted-foreground line-through" : ""}
                          >
                            {time} {isBooked && "(Booked)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {internalAvailableSlots.filter(s => !s.isBooked).length}/{timeSlots.length} available
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>Duration (minutes)</Label>
                    <Select
                      value={String(formData.duration)}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, duration: Number(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="90">90 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Appointment Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as Appointment["type"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {appointmentTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Clinician</Label>
                    <Select
                      value={formData.clinician}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, clinician: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clinicians.map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, location: value as Appointment["location"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-home">In-Home Visit</SelectItem>
                        <SelectItem value="clinic">Clinic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.location === "in-home" && (
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Patient's address"
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSaveAppointment} className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
                  {editingAppointment ? "Update Appointment" : "Schedule Appointment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Mobile Search & Filter Controls (Collapsible) */}
        <div className="md:hidden">
          <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-background w-full"
                />
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
                  {isFilterOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <Filter className="h-4 w-4" />
                  )}
                  <span className="sr-only">Toggle filters</span>
                </Button>
              </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-2 animate-in slide-in-from-top-1 fade-in-0 duration-200">
              <Select
                value={`${sortField}-${sortDirection}`}
                onValueChange={(value) => {
                  const [field, direction] = value.split('-') as ["name" | "date" | "status", "asc" | "desc"];
                  setSortField(field);
                  setSortDirection(direction);
                }}
              >
                <SelectTrigger className="w-full h-10 bg-background">
                  {sortDirection === "asc" ? <ArrowUp className="h-4 w-4 mr-2 text-muted-foreground" /> : <ArrowDown className="h-4 w-4 mr-2 text-muted-foreground" />}
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="date-asc">Date (Old-New)</SelectItem>
                  <SelectItem value="date-desc">Date (New-Old)</SelectItem>
                  <SelectItem value="status-asc">Status (A-Z)</SelectItem>
                  <SelectItem value="status-desc">Status (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Desktop Search Controls - Simplified */}
        <div className="hidden md:flex flex-col md:flex-row gap-3">
          <div className="relative w-full md:min-w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-background"
            />
          </div>
        </div>
      </div>

      {/* Interactive Status Counters */}
      <StatusCounts
        statusCounts={statusCounts}
        activeFilter={filterStatus}
        onFilterChange={setFilterStatus}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setShowTodayOnly(!showTodayOnly)}
              className={cn(
                "transition-all duration-200 group rounded-full",
                "focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                "outline-none ring-0 border-0",
                showTodayOnly ? "scale-105" : "hover:scale-[1.02] active:scale-95"
              )}
              style={{ outline: 'none', boxShadow: 'none' }}
            >
              <Badge
                className="border-0 px-3 py-1.5 text-sm font-semibold cursor-pointer flex items-center gap-1.5 transition-all outline-none ring-0 rounded-full"
                style={{
                  backgroundColor: showTodayOnly ? '#67e8f9' : '#cffafe', // cyan-300 : cyan-100
                  color: showTodayOnly ? '#164e63' : '#155e75', // cyan-900 : cyan-800
                  outline: 'none',
                  boxShadow: showTodayOnly
                    ? '0 10px 20px -3px rgb(0 0 0 / 0.15), 0 4px 6px -2px rgb(0 0 0 / 0.1)'
                    : '0 1px 2px 0 rgb(0 0 0 / 0.05)'
                }}
                onMouseEnter={(e) => {
                  if (!showTodayOnly) {
                    e.currentTarget.style.backgroundColor = '#a5f3fc'; // cyan-200
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showTodayOnly) {
                    e.currentTarget.style.backgroundColor = '#cffafe';
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
                  }
                }}
              >
                <span>Today</span>
                <span className="font-bold">
                  {appointments.filter(apt => apt.appointmentDate === format(new Date(), "yyyy-MM-dd")).length}
                </span>
              </Badge>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Show only appointments scheduled for today</p>
            {showTodayOnly && <p className="text-xs text-muted-foreground mt-1">Click to clear filter</p>}
          </TooltipContent>
        </Tooltip>
      </StatusCounts>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {paginatedAppointments.map(apt => (
          <Card key={apt.id} className={`overflow-hidden shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl bg-card transition-all active:scale-[0.99] ${(() => {
            const todayStr = format(new Date(), "yyyy-MM-dd");
            const isPastDue = apt.status === "scheduled" && apt.appointmentDate < todayStr;
            if (isPastDue) return "border-l-4 border-l-yellow-500";
            if (apt.status === "scheduled") return "border-l-4 border-l-primary";
            return "";
          })()}`}>
            <CardContent className="p-4 space-y-4">
              {/* Row 1: Header */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground truncate">{apt.patientName}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span className="truncate">{apt.clinician}</span>
                  </div>
                </div>
                {/* Status Badge */}
                <div className="shrink-0">
                  <Select
                    value={apt.status}
                    onValueChange={(value) => handleUpdateStatus(apt.id, value as Appointment["status"])}
                  >
                    <SelectTrigger className="w-auto border-0 bg-transparent p-0 h-auto gap-0 focus:ring-0 [&>svg]:hidden">
                      {(() => {
                        const todayStr = format(new Date(), "yyyy-MM-dd");
                        const isPastDue = apt.status === "scheduled" && apt.appointmentDate < todayStr;
                        if (isPastDue) {
                          return (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800">
                              Update <ChevronDown className="h-3 w-3 ml-1" />
                            </Badge>
                          );
                        }
                        const badge = getStatusBadge(apt.status, true);
                        return badge;
                      })()}
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no_show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2: Contact Chips */}
              {(apt.patientPhone || apt.patientEmail) && (
                <div className="flex flex-wrap gap-2">
                  {apt.patientPhone && (
                    <a href={`tel:${apt.patientPhone}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 transition-colors">
                      <Phone className="h-3 w-3" />
                      {apt.patientPhone}
                    </a>
                  )}
                  {apt.patientEmail && (
                    <button onClick={() => handleEmail(apt)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                      <Mail className="h-3 w-3" />
                      Email
                    </button>
                  )}
                </div>
              )}

              {/* Row 3: Details Grid */}
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm bg-muted/40 p-3 rounded-lg border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4 text-primary/70" />
                  <span className="text-foreground">{format(new Date(apt.appointmentDate), "MMM d")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary/70" />
                  <span className="text-foreground">{apt.appointmentTime} ({apt.duration}m)</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary/70" />
                  <span className="capitalize text-foreground">{apt.location.replace("-", " ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getTypeBadge(apt.type)}
                </div>
              </div>

              {/* Row 4: Actions */}
              <div className="grid grid-cols-[1fr,1fr,auto] gap-2 pt-1 border-t">
                <Button
                  variant="ghost"
                  className="h-10 text-muted-foreground"
                  onClick={() => { setViewAppointment(apt); setIsViewDialogOpen(true); }}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  className="h-10 border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
                  onClick={() => handleEditAppointment(apt)}
                >
                  Edit
                </Button>
                <RoleGate allowedRoles={['admin']}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => handleDeleteAppointment(apt.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </RoleGate>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredAppointments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {appointments.length === 0 ? "No appointments scheduled" : "No results match your filters"}
          </p>
        )}
        <AdminPagination
          currentPage={currentPage}
          totalItems={filteredAppointments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>




      {/* Desktop Table */}

      <div className="hidden md:block overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-0">
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => toggleSort("name")}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        Patient
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "name" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Click to sort by patient name {sortField === "name" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => toggleSort("date")}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        Date & Time
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "date" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Click to sort by date {sortField === "date" ? `(${sortDirection === "asc" ? "oldest first" : "newest first"})` : ""}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => toggleSort("type")}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        Type
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "type" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Click to sort by type {sortField === "type" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => toggleSort("clinician")}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        Clinician
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "clinician" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Click to sort by clinician {sortField === "clinician" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => toggleSort("location")}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        Location
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "location" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Click to sort by location {sortField === "location" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => toggleSort("status")}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1">
                        Status
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "status" ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Click to sort by status {sortField === "status" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableHead>
              <TableHead className="text-right text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAppointments.map((apt, index) => {
              const todayStr = format(new Date(), "yyyy-MM-dd");
              const isPastDue = apt.status === "scheduled" && apt.appointmentDate < todayStr;
              const borderClass = isPastDue ? "border-l-4 border-l-yellow-500" : apt.status === "scheduled" ? "border-l-4 border-l-purple-500" : "";
              return (
                <TableRow key={apt.id} className={`${index % 2 === 1 ? "bg-muted/50" : ""} ${borderClass}`}>
                  <TableCell>
                    <div className="font-bold">{apt.patientName}</div>
                    <div className="text-sm text-muted-foreground">{apt.patientPhone}</div>
                  </TableCell>
                  <TableCell>
                    <div>{format(new Date(apt.appointmentDate), "MMM d, yyyy")}</div>
                    <div className="text-sm text-muted-foreground">
                      {apt.appointmentTime} ({apt.duration}min)
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(apt.type)}</TableCell>
                  <TableCell>{apt.clinician}</TableCell>
                  <TableCell className="capitalize">{apt.location.replace("-", " ")}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Select
                              value={apt.status}
                              onValueChange={(value) => handleUpdateStatus(apt.id, value as Appointment["status"])}
                            >
                              <SelectTrigger className="w-auto min-w-[130px] border-0 bg-transparent hover:bg-muted/50 h-auto p-0 [&>svg]:hidden">
                                {(() => {
                                  const todayStr = format(new Date(), "yyyy-MM-dd");
                                  const isPastDue = apt.status === "scheduled" && apt.appointmentDate < todayStr;
                                  if (isPastDue) {
                                    return (
                                      <Badge className="bg-orange-300 text-orange-900 hover:bg-orange-300 border-0 px-3 py-1.5 text-sm font-semibold flex items-center gap-1.5">
                                        <AlertCircle className="h-3.5 w-3.5" />
                                        Update Appointment
                                        <ChevronDown className="h-3.5 w-3.5" />
                                      </Badge>
                                    );
                                  }
                                  return getStatusBadge(apt.status, true);
                                })()}
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="scheduled" className="text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                    <span className="text-indigo-700 dark:text-indigo-300">Scheduled</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="completed" className="text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-green-700 dark:text-green-300">Completed</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="cancelled" className="text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-red-700 dark:text-red-300">Cancelled</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="no_show" className="text-sm font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                                    <span className="text-gray-700 dark:text-gray-300">No Show</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        {apt.status === "scheduled" && (
                          <TooltipContent>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4" />
                              <span>
                                {format(new Date(apt.appointmentDate), "MMM d, yyyy")} @ {apt.appointmentTime}
                              </span>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        setViewAppointment(apt);
                        setIsViewDialogOpen(true);
                      }}
                      title="View Details"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => window.location.href = `tel:${apt.patientPhone}`}
                      disabled={!apt.patientPhone}
                      title="Call Patient"
                    >
                      <Phone className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEmail(apt)}
                      disabled={!apt.patientEmail}
                      title="Email Patient"
                    >
                      <Send className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditAppointment(apt)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <RoleGate allowedRoles={['admin']}>
                      <Button variant="ghost" size="sm" className="hover:bg-destructive/10" onClick={() => handleDeleteAppointment(apt.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </RoleGate>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredAppointments.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  {appointments.length === 0 ? "No appointments scheduled" : "No results match your filters"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden md:block">
        <AdminPagination
          currentPage={currentPage}
          totalItems={filteredAppointments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>




      <AppointmentDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        appointment={viewAppointment}
        onEmail={(apt) => handleEmail(apt)}
        onEdit={(apt) => handleEditAppointment(apt)}
        visitRequest={viewAppointment?.visitRequestId ? visitRequests.find(v => v.id === viewAppointment.visitRequestId) : undefined}
        referral={viewAppointment?.providerReferralId ? referrals.find(r => r.id === viewAppointment.providerReferralId) : undefined}
      />

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Compose Modal */}
      {emailAppointment && (
        <EmailComposeModal
          open={emailModalOpen}
          onOpenChange={setEmailModalOpen}
          recipientEmail={emailAppointment.patientEmail || ''}
          recipientName={emailAppointment.patientName}
          contextType="appointment"
          contextId={emailAppointment.id}
          placeholderData={{
            patient_name: emailAppointment.patientName,
            appointment_date: emailAppointment.appointmentDate,
            appointment_time: emailAppointment.appointmentTime,
            clinician: emailAppointment.clinician,
          }}
        />
      )}
    </div >
  );
};

export default AppointmentScheduler;

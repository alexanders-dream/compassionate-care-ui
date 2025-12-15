import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, CalendarIcon, Clock, MapPin, User, Phone, Mail, FileText, AlertCircle, Send, CheckCircle2, ArrowUpDown, Filter, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Appointment, sampleAppointments,
  VisitRequest, ProviderReferralSubmission
} from "@/data/siteContent";

// Shared constants
export const clinicians = [
  "Dr. Amanda Richards",
  "James Thompson, RN",
  "Lisa Chen"
];

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
  linkedSubmissionId: string;
  linkedSubmissionType: "visit" | "referral" | "";
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
}

export const getDefaultFormData = (): AppointmentFormData => ({
  patientName: "",
  patientPhone: "",
  patientEmail: "",
  appointmentTime: "09:00",
  duration: 60,
  type: "initial",
  clinician: clinicians[0],
  location: "in-home",
  address: "",
  notes: "",
  linkedSubmissionId: "",
  linkedSubmissionType: ""
});

// Standalone Scheduling Dialog Component
interface ScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<AppointmentFormData>;
  onSchedule: (appointment: Appointment) => void;
  editingAppointment?: Appointment | null;
  existingAppointments?: Appointment[];
}

export const ScheduleDialog = ({
  open,
  onOpenChange,
  initialData,
  onSchedule,
  editingAppointment,
  existingAppointments = []
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
          patientPhone: editingAppointment.patientPhone,
          patientEmail: editingAppointment.patientEmail,
          appointmentTime: editingAppointment.appointmentTime,
          duration: editingAppointment.duration,
          type: editingAppointment.type,
          clinician: editingAppointment.clinician,
          location: editingAppointment.location,
          address: editingAppointment.address || "",
          notes: editingAppointment.notes || "",
          linkedSubmissionId: editingAppointment.linkedSubmissionId || "",
          linkedSubmissionType: editingAppointment.linkedSubmissionType || ""
        });
      } else if (initialData) {
        setSelectedDate(new Date());
        setFormData({
          ...getDefaultFormData(),
          ...initialData
        });
      } else {
        setSelectedDate(new Date());
        setFormData(getDefaultFormData());
      }
    }
  }, [open, initialData, editingAppointment]);

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
      type: formData.type,
      clinician: formData.clinician,
      location: formData.location,
      address: formData.location === "in-home" ? formData.address : undefined,
      notes: formData.notes || undefined,
      status: editingAppointment?.status || "scheduled",
      linkedSubmissionId: formData.linkedSubmissionId || undefined,
      linkedSubmissionType: formData.linkedSubmissionType as "visit" | "referral" | undefined,
      createdAt: editingAppointment?.createdAt || new Date().toISOString()
    };

    onSchedule(appointmentData);
    onOpenChange(false);
  };

  const hasSubmissionData = formData.linkedSubmissionType && formData.linkedSubmissionId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAppointment ? "Edit Appointment" : "Schedule Appointment"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Submission Summary Card */}
          {hasSubmissionData && !editingAppointment && (
            <Card className="bg-muted/50 border-primary/20">
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
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
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

          <Button onClick={handleSave} className="w-full">
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
  externalAppointments?: Appointment[];
  onAppointmentsChange?: (appointments: Appointment[]) => void;
}

const AppointmentScheduler = ({
  visitRequests,
  referrals,
  onUpdateVisitStatus,
  onUpdateReferralStatus,
  externalAppointments = [],
  onAppointmentsChange
}: AppointmentSchedulerProps) => {
  const { toast } = useToast();
  const [internalAppointments, setInternalAppointments] = useState<Appointment[]>(sampleAppointments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState<AppointmentFormData>(getDefaultFormData());

  // Email dialog state
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailAppointment, setEmailAppointment] = useState<Appointment | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailsSent, setEmailsSent] = useState<Record<string, boolean>>({});

  // Filtering and sorting state
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<"name" | "date" | "status">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function for status row background colors
  const getStatusRowClass = (status: string) => {
    const statusClasses: Record<string, string> = {
      scheduled: "status-scheduled",
      confirmed: "status-confirmed",
      completed: "status-completed",
      cancelled: "status-cancelled",
      "no-show": "status-no-show"
    };
    return statusClasses[status] || "";
  };

  // Helper for toggling sort direction
  const toggleSort = (field: "name" | "date" | "status") => {
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
      return matchesStatus && matchesSearch;
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
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

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
      setFormData(prev => ({ ...prev, linkedSubmissionId: "", linkedSubmissionType: "", patientName: "", patientPhone: "", patientEmail: "" }));
      return;
    }

    const [type, id] = value.split(":");
    if (type === "visit") {
      const request = visitRequests.find(v => v.id === id);
      if (request) {
        setFormData(prev => ({
          ...prev,
          linkedSubmissionId: id,
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
          linkedSubmissionId: id,
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
      patientPhone: apt.patientPhone,
      patientEmail: apt.patientEmail,
      appointmentTime: apt.appointmentTime,
      duration: apt.duration,
      type: apt.type,
      clinician: apt.clinician,
      location: apt.location,
      address: apt.address || "",
      notes: apt.notes || "",
      linkedSubmissionId: apt.linkedSubmissionId || "",
      linkedSubmissionType: apt.linkedSubmissionType || ""
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
      type: formData.type,
      clinician: formData.clinician,
      location: formData.location,
      address: formData.location === "in-home" ? formData.address : undefined,
      notes: formData.notes || undefined,
      status: editingAppointment?.status || "scheduled",
      linkedSubmissionId: formData.linkedSubmissionId || undefined,
      linkedSubmissionType: formData.linkedSubmissionType as "visit" | "referral" | undefined,
      createdAt: editingAppointment?.createdAt || new Date().toISOString()
    };

    if (editingAppointment) {
      setAppointments(appointments.map(a => a.id === editingAppointment.id ? appointmentData : a));
      toast({ title: "Appointment updated" });
    } else {
      setAppointments([...appointments, appointmentData]);

      // Update linked submission status
      if (formData.linkedSubmissionId && formData.linkedSubmissionType) {
        if (formData.linkedSubmissionType === "visit") {
          onUpdateVisitStatus(formData.linkedSubmissionId, "scheduled");
        } else {
          onUpdateReferralStatus(formData.linkedSubmissionId, "scheduled");
        }
      }

      toast({ title: "Appointment scheduled" });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
    toast({ title: "Appointment deleted" });
  };

  const handleUpdateStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, status } : a));

    const apt = appointments.find(a => a.id === id);
    if (apt?.linkedSubmissionId && apt?.linkedSubmissionType && status === "completed") {
      if (apt.linkedSubmissionType === "visit") {
        onUpdateVisitStatus(apt.linkedSubmissionId, "completed");
      } else {
        onUpdateReferralStatus(apt.linkedSubmissionId, "completed");
      }
    }

    toast({ title: "Status updated" });
  };

  // Email handlers
  const openEmailDialog = (apt: Appointment) => {
    setEmailAppointment(apt);
    const appointmentDate = format(new Date(apt.appointmentDate), "MMMM d, yyyy");
    setEmailSubject("Appointment Confirmation - AR Advanced Woundcare Solutions");
    setEmailBody(`Dear ${apt.patientName},\n\nThis is to confirm your appointment with AR Advanced Woundcare Solutions.\n\nAppointment Details:\n- Date: ${appointmentDate}\n- Time: ${apt.appointmentTime}\n- Duration: ${apt.duration} minutes\n- Clinician: ${apt.clinician}\n- Location: ${apt.location === "in-home" ? `In-home visit at ${apt.address || "your address"}` : "Clinic visit"}\n\nPlease ensure you are available at the scheduled time. If you need to reschedule, please contact us as soon as possible.\n\nBest regards,\nAR Advanced Woundcare Solutions Team`);
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = () => {
    if (!emailAppointment) return;

    setEmailsSent(prev => ({ ...prev, [emailAppointment.id]: true }));

    toast({
      title: "Email Sent",
      description: `Confirmation email sent to ${emailAppointment.patientEmail || emailAppointment.patientName}`
    });
    setIsEmailDialogOpen(false);
    setEmailAppointment(null);
  };

  const getStatusBadge = (status: Appointment["status"]) => {
    const styles: Record<Appointment["status"], string> = {
      scheduled: "bg-blue-500",
      confirmed: "bg-green-500",
      completed: "bg-gray-500",
      cancelled: "bg-red-500",
      "no-show": "bg-amber-500"
    };
    return <Badge className={styles[status]}>{status}</Badge>;
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

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <h2 className="text-lg md:text-xl font-semibold">
            Appointments ({filteredAppointments.length}{filterStatus !== "all" || searchQuery ? ` of ${appointments.length}` : ""})
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="w-full sm:w-auto">
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
                      value={formData.linkedSubmissionId ? `${formData.linkedSubmissionType}:${formData.linkedSubmissionId}` : ""}
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
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
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

                <Button onClick={handleSaveAppointment} className="w-full">
                  {editingAppointment ? "Update Appointment" : "Schedule Appointment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 md:flex-none md:w-48">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32 h-9">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredAppointments.map(apt => (
          <Card key={apt.id} className={`p-4 ${getStatusRowClass(apt.status)}`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{apt.patientName}</p>
                  <p className="text-xs text-muted-foreground">{apt.patientPhone}</p>
                </div>
              </div>
              {getStatusBadge(apt.status)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{format(new Date(apt.appointmentDate), "MMM d")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{apt.appointmentTime} ({apt.duration}m)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="capitalize">{apt.location.replace("-", " ")}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {getTypeBadge(apt.type)}
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3">{apt.clinician}</p>

            <div className="flex items-center justify-between">
              <Select
                value={apt.status}
                onValueChange={(value) => handleUpdateStatus(apt.id, value as Appointment["status"])}
              >
                <SelectTrigger className="w-28 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEmailDialog(apt)}
                  disabled={!apt.patientEmail}
                  className="h-8 px-2"
                >
                  <Send className="h-3 w-3" />
                  {emailsSent[apt.id] && <CheckCircle2 className="h-3 w-3 text-green-500 ml-1" />}
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleEditAppointment(apt)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleDeleteAppointment(apt.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {filteredAppointments.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {appointments.length === 0 ? "No appointments scheduled" : "No results match your filters"}
          </p>
        )}
      </div>


      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Patient
                  <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "name" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => toggleSort("date")}
              >
                <div className="flex items-center gap-1">
                  Date & Time
                  <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "date" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Clinician</TableHead>
              <TableHead>Location</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => toggleSort("status")}
              >
                <div className="flex items-center gap-1">
                  Status
                  <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "status" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.map(apt => (
              <TableRow key={apt.id} className={getStatusRowClass(apt.status)}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{apt.patientName}</div>
                      <div className="text-sm text-muted-foreground">{apt.patientPhone}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div>{format(new Date(apt.appointmentDate), "MMM d, yyyy")}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {apt.appointmentTime} ({apt.duration}min)
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getTypeBadge(apt.type)}</TableCell>
                <TableCell>{apt.clinician}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="capitalize">{apt.location.replace("-", " ")}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={apt.status}
                    onValueChange={(value) => handleUpdateStatus(apt.id, value as Appointment["status"])}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEmailDialog(apt)}
                    className="gap-1"
                    disabled={!apt.patientEmail}
                    title={apt.patientEmail ? "Send email" : "No email address"}
                  >
                    <Send className="h-3 w-3" />
                    {emailsSent[apt.id] ? "Resend" : "Email"}
                    {emailsSent[apt.id] && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEditAppointment(apt)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAppointment(apt.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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


      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Appointment Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipient</Label>
              <Input
                value={emailAppointment?.patientEmail || ""}
                disabled
              />
            </div>
            <div>
              <Label>Patient</Label>
              <Input
                value={emailAppointment?.patientName || ""}
                disabled
              />
            </div>
            <div>
              <Label htmlFor="emailSubject">Subject</Label>
              <Input
                id="emailSubject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="emailBody">Message</Label>
              <Textarea
                id="emailBody"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={12}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} className="gap-2">
                <Send className="h-4 w-4" />
                Send Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentScheduler;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Pencil, Trash2, CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Appointment, sampleAppointments, 
  VisitRequest, ProviderReferralSubmission 
} from "@/data/siteContent";

interface AppointmentSchedulerProps {
  visitRequests: VisitRequest[];
  referrals: ProviderReferralSubmission[];
  onUpdateVisitStatus: (id: string, status: VisitRequest["status"]) => void;
  onUpdateReferralStatus: (id: string, status: ProviderReferralSubmission["status"]) => void;
}

const clinicians = [
  "Dr. Amanda Richards",
  "James Thompson, RN",
  "Lisa Chen"
];

const appointmentTypes = [
  { value: "initial", label: "Initial Assessment" },
  { value: "follow-up", label: "Follow-up Visit" },
  { value: "wound-assessment", label: "Wound Assessment" },
  { value: "dressing-change", label: "Dressing Change" }
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00"
];

const AppointmentScheduler = ({ 
  visitRequests, 
  referrals,
  onUpdateVisitStatus,
  onUpdateReferralStatus 
}: AppointmentSchedulerProps) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>(sampleAppointments);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    appointmentTime: "09:00",
    duration: 60,
    type: "initial" as Appointment["type"],
    clinician: clinicians[0],
    location: "in-home" as Appointment["location"],
    address: "",
    notes: "",
    linkedSubmissionId: "",
    linkedSubmissionType: "" as "visit" | "referral" | ""
  });

  const resetForm = () => {
    setFormData({
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Appointments ({appointments.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label>Time *</Label>
                  <Select 
                    value={formData.appointmentTime}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, appointmentTime: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>{time}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

      {/* Appointments Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Clinician</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map(apt => (
            <TableRow key={apt.id}>
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
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" onClick={() => handleEditAppointment(apt)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteAppointment(apt.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {appointments.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No appointments scheduled
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppointmentScheduler;

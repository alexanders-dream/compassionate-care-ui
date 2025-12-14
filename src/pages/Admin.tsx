import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Plus, Pencil, Trash2, 
  Sparkles, Mail, Send, CalendarDays,
  CheckCircle2, User, Image, Share2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { FormFieldConfig, FormFieldOption } from "@/data/formConfig";
import { useToast } from "@/hooks/use-toast";
import { blogPosts, BlogPost, categories } from "@/data/blogPosts";
import { 
  sampleVisitRequests, sampleReferrals,
  Testimonial, Service, TeamMember, FAQ, PatientResource, 
  VisitRequest, ProviderReferralSubmission 
} from "@/data/siteContent";
import AIArticleGenerator, { ArticleMedia } from "@/components/admin/AIArticleGenerator";
import AppointmentScheduler, { ScheduleDialog, AppointmentFormData } from "@/components/admin/AppointmentScheduler";
import { Appointment } from "@/data/siteContent";
import IconPicker from "@/components/admin/IconPicker";
import { defaultSiteCopy, SiteCopySection } from "@/data/siteCopy";
import AdminSidebar, { AdminSection } from "@/components/admin/AdminSidebar";
import { useSiteData } from "@/contexts/SiteDataContext";

interface ExtendedBlogPost extends BlogPost {
  status?: "draft" | "published" | "scheduled";
  scheduledDate?: string;
  media?: ArticleMedia[];
}

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    testimonials, setTestimonials,
    services, setServices,
    teamMembers: team, setTeamMembers: setTeam,
    faqs, setFaqs,
    patientResources, setPatientResources,
    formConfigs, setFormConfigs
  } = useSiteData();
  
  // State for content types not in context
  const [posts, setPosts] = useState<ExtendedBlogPost[]>(blogPosts.map(p => ({ ...p, status: "published" as const })));
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>(sampleVisitRequests);
  const [referrals, setReferrals] = useState<ProviderReferralSubmission[]>(sampleReferrals);
  const [siteCopy, setSiteCopy] = useState<SiteCopySection[]>(defaultSiteCopy);
  const [selectedCopyPage, setSelectedCopyPage] = useState<string>("all");
  const [selectedFormId, setSelectedFormId] = useState<string>(formConfigs[0]?.id || "");
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [activeSection, setActiveSection] = useState<AdminSection>(() => {
    const tab = searchParams.get("tab");
    return (tab as AdminSection) || "submissions";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Sync activeSection with URL tab param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeSection) {
      setActiveSection(tab as AdminSection);
    }
  }, [searchParams]);

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingResource, setEditingResource] = useState<PatientResource | null>(null);

  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState<{ type: "visit" | "referral"; data: VisitRequest | ProviderReferralSubmission } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  
  // Icon picker states
  const [resourceIcon, setResourceIcon] = useState("FileText");
  const [serviceIcon, setServiceIcon] = useState("Heart");
  
  // Inline scheduling state
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleInitialData, setScheduleInitialData] = useState<Partial<AppointmentFormData> | undefined>(undefined);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);

  // Team member image states
  const [teamMemberImage, setTeamMemberImage] = useState<File | null>(null);
  const [teamMemberImagePreview, setTeamMemberImagePreview] = useState<string | null>(null);
  const [resourceFile, setResourceFile] = useState<File | null>(null);

  const categoryOptions = categories.filter(c => c.id !== "all");


  const handleAISaveArticle = (article: ExtendedBlogPost) => {
    const existingIndex = posts.findIndex(p => p.id === article.id);
    if (existingIndex >= 0) {
      setPosts(posts.map(p => p.id === article.id ? article : p));
    } else {
      setPosts([article, ...posts]);
    }
    setShowAIGenerator(false);
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
    toast({ title: "Post deleted" });
  };

  const handleSharePost = (post: ExtendedBlogPost, platform: string) => {
    const postUrl = `${window.location.origin}/blog/${post.id}`;
    const postTitle = encodeURIComponent(post.title);
    const postExcerpt = encodeURIComponent(post.excerpt);
    
    let shareUrl = "";
    
    switch (platform) {
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${postTitle}&url=${encodeURIComponent(postUrl)}`;
        break;
      case "reddit":
        shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${postTitle}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${postTitle}%20${encodeURIComponent(postUrl)}`;
        break;
      case "email":
        shareUrl = `mailto:?subject=${postTitle}&body=${postExcerpt}%0A%0ARead more: ${encodeURIComponent(postUrl)}`;
        break;
      case "copy":
        navigator.clipboard.writeText(postUrl);
        toast({ title: "Link copied to clipboard" });
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary">Draft</Badge>;
      case "scheduled":
        return <Badge variant="outline" className="border-amber-500 text-amber-600">Scheduled</Badge>;
      default:
        return <Badge className="bg-green-500">Published</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "contacted":
        return <Badge variant="outline" className="border-blue-500 text-blue-600">Contacted</Badge>;
      case "scheduled":
        return <Badge className="bg-amber-500">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Testimonial handlers
  const handleSaveTestimonial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const testimonialData: Testimonial = {
      id: editingTestimonial?.id || String(Date.now()),
      name: String(formData.get("name")),
      role: String(formData.get("role")),
      content: String(formData.get("content")),
      rating: Number(formData.get("rating"))
    };

    if (editingTestimonial) {
      setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? testimonialData : t));
      toast({ title: "Testimonial updated successfully" });
    } else {
      setTestimonials([...testimonials, testimonialData]);
      toast({ title: "Testimonial created successfully" });
    }
    setIsTestimonialDialogOpen(false);
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (id: string) => {
    setTestimonials(testimonials.filter(t => t.id !== id));
    toast({ title: "Testimonial deleted" });
  };

  // Service handlers
  const handleSaveService = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const serviceData: Service = {
      id: editingService?.id || String(Date.now()),
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      icon: serviceIcon
    };

    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? serviceData : s));
      toast({ title: "Service updated successfully" });
    } else {
      setServices([...services, serviceData]);
      toast({ title: "Service created successfully" });
    }
    setIsServiceDialogOpen(false);
    setEditingService(null);
    setServiceIcon("Heart");
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
    toast({ title: "Service deleted" });
  };

  // Team Member handlers
  const handleTeamMemberImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTeamMemberImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamMemberImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({ title: `Image selected: ${file.name}` });
    }
  };

  const handleSaveTeamMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const memberData: TeamMember = {
      id: editingTeamMember?.id || String(Date.now()),
      name: String(formData.get("name")),
      role: String(formData.get("role")),
      bio: String(formData.get("bio")),
      image: teamMemberImagePreview || editingTeamMember?.image || undefined
    };

    if (editingTeamMember) {
      setTeam(team.map(m => m.id === editingTeamMember.id ? memberData : m));
      toast({ title: "Team member updated successfully" });
    } else {
      setTeam([...team, memberData]);
      toast({ title: "Team member added successfully" });
    }
    setIsTeamDialogOpen(false);
    setEditingTeamMember(null);
    setTeamMemberImage(null);
    setTeamMemberImagePreview(null);
  };

  const handleDeleteTeamMember = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
    toast({ title: "Team member removed" });
  };

  // FAQ handlers
  const handleSaveFaq = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const faqData: FAQ = {
      id: editingFaq?.id || String(Date.now()),
      question: String(formData.get("question")),
      answer: String(formData.get("answer")),
      category: String(formData.get("category"))
    };

    if (editingFaq) {
      setFaqs(faqs.map(f => f.id === editingFaq.id ? faqData : f));
      toast({ title: "FAQ updated successfully" });
    } else {
      setFaqs([...faqs, faqData]);
      toast({ title: "FAQ created successfully" });
    }
    setIsFaqDialogOpen(false);
    setEditingFaq(null);
  };

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
    toast({ title: "FAQ deleted" });
  };

  // Patient Resource handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResourceFile(file);
      toast({ title: `File selected: ${file.name}` });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSaveResource = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const resourceData: PatientResource = {
      id: editingResource?.id || String(Date.now()),
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      type: String(formData.get("type")) as PatientResource["type"],
      icon: resourceIcon,
      url: resourceFile ? `/downloads/${resourceFile.name}` : (String(formData.get("url")) || undefined),
      fileName: resourceFile?.name || editingResource?.fileName,
      fileSize: resourceFile ? formatFileSize(resourceFile.size) : editingResource?.fileSize,
      uploadedAt: resourceFile ? new Date().toISOString() : editingResource?.uploadedAt
    };

    if (editingResource) {
      setPatientResources(patientResources.map(r => r.id === editingResource.id ? resourceData : r));
      toast({ title: "Resource updated successfully" });
    } else {
      setPatientResources([...patientResources, resourceData]);
      toast({ title: "Resource created successfully" });
    }
    setIsResourceDialogOpen(false);
    setEditingResource(null);
    setResourceFile(null);
    setResourceIcon("FileText");
  };

  const handleDeleteResource = (id: string) => {
    setPatientResources(patientResources.filter(r => r.id !== id));
    toast({ title: "Resource deleted" });
  };

  // Email handlers
  const openEmailDialog = (type: "visit" | "referral", data: VisitRequest | ProviderReferralSubmission) => {
    setEmailRecipient({ type, data });
    const name = type === "visit" 
      ? `${(data as VisitRequest).firstName} ${(data as VisitRequest).lastName}`
      : `${(data as ProviderReferralSubmission).patientFirstName} ${(data as ProviderReferralSubmission).patientLastName}`;
    setEmailSubject("Booking Confirmation - AR Advanced Woundcare Solutions");
    setEmailBody(`Dear ${name},\n\nThank you for your ${type === "visit" ? "visit request" : "referral"}.\n\nWe are pleased to confirm your appointment. Our care coordinator will reach out to you shortly to finalize the details.\n\nIf you have any questions, please don't hesitate to contact us.\n\nBest regards,\nAR Advanced Woundcare Solutions Team`);
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = () => {
    if (!emailRecipient) return;
    
    const email = emailRecipient.type === "visit" 
      ? (emailRecipient.data as VisitRequest).email 
      : (emailRecipient.data as ProviderReferralSubmission).providerEmail;
    
    if (emailRecipient.type === "visit") {
      setVisitRequests(visitRequests.map(vr => 
        vr.id === emailRecipient.data.id ? { ...vr, emailSent: true, status: "contacted" as const } : vr
      ));
    } else {
      setReferrals(referrals.map(ref => 
        ref.id === emailRecipient.data.id ? { ...ref, emailSent: true, status: "contacted" as const } : ref
      ));
    }
    
    toast({ 
      title: "Email Sent",
      description: `Confirmation email sent to ${email}`
    });
    setIsEmailDialogOpen(false);
    setEmailRecipient(null);
  };

  const updateVisitStatus = (id: string, status: VisitRequest["status"]) => {
    setVisitRequests(visitRequests.map(vr => vr.id === id ? { ...vr, status } : vr));
    toast({ title: "Status updated" });
  };

  const updateReferralStatus = (id: string, status: ProviderReferralSubmission["status"]) => {
    setReferrals(referrals.map(ref => ref.id === id ? { ...ref, status } : ref));
    toast({ title: "Status updated" });
  };

  // Inline scheduling handlers
  const openScheduleDialog = (type: "visit" | "referral", data: VisitRequest | ProviderReferralSubmission) => {
    if (type === "visit") {
      const request = data as VisitRequest;
      setScheduleInitialData({
        patientName: `${request.firstName} ${request.lastName}`,
        patientPhone: request.phone,
        patientEmail: request.email,
        address: request.address,
        linkedSubmissionId: request.id,
        linkedSubmissionType: "visit",
        notes: request.additionalInfo || "",
        woundType: request.woundType,
        preferredContact: request.preferredContact,
        additionalInfo: request.additionalInfo,
        submittedAt: request.submittedAt
      });
    } else {
      const referral = data as ProviderReferralSubmission;
      setScheduleInitialData({
        patientName: `${referral.patientFirstName} ${referral.patientLastName}`,
        patientPhone: referral.patientPhone,
        patientEmail: referral.providerEmail,
        address: referral.patientAddress,
        linkedSubmissionId: referral.id,
        linkedSubmissionType: "referral",
        notes: referral.clinicalNotes || "",
        woundType: referral.woundType,
        urgency: referral.urgency,
        providerName: referral.providerName,
        practiceName: referral.practiceName,
        patientDOB: referral.patientDOB,
        clinicalNotes: referral.clinicalNotes,
        submittedAt: referral.submittedAt
      });
    }
    setIsScheduleDialogOpen(true);
  };

  const handleInlineSchedule = (appointment: Appointment) => {
    setAllAppointments(prev => [...prev, appointment]);
    
    if (appointment.linkedSubmissionId && appointment.linkedSubmissionType) {
      if (appointment.linkedSubmissionType === "visit") {
        setVisitRequests(visitRequests.map(vr => 
          vr.id === appointment.linkedSubmissionId ? { ...vr, status: "scheduled" as const } : vr
        ));
      } else {
        setReferrals(referrals.map(ref => 
          ref.id === appointment.linkedSubmissionId ? { ...ref, status: "scheduled" as const } : ref
        ));
      }
    }
    
    toast({ title: "Appointment scheduled successfully" });
  };

  const handleAppointmentsChange = (appointments: Appointment[]) => {
    setAllAppointments(appointments);
  };

  // Site Copy handlers
  const handleUpdateCopyField = (sectionId: string, fieldKey: string, newValue: string) => {
    setSiteCopy(siteCopy.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: section.fields.map(field => 
            field.key === fieldKey ? { ...field, value: newValue } : field
          )
        };
      }
      return section;
    }));
  };

  const handleSaveCopySection = (sectionId: string) => {
    toast({ title: "Site copy updated", description: "Changes saved successfully" });
  };

  const handleCopyImageUpload = (sectionId: string, fieldKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateCopyField(sectionId, fieldKey, reader.result as string);
        toast({ title: "Image uploaded", description: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const uniquePages = ["all", ...new Set(siteCopy.map(s => s.page))];
  const filteredCopySections = selectedCopyPage === "all" 
    ? siteCopy 
    : siteCopy.filter(s => s.page === selectedCopyPage);

  // Form Config handlers
  const selectedForm = formConfigs.find(f => f.id === selectedFormId);
  
  const handleToggleFieldEnabled = (fieldId: string) => {
    setFormConfigs(formConfigs.map(form => {
      if (form.id === selectedFormId) {
        return {
          ...form,
          fields: form.fields.map(field =>
            field.id === fieldId ? { ...field, enabled: !field.enabled } : field
          )
        };
      }
      return form;
    }));
  };

  const handleToggleFieldRequired = (fieldId: string) => {
    setFormConfigs(formConfigs.map(form => {
      if (form.id === selectedFormId) {
        return {
          ...form,
          fields: form.fields.map(field =>
            field.id === fieldId ? { ...field, required: !field.required } : field
          )
        };
      }
      return form;
    }));
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormFieldConfig>) => {
    setFormConfigs(formConfigs.map(form => {
      if (form.id === selectedFormId) {
        return {
          ...form,
          fields: form.fields.map(field =>
            field.id === fieldId ? { ...field, ...updates } : field
          )
        };
      }
      return form;
    }));
  };

  const handleSaveFieldEdit = () => {
    if (!editingField) return;
    handleUpdateField(editingField.id, editingField);
    setIsFieldDialogOpen(false);
    setEditingField(null);
    toast({ title: "Field updated successfully" });
  };

  const handleAddFieldOption = () => {
    if (!editingField || !newOptionLabel || !newOptionValue) return;
    const newOption: FormFieldOption = { label: newOptionLabel, value: newOptionValue };
    setEditingField({
      ...editingField,
      options: [...(editingField.options || []), newOption]
    });
    setNewOptionLabel("");
    setNewOptionValue("");
  };

  const handleRemoveFieldOption = (index: number) => {
    if (!editingField) return;
    setEditingField({
      ...editingField,
      options: editingField.options?.filter((_, i) => i !== index)
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setFormConfigs(formConfigs.map(form => {
      if (form.id === selectedFormId) {
        return {
          ...form,
          fields: form.fields.filter(field => field.id !== fieldId)
        };
      }
      return form;
    }));
    toast({ title: "Field removed" });
  };

  const handleAddNewField = () => {
    if (!selectedForm) return;
    const newField: FormFieldConfig = {
      id: `new-${Date.now()}`,
      key: `newField${Date.now()}`,
      label: "New Field",
      type: "text",
      placeholder: "",
      required: false,
      enabled: true,
      order: selectedForm.fields.length + 1
    };
    setFormConfigs(formConfigs.map(form => {
      if (form.id === selectedFormId) {
        return { ...form, fields: [...form.fields, newField] };
      }
      return form;
    }));
    setEditingField(newField);
    setIsFieldDialogOpen(true);
  };

  const handleSaveFormConfig = () => {
    toast({ title: "Form configuration saved", description: "Changes will apply to the live forms" });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | AR Advanced Woundcare Solutions</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex bg-background">
        <AdminSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 flex flex-col min-w-0 w-full">
          <header className="bg-muted/30 border-b border-border px-4 md:px-6 py-4 md:py-6 pl-16 md:pl-6">
            <h1 className="text-xl md:text-3xl font-bold text-primary">Admin Dashboard</h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">Manage all website content</p>
          </header>

          <ScrollArea className="flex-1">
            <main className="p-3 md:p-6">
              {/* Submissions Section */}
              {activeSection === "submissions" && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Visit Requests ({visitRequests.length})
                    </h2>
                    
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {visitRequests.map(request => (
                        <Card key={request.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{request.firstName} {request.lastName}</p>
                              <p className="text-xs text-muted-foreground">{request.email}</p>
                            </div>
                            <Select 
                              value={request.status} 
                              onValueChange={(value) => updateVisitStatus(request.id, value as VisitRequest["status"])}
                            >
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <Badge variant="outline" className="capitalize">{request.woundType}</Badge>
                            <span>{new Date(request.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-2">
                            {request.status !== "scheduled" && request.status !== "completed" && (
                              <Button variant="default" size="sm" onClick={() => openScheduleDialog("visit", request)} className="flex-1 text-xs">
                                <CalendarDays className="h-3 w-3 mr-1" /> Schedule
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => openEmailDialog("visit", request)} className="flex-1 text-xs">
                              <Send className="h-3 w-3 mr-1" /> {request.emailSent ? "Resend" : "Email"}
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {visitRequests.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No visit requests yet</p>
                      )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Wound Type</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visitRequests.map(request => (
                            <TableRow key={request.id}>
                              <TableCell className="font-medium">
                                {request.firstName} {request.lastName}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{request.email}</div>
                                  <div className="text-muted-foreground">{request.phone}</div>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{request.woundType}</TableCell>
                              <TableCell>
                                <Select 
                                  value={request.status} 
                                  onValueChange={(value) => updateVisitStatus(request.id, value as VisitRequest["status"])}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>{new Date(request.submittedAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right space-x-1">
                                {request.status !== "scheduled" && request.status !== "completed" && (
                                  <Button variant="default" size="sm" onClick={() => openScheduleDialog("visit", request)} className="gap-1">
                                    <CalendarDays className="h-3 w-3" /> Schedule
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => openEmailDialog("visit", request)} className="gap-1">
                                  <Send className="h-3 w-3" /> {request.emailSent ? "Resend" : "Email"}
                                </Button>
                                {request.emailSent && <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-1" />}
                              </TableCell>
                            </TableRow>
                          ))}
                          {visitRequests.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No visit requests yet</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Provider Referrals ({referrals.length})
                    </h2>
                    
                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-3">
                      {referrals.map(referral => (
                        <Card key={referral.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{referral.patientFirstName} {referral.patientLastName}</p>
                              <p className="text-xs text-muted-foreground">{referral.providerName} • {referral.practiceName}</p>
                            </div>
                            <Badge variant={referral.urgency === "urgent" ? "destructive" : "secondary"} className="text-xs">
                              {referral.urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline" className="capitalize text-xs">{referral.woundType}</Badge>
                            <Select 
                              value={referral.status} 
                              onValueChange={(value) => updateReferralStatus(referral.id, value as ProviderReferralSubmission["status"])}
                            >
                              <SelectTrigger className="w-28 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex gap-2">
                            {referral.status !== "scheduled" && referral.status !== "completed" && (
                              <Button variant="default" size="sm" onClick={() => openScheduleDialog("referral", referral)} className="flex-1 text-xs">
                                <CalendarDays className="h-3 w-3 mr-1" /> Schedule
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => openEmailDialog("referral", referral)} className="flex-1 text-xs">
                              <Send className="h-3 w-3 mr-1" /> {referral.emailSent ? "Resend" : "Email"}
                            </Button>
                          </div>
                        </Card>
                      ))}
                      {referrals.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No provider referrals yet</p>
                      )}
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Provider</TableHead>
                            <TableHead>Wound Type</TableHead>
                            <TableHead>Urgency</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referrals.map(referral => (
                            <TableRow key={referral.id}>
                              <TableCell className="font-medium">{referral.patientFirstName} {referral.patientLastName}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{referral.providerName}</div>
                                  <div className="text-muted-foreground">{referral.practiceName}</div>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{referral.woundType}</TableCell>
                              <TableCell>
                                <Badge variant={referral.urgency === "urgent" ? "destructive" : "secondary"}>{referral.urgency}</Badge>
                              </TableCell>
                              <TableCell>
                                <Select 
                                  value={referral.status} 
                                  onValueChange={(value) => updateReferralStatus(referral.id, value as ProviderReferralSubmission["status"])}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="contacted">Contacted</SelectItem>
                                    <SelectItem value="scheduled">Scheduled</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                {referral.status !== "scheduled" && referral.status !== "completed" && (
                                  <Button variant="default" size="sm" onClick={() => openScheduleDialog("referral", referral)} className="gap-1">
                                    <CalendarDays className="h-3 w-3" /> Schedule
                                  </Button>
                                )}
                                <Button variant="outline" size="sm" onClick={() => openEmailDialog("referral", referral)} className="gap-1">
                                  <Send className="h-3 w-3" /> {referral.emailSent ? "Resend" : "Email"}
                                </Button>
                                {referral.emailSent && <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-1" />}
                              </TableCell>
                            </TableRow>
                          ))}
                          {referrals.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No provider referrals yet</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              )}

              {/* Appointments Section */}
              {activeSection === "appointments" && (
                <AppointmentScheduler 
                  visitRequests={visitRequests}
                  referrals={referrals}
                  onUpdateVisitStatus={updateVisitStatus}
                  onUpdateReferralStatus={updateReferralStatus}
                  externalAppointments={allAppointments}
                  onAppointmentsChange={handleAppointmentsChange}
                />
              )}

              {/* Forms Section */}
              {activeSection === "forms" && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                    <h2 className="text-lg md:text-xl font-semibold">Form Configuration</h2>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                      <Select value={selectedFormId} onValueChange={setSelectedFormId}>
                        <SelectTrigger className="w-full sm:w-56">
                          <SelectValue placeholder="Select a form" />
                        </SelectTrigger>
                        <SelectContent>
                          {formConfigs.map(form => (
                            <SelectItem key={form.id} value={form.id}>{form.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button onClick={handleAddNewField} size="sm" className="flex-1 sm:flex-none">
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handleSaveFormConfig} className="flex-1 sm:flex-none">
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>

                  {selectedForm && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Configure fields for "{selectedForm.name}". Toggle fields on/off or edit their properties.
                      </p>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Label</TableHead>
                            <TableHead>Key</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-center">Required</TableHead>
                            <TableHead className="text-center">Enabled</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedForm.fields.sort((a, b) => a.order - b.order).map(field => (
                            <TableRow key={field.id} className={!field.enabled ? "opacity-50" : ""}>
                              <TableCell className="font-medium">{field.label}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{field.key}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{field.type}</Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch 
                                  checked={field.required}
                                  onCheckedChange={() => handleToggleFieldRequired(field.id)}
                                  disabled={!field.enabled}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <Switch 
                                  checked={field.enabled}
                                  onCheckedChange={() => handleToggleFieldEnabled(field.id)}
                                />
                              </TableCell>
                              <TableCell className="text-right space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingField({ ...field });
                                    setIsFieldDialogOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteField(field.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Edit Field: {editingField?.label}</DialogTitle>
                          </DialogHeader>
                          {editingField && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="fieldLabel">Label</Label>
                                  <Input 
                                    id="fieldLabel"
                                    value={editingField.label}
                                    onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="fieldKey">Field Key</Label>
                                  <Input 
                                    id="fieldKey"
                                    value={editingField.key}
                                    onChange={(e) => setEditingField({ ...editingField, key: e.target.value })}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="fieldType">Type</Label>
                                  <Select 
                                    value={editingField.type} 
                                    onValueChange={(value) => setEditingField({ ...editingField, type: value as FormFieldConfig["type"] })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="email">Email</SelectItem>
                                      <SelectItem value="tel">Phone</SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="select">Select/Dropdown</SelectItem>
                                      <SelectItem value="textarea">Text Area</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="fieldPlaceholder">Placeholder</Label>
                                  <Input 
                                    id="fieldPlaceholder"
                                    value={editingField.placeholder || ""}
                                    onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                                  />
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="fieldHelpText">Help Text (optional)</Label>
                                <Input 
                                  id="fieldHelpText"
                                  value={editingField.helpText || ""}
                                  onChange={(e) => setEditingField({ ...editingField, helpText: e.target.value })}
                                  placeholder="Additional context for this field"
                                />
                              </div>

                              <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    id="fieldRequired"
                                    checked={editingField.required}
                                    onCheckedChange={(checked) => setEditingField({ ...editingField, required: checked })}
                                  />
                                  <Label htmlFor="fieldRequired">Required</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Switch 
                                    id="fieldEnabled"
                                    checked={editingField.enabled}
                                    onCheckedChange={(checked) => setEditingField({ ...editingField, enabled: checked })}
                                  />
                                  <Label htmlFor="fieldEnabled">Enabled</Label>
                                </div>
                              </div>

                              {editingField.type === "select" && (
                                <div className="space-y-3">
                                  <Label>Options</Label>
                                  <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                                    {editingField.options?.map((option, index) => (
                                      <div key={index} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded">
                                        <div>
                                          <span className="font-medium">{option.label}</span>
                                          <span className="text-xs text-muted-foreground ml-2">({option.value})</span>
                                        </div>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => handleRemoveFieldOption(index)}
                                        >
                                          <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                      </div>
                                    ))}
                                    {(!editingField.options || editingField.options.length === 0) && (
                                      <p className="text-sm text-muted-foreground text-center py-2">No options defined</p>
                                    )}
                                  </div>
                                  <div className="flex gap-2">
                                    <Input 
                                      placeholder="Label"
                                      value={newOptionLabel}
                                      onChange={(e) => setNewOptionLabel(e.target.value)}
                                      className="flex-1"
                                    />
                                    <Input 
                                      placeholder="Value"
                                      value={newOptionValue}
                                      onChange={(e) => setNewOptionValue(e.target.value)}
                                      className="flex-1"
                                    />
                                    <Button 
                                      variant="outline" 
                                      onClick={handleAddFieldOption}
                                      disabled={!newOptionLabel || !newOptionValue}
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsFieldDialogOpen(false)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleSaveFieldEdit}>
                                  Save Field
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </>
                  )}
                </div>
              )}

              {/* Site Copy Section */}
              {activeSection === "site-copy" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Site Copy Management</h2>
                    <Select value={selectedCopyPage} onValueChange={setSelectedCopyPage}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by page" />
                      </SelectTrigger>
                      <SelectContent>
                        {uniquePages.map(page => (
                          <SelectItem key={page} value={page}>
                            {page === "all" ? "All Pages" : page}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Edit the text content displayed across your website. Changes will be reflected site-wide.
                  </p>

                  <div className="space-y-6">
                    {filteredCopySections.map(section => (
                      <Card key={section.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Badge variant="outline" className="mb-2">{section.page}</Badge>
                              <CardTitle className="text-lg">{section.section}</CardTitle>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveCopySection(section.id)}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {section.fields.map(field => (
                            <div key={field.key}>
                              <Label htmlFor={`${section.id}-${field.key}`}>{field.label}</Label>
                              {field.type === "image" ? (
                                <div className="mt-1 space-y-3">
                                  {field.value && (
                                    <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border bg-muted">
                                      <img 
                                        src={field.value} 
                                        alt={field.label}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex items-center gap-3">
                                    <label 
                                      htmlFor={`${section.id}-${field.key}`}
                                      className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 transition-colors text-sm font-medium"
                                    >
                                      <Image className="h-4 w-4" />
                                      {field.value ? "Change Image" : "Upload Image"}
                                    </label>
                                    <input
                                      type="file"
                                      id={`${section.id}-${field.key}`}
                                      accept="image/*"
                                      onChange={(e) => handleCopyImageUpload(section.id, field.key, e)}
                                      className="hidden"
                                    />
                                    {field.value && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleUpdateCopyField(section.id, field.key, "")}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ) : field.type === "textarea" ? (
                                <Textarea
                                  id={`${section.id}-${field.key}`}
                                  value={field.value}
                                  onChange={(e) => handleUpdateCopyField(section.id, field.key, e.target.value)}
                                  rows={3}
                                  className="mt-1"
                                />
                              ) : (
                                <Input
                                  id={`${section.id}-${field.key}`}
                                  value={field.value}
                                  onChange={(e) => handleUpdateCopyField(section.id, field.key, e.target.value)}
                                  className="mt-1"
                                />
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources Section */}
              {activeSection === "resources" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Patient Resources ({patientResources.length})</h2>
                    <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => { setEditingResource(null); setResourceIcon("FileText"); }}>
                          <Plus className="h-4 w-4 mr-2" /> Add Resource
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingResource ? "Edit Resource" : "New Resource"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveResource} className="space-y-4">
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" defaultValue={editingResource?.title} required />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={editingResource?.description} rows={3} required />
                          </div>
                          <div>
                            <Label htmlFor="type">Type</Label>
                            <Select name="type" defaultValue={editingResource?.type || "guide"}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="guide">Guide</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="checklist">Checklist</SelectItem>
                                <SelectItem value="faq">FAQ</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Icon</Label>
                            <IconPicker value={resourceIcon} onChange={setResourceIcon} name="icon" />
                          </div>
                          <div>
                            <Label>File Upload</Label>
                            <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                              <input
                                type="file"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="resource-file"
                              />
                              <label htmlFor="resource-file" className="cursor-pointer">
                                <div className="flex flex-col items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {resourceFile ? resourceFile.name : "Click to upload file"}
                                  </span>
                                </div>
                              </label>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="url">Or External URL</Label>
                            <Input id="url" name="url" defaultValue={editingResource?.url} placeholder="https://..." />
                          </div>
                          <Button type="submit" className="w-full">Save Resource</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientResources.map(resource => (
                        <TableRow key={resource.id}>
                          <TableCell className="font-medium">{resource.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{resource.type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {resource.fileName || resource.url || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingResource(resource); setResourceIcon(resource.icon || "FileText"); setIsResourceDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteResource(resource.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {/* Blog Section */}
              {activeSection === "blog" && (
                <>
                  {showAIGenerator ? (
                    <div className="space-y-4">
                      <Button variant="outline" onClick={() => setShowAIGenerator(false)}>
                        ← Back to Posts
                      </Button>
                      <AIArticleGenerator 
                        onSaveArticle={handleAISaveArticle}
                        editingArticle={null}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Blog Posts ({posts.length})</h2>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => setShowAIGenerator(true)}>
                            <Sparkles className="h-4 w-4 mr-2" /> AI Generate
                          </Button>
                          <Button onClick={() => navigate("/admin/blog/new?new=true")}>
                            <Plus className="h-4 w-4 mr-2" /> Add Post
                          </Button>
                        </div>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {posts.map(post => (
                            <TableRow key={post.id}>
                              <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                              <TableCell>{getStatusBadge(post.status)}</TableCell>
                              <TableCell>{post.category}</TableCell>
                              <TableCell>{post.author}</TableCell>
                              <TableCell>{post.date}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => navigate(`/admin/blog/${post.id}`)}
                                  title="Edit Post"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" title="Share Post">
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => handleSharePost(post, "linkedin")}>
                                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                      LinkedIn
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSharePost(post, "facebook")}>
                                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                      Facebook
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSharePost(post, "twitter")}>
                                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                      X (Twitter)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSharePost(post, "reddit")}>
                                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                                      Reddit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSharePost(post, "whatsapp")}>
                                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                      WhatsApp
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleSharePost(post, "email")}>
                                      <Mail className="h-4 w-4 mr-2" />
                                      Email / Newsletter
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleSharePost(post, "copy")}>
                                      <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                                      Copy Link
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </>
                  )}
                </>
              )}

              {/* Testimonials Section */}
              {activeSection === "testimonials" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Testimonials ({testimonials.length})</h2>
                    <Dialog open={isTestimonialDialogOpen} onOpenChange={setIsTestimonialDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingTestimonial(null)}>
                          <Plus className="h-4 w-4 mr-2" /> Add Testimonial
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveTestimonial} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={editingTestimonial?.name} required />
                          </div>
                          <div>
                            <Label htmlFor="role">Role</Label>
                            <Input id="role" name="role" defaultValue={editingTestimonial?.role} placeholder="Patient, Caregiver, etc." required />
                          </div>
                          <div>
                            <Label htmlFor="content">Testimonial</Label>
                            <Textarea id="content" name="content" defaultValue={editingTestimonial?.content} rows={4} required />
                          </div>
                          <div>
                            <Label htmlFor="rating">Rating (1-5)</Label>
                            <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue={editingTestimonial?.rating || 5} required />
                          </div>
                          <Button type="submit" className="w-full">Save Testimonial</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testimonials.map(testimonial => (
                        <TableRow key={testimonial.id}>
                          <TableCell className="font-medium">{testimonial.name}</TableCell>
                          <TableCell>{testimonial.role}</TableCell>
                          <TableCell>{"⭐".repeat(testimonial.rating)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingTestimonial(testimonial); setIsTestimonialDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {/* Services Section */}
              {activeSection === "services" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Services ({services.length})</h2>
                    <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => { setEditingService(null); setServiceIcon("Heart"); }}>
                          <Plus className="h-4 w-4 mr-2" /> Add Service
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingService ? "Edit Service" : "New Service"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveService} className="space-y-4">
                          <div>
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" name="title" defaultValue={editingService?.title} required />
                          </div>
                          <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" defaultValue={editingService?.description} rows={3} required />
                          </div>
                          <div>
                            <Label>Icon</Label>
                            <IconPicker value={serviceIcon} onChange={setServiceIcon} name="icon" />
                          </div>
                          <Button type="submit" className="w-full">Save Service</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Icon</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map(service => (
                        <TableRow key={service.id}>
                          <TableCell className="font-medium">{service.title}</TableCell>
                          <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                          <TableCell>{service.icon}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingService(service); setServiceIcon(service.icon || "Heart"); setIsServiceDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteService(service.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {/* Team Section */}
              {activeSection === "team" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Team Members ({team.length})</h2>
                    <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingTeamMember(null)}>
                          <Plus className="h-4 w-4 mr-2" /> Add Team Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingTeamMember ? "Edit Team Member" : "New Team Member"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveTeamMember} className="space-y-4">
                          <div>
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={editingTeamMember?.name} required />
                          </div>
                          <div>
                            <Label htmlFor="role">Role/Title</Label>
                            <Input id="role" name="role" defaultValue={editingTeamMember?.role} required />
                          </div>
                          <div>
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea id="bio" name="bio" defaultValue={editingTeamMember?.bio} rows={3} required />
                          </div>
                          <div>
                            <Label>Profile Image</Label>
                            <div className="mt-2 space-y-3">
                              {(teamMemberImagePreview || editingTeamMember?.image) && (
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={teamMemberImagePreview || editingTeamMember?.image} 
                                    alt="Profile preview" 
                                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                                  />
                                  <span className="text-sm text-muted-foreground">Current image</span>
                                </div>
                              )}
                              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleTeamMemberImageUpload}
                                  className="hidden"
                                  id="team-member-image"
                                />
                                <label htmlFor="team-member-image" className="cursor-pointer">
                                  <div className="flex flex-col items-center gap-2">
                                    <div className="p-2 bg-muted rounded-full">
                                      <User className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                      {teamMemberImage ? teamMemberImage.name : "Click to upload profile image"}
                                    </span>
                                    <span className="text-xs text-muted-foreground">PNG, JPG up to 5MB</span>
                                  </div>
                                </label>
                              </div>
                            </div>
                          </div>
                          <Button type="submit" className="w-full">Save Team Member</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Bio</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.map(member => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">{member.name}</TableCell>
                          <TableCell>{member.role}</TableCell>
                          <TableCell className="max-w-xs truncate">{member.bio}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingTeamMember(member); setIsTeamDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTeamMember(member.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              {/* FAQs Section */}
              {activeSection === "faqs" && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">FAQs ({faqs.length})</h2>
                    <Dialog open={isFaqDialogOpen} onOpenChange={setIsFaqDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => setEditingFaq(null)}>
                          <Plus className="h-4 w-4 mr-2" /> Add FAQ
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingFaq ? "Edit FAQ" : "New FAQ"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveFaq} className="space-y-4">
                          <div>
                            <Label htmlFor="question">Question</Label>
                            <Input id="question" name="question" defaultValue={editingFaq?.question} required />
                          </div>
                          <div>
                            <Label htmlFor="answer">Answer</Label>
                            <Textarea id="answer" name="answer" defaultValue={editingFaq?.answer} rows={4} required />
                          </div>
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" name="category" defaultValue={editingFaq?.category} placeholder="Services, Insurance, etc." required />
                          </div>
                          <Button type="submit" className="w-full">Save FAQ</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {faqs.map(faq => (
                        <TableRow key={faq.id}>
                          <TableCell className="font-medium max-w-md truncate">{faq.question}</TableCell>
                          <TableCell>{faq.category}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingFaq(faq); setIsFaqDialogOpen(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteFaq(faq.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              <p className="text-sm text-muted-foreground mt-8 text-center">
                Note: Changes are stored in memory only. For persistent storage, enable Lovable Cloud.
              </p>
            </main>
          </ScrollArea>
        </div>
      </div>

      {/* Schedule Dialog */}
      <ScheduleDialog 
        open={isScheduleDialogOpen}
        onOpenChange={setIsScheduleDialogOpen}
        initialData={scheduleInitialData}
        onSchedule={handleInlineSchedule}
        existingAppointments={allAppointments}
      />

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Send Confirmation Email
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Recipient</Label>
              <Input 
                value={emailRecipient?.type === "visit" 
                  ? (emailRecipient.data as VisitRequest).email 
                  : (emailRecipient?.data as ProviderReferralSubmission)?.providerEmail || ""} 
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
                rows={10}
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

    </>
  );
};

export default Admin;

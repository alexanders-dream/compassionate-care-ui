import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Pencil, Trash2, FileText, Users, Star, HelpCircle, Briefcase, 
  Sparkles, Mail, Send, ClipboardList, BookOpen, CheckCircle2, CalendarDays,
  Upload, Download, File, User, Type
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blogPosts, BlogPost, categories } from "@/data/blogPosts";
import { 
  defaultTestimonials, defaultServices, defaultTeamMembers, defaultFAQs,
  defaultPatientResources, sampleVisitRequests, sampleReferrals,
  Testimonial, Service, TeamMember, FAQ, PatientResource, 
  VisitRequest, ProviderReferralSubmission 
} from "@/data/siteContent";
import AIArticleGenerator, { ArticleMedia } from "@/components/admin/AIArticleGenerator";
import AppointmentScheduler, { ScheduleDialog, AppointmentFormData } from "@/components/admin/AppointmentScheduler";
import { Appointment } from "@/data/siteContent";
import IconPicker from "@/components/admin/IconPicker";
import { defaultSiteCopy, SiteCopySection } from "@/data/siteCopy";

interface ExtendedBlogPost extends BlogPost {
  status?: "draft" | "published" | "scheduled";
  scheduledDate?: string;
  media?: ArticleMedia[];
}

const Admin = () => {
  const { toast } = useToast();
  
  // State for all content types
  const [posts, setPosts] = useState<ExtendedBlogPost[]>(blogPosts.map(p => ({ ...p, status: "published" as const })));
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [services, setServices] = useState<Service[]>(defaultServices);
  const [team, setTeam] = useState<TeamMember[]>(defaultTeamMembers);
  const [faqs, setFaqs] = useState<FAQ[]>(defaultFAQs);
  const [patientResources, setPatientResources] = useState<PatientResource[]>(defaultPatientResources);
  const [visitRequests, setVisitRequests] = useState<VisitRequest[]>(sampleVisitRequests);
  const [referrals, setReferrals] = useState<ProviderReferralSubmission[]>(sampleReferrals);
  const [siteCopy, setSiteCopy] = useState<SiteCopySection[]>(defaultSiteCopy);
  const [selectedCopyPage, setSelectedCopyPage] = useState<string>("all");

  // Dialog states
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingResource, setEditingResource] = useState<PatientResource | null>(null);

  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
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

  const categoryOptions = categories.filter(c => c.id !== "all");

  // Blog Post handlers
  const handleSavePost = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const postData: ExtendedBlogPost = {
      id: editingPost?.id || String(formData.get("slug")) || String(Date.now()),
      title: String(formData.get("title")),
      excerpt: String(formData.get("excerpt")),
      content: String(formData.get("content")),
      category: String(formData.get("category")) as BlogPost["category"],
      author: String(formData.get("author")),
      date: String(formData.get("date")),
      readTime: String(formData.get("readTime")),
      image: String(formData.get("image")) || undefined,
      status: "published"
    };

    if (editingPost) {
      setPosts(posts.map(p => p.id === editingPost.id ? { ...postData, status: p.status } : p));
      toast({ title: "Post updated successfully" });
    } else {
      setPosts([...posts, postData]);
      toast({ title: "Post created successfully" });
    }
    setIsPostDialogOpen(false);
    setEditingPost(null);
  };

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
  const [teamMemberImage, setTeamMemberImage] = useState<File | null>(null);
  const [teamMemberImagePreview, setTeamMemberImagePreview] = useState<string | null>(null);

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
  const [resourceFile, setResourceFile] = useState<File | null>(null);

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
    
    // Update the email sent status
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
        // Submission context data
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
        // Submission context data
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
    
    // Update linked submission status
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

  const uniquePages = ["all", ...new Set(siteCopy.map(s => s.page))];
  const filteredCopySections = selectedCopyPage === "all" 
    ? siteCopy 
    : siteCopy.filter(s => s.page === selectedCopyPage);

  return (
    <Layout>
      <Helmet>
        <title>Admin Dashboard | AR Advanced Woundcare Solutions</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all website content</p>
        </div>
      </section>

      <section className="py-8">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="pt-6">
              <Tabs defaultValue="submissions" className="w-full">
                <TabsList className="grid w-full grid-cols-5 md:grid-cols-9 mb-6">
                  <TabsTrigger value="submissions" className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    <span className="hidden sm:inline">Submissions</span>
                  </TabsTrigger>
                  <TabsTrigger value="appointments" className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    <span className="hidden sm:inline">Appointments</span>
                  </TabsTrigger>
                  <TabsTrigger value="site-copy" className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    <span className="hidden sm:inline">Site Copy</span>
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Resources</span>
                  </TabsTrigger>
                  <TabsTrigger value="blog" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Blog</span>
                  </TabsTrigger>
                  <TabsTrigger value="testimonials" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span className="hidden sm:inline">Testimonials</span>
                  </TabsTrigger>
                  <TabsTrigger value="services" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Services</span>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Team</span>
                  </TabsTrigger>
                  <TabsTrigger value="faqs" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">FAQs</span>
                  </TabsTrigger>
                </TabsList>

                {/* Form Submissions Tab */}
                <TabsContent value="submissions">
                  <div className="space-y-8">
                    {/* Visit Requests */}
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" />
                        Visit Requests ({visitRequests.length})
                      </h2>
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
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    onClick={() => openScheduleDialog("visit", request)}
                                    className="gap-1"
                                  >
                                    <CalendarDays className="h-3 w-3" />
                                    Schedule
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openEmailDialog("visit", request)}
                                  className="gap-1"
                                >
                                  <Send className="h-3 w-3" />
                                  {request.emailSent ? "Resend" : "Email"}
                                </Button>
                                {request.emailSent && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-1" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          {visitRequests.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                No visit requests yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Provider Referrals */}
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Provider Referrals ({referrals.length})
                      </h2>
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
                              <TableCell className="font-medium">
                                {referral.patientFirstName} {referral.patientLastName}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{referral.providerName}</div>
                                  <div className="text-muted-foreground">{referral.practiceName}</div>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">{referral.woundType}</TableCell>
                              <TableCell>
                                <Badge variant={referral.urgency === "urgent" ? "destructive" : "secondary"}>
                                  {referral.urgency}
                                </Badge>
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
                                  <Button 
                                    variant="default" 
                                    size="sm" 
                                    onClick={() => openScheduleDialog("referral", referral)}
                                    className="gap-1"
                                  >
                                    <CalendarDays className="h-3 w-3" />
                                    Schedule
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openEmailDialog("referral", referral)}
                                  className="gap-1"
                                >
                                  <Send className="h-3 w-3" />
                                  {referral.emailSent ? "Resend" : "Email"}
                                </Button>
                                {referral.emailSent && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 inline ml-1" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          {referrals.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                No provider referrals yet
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Inline Scheduling Dialog */}
                  <ScheduleDialog 
                    open={isScheduleDialogOpen}
                    onOpenChange={setIsScheduleDialogOpen}
                    initialData={scheduleInitialData}
                    onSchedule={handleInlineSchedule}
                    existingAppointments={allAppointments}
                  />
                </TabsContent>

                {/* Appointments Tab */}
                <TabsContent value="appointments">
                  <AppointmentScheduler 
                    visitRequests={visitRequests}
                    referrals={referrals}
                    onUpdateVisitStatus={updateVisitStatus}
                    onUpdateReferralStatus={updateReferralStatus}
                    externalAppointments={allAppointments}
                    onAppointmentsChange={handleAppointmentsChange}
                  />
                </TabsContent>

                {/* Site Copy Tab */}
                <TabsContent value="site-copy">
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
                                {field.type === "textarea" ? (
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
                </TabsContent>

                {/* Patient Resources Tab */}
                <TabsContent value="resources">
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
                            <Select name="type" defaultValue={editingResource?.type || "PDF Guide"}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PDF Guide">PDF Guide</SelectItem>
                                <SelectItem value="Educational Article">Educational Article</SelectItem>
                                <SelectItem value="Video Tutorial">Video Tutorial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Icon</Label>
                            <IconPicker value={resourceIcon} onChange={setResourceIcon} name="icon" />
                          </div>
                          <div className="space-y-2">
                            <Label>Upload File</Label>
                            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                              <input
                                type="file"
                                id="resourceFile"
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.mp4,.webm"
                              />
                              <label htmlFor="resourceFile" className="cursor-pointer">
                                <div className="flex flex-col items-center gap-2">
                                  <Upload className="h-8 w-8 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    Click to upload or drag and drop
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    PDF, DOC, DOCX, MP4, WEBM
                                  </span>
                                </div>
                              </label>
                              {(resourceFile || editingResource?.fileName) && (
                                <div className="mt-3 p-2 bg-muted rounded flex items-center gap-2">
                                  <File className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    {resourceFile?.name || editingResource?.fileName}
                                  </span>
                                  {(resourceFile || editingResource?.fileSize) && (
                                    <span className="text-xs text-muted-foreground">
                                      ({resourceFile ? formatFileSize(resourceFile.size) : editingResource?.fileSize})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="url">External URL (optional - if no file uploaded)</Label>
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
                        <TableHead>Description</TableHead>
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
                          <TableCell>
                            {resource.fileName ? (
                              <div className="flex items-center gap-1">
                                <File className="h-4 w-4 text-primary" />
                                <span className="text-sm">{resource.fileName}</span>
                                <span className="text-xs text-muted-foreground">({resource.fileSize})</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">External URL</span>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{resource.description}</TableCell>
                          <TableCell className="text-right">
                            {resource.fileName && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => toast({ title: `Simulated download: ${resource.fileName}` })}
                              >
                                <Download className="h-4 w-4 text-primary" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => { setEditingResource(resource); setResourceFile(null); setResourceIcon(resource.icon || "FileText"); setIsResourceDialogOpen(true); }}>
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
                </TabsContent>

                {/* Blog Posts Tab */}
                <TabsContent value="blog">
                  {showAIGenerator ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-primary" />
                          AI Article Generator
                        </h2>
                        <Button variant="outline" onClick={() => setShowAIGenerator(false)}>
                          Back to Posts
                        </Button>
                      </div>
                      <AIArticleGenerator 
                        onSaveArticle={handleAISaveArticle} 
                        editingArticle={editingPost}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Blog Posts ({posts.length})</h2>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => { setEditingPost(null); setShowAIGenerator(true); }}
                            className="border-primary text-primary hover:bg-primary/10"
                          >
                            <Sparkles className="h-4 w-4 mr-2" /> AI Generate
                          </Button>
                          <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                            <DialogTrigger asChild>
                              <Button onClick={() => setEditingPost(null)}>
                                <Plus className="h-4 w-4 mr-2" /> Add Post
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{editingPost ? "Edit Post" : "New Post"}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSavePost} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input id="title" name="title" defaultValue={editingPost?.title} required />
                                  </div>
                                  <div>
                                    <Label htmlFor="slug">Slug (URL ID)</Label>
                                    <Input id="slug" name="slug" defaultValue={editingPost?.id} required />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="excerpt">Excerpt</Label>
                                  <Textarea id="excerpt" name="excerpt" defaultValue={editingPost?.excerpt} required />
                                </div>
                                <div>
                                  <Label htmlFor="content">Content</Label>
                                  <Textarea id="content" name="content" defaultValue={editingPost?.content} rows={6} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select name="category" defaultValue={editingPost?.category || "guides"}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categoryOptions.map(cat => (
                                          <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label htmlFor="author">Author</Label>
                                    <Input id="author" name="author" defaultValue={editingPost?.author} required />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="date">Date</Label>
                                    <Input id="date" name="date" type="date" defaultValue={editingPost?.date} required />
                                  </div>
                                  <div>
                                    <Label htmlFor="readTime">Read Time</Label>
                                    <Input id="readTime" name="readTime" defaultValue={editingPost?.readTime} placeholder="5 min read" required />
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="image">Image URL</Label>
                                  <Input id="image" name="image" defaultValue={editingPost?.image} placeholder="/placeholder.svg" />
                                </div>
                                <Button type="submit" className="w-full">Save Post</Button>
                              </form>
                            </DialogContent>
                          </Dialog>
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
                                  onClick={() => { setEditingPost(post); setShowAIGenerator(true); }}
                                  title="Edit with AI"
                                >
                                  <Sparkles className="h-4 w-4 text-primary" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => { setEditingPost(post); setIsPostDialogOpen(true); }}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
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
                </TabsContent>

                {/* Testimonials Tab */}
                <TabsContent value="testimonials">
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
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services">
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
                </TabsContent>

                {/* Team Tab */}
                <TabsContent value="team">
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
                </TabsContent>

                {/* FAQs Tab */}
                <TabsContent value="faqs">
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground mt-4 text-center">
            Note: Changes are stored in memory only. For persistent storage, enable Lovable Cloud.
          </p>
        </div>
      </section>

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
    </Layout>
  );
};

export default Admin;
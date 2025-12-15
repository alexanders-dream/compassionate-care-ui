import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blogPosts, BlogPost } from "@/data/blogPosts";
import {
  Testimonial, Service, TeamMember, FAQ, PatientResource,
  VisitRequest, ProviderReferralSubmission
} from "@/data/siteContent";
import { ArticleMedia } from "@/components/admin/AIArticleGenerator";
import { ScheduleDialog, AppointmentFormData } from "@/components/admin/AppointmentScheduler";
import { Appointment } from "@/data/siteContent";
import { defaultSiteCopy, SiteCopySection } from "@/data/siteCopy";
import AdminSidebar, { AdminSection } from "@/components/admin/AdminSidebar";
import { useSiteData } from "@/contexts/SiteDataContext";

// Tab Components
import VisitRequestsTab from "@/components/admin/tabs/VisitRequestsTab";
import ReferralsTab from "@/components/admin/tabs/ReferralsTab";
import FormsTab from "@/components/admin/tabs/FormsTab";
import SiteCopyTab from "@/components/admin/tabs/SiteCopyTab";
import ResourcesTab from "@/components/admin/tabs/ResourcesTab";
import BlogTab, { ExtendedBlogPost } from "@/components/admin/tabs/BlogTab";
import TestimonialsTab from "@/components/admin/tabs/TestimonialsTab";
import ServicesTab from "@/components/admin/tabs/ServicesTab";
import TeamTab from "@/components/admin/tabs/TeamTab";
import FaqsTab from "@/components/admin/tabs/FaqsTab";
import AppointmentsTab from "@/components/admin/tabs/AppointmentsTab";

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
    visitRequests, setVisitRequests,
    referrals, setReferrals,
    formConfigs, setFormConfigs
  } = useSiteData();

  // State for content types not in context
  const [posts, setPosts] = useState<ExtendedBlogPost[]>(blogPosts.map(p => ({ ...p, status: "published" as const })));
  const [siteCopy, setSiteCopy] = useState<SiteCopySection[]>(defaultSiteCopy);

  const [activeSection, setActiveSection] = useState<AdminSection>(() => {
    const tab = searchParams.get("tab");
    return (tab as AdminSection) || "submissions";
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Admin user info (in a real app, this would come from auth context)
  const adminFirstName = "Jayne";

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return "Good morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  // Sync activeSection with URL tab param
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeSection) {
      setActiveSection(tab as AdminSection);
    }
  }, [searchParams, activeSection]);

  // Editing states
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [editingResource, setEditingResource] = useState<PatientResource | null>(null);

  // Dialog states
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

  // Blog handlers
  const handleAISaveArticle = (article: ExtendedBlogPost) => {
    const existingIndex = posts.findIndex(p => p.id === article.id);
    if (existingIndex >= 0) {
      setPosts(posts.map(p => p.id === article.id ? article : p));
    } else {
      setPosts([article, ...posts]);
    }
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

  // Testimonial handlers
  const handleSaveTestimonial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const testimonialData: Testimonial = {
      id: editingTestimonial?.id || String(Date.now()),
      name: String(formData.get("name")),
      role: String(formData.get("role")) || null,
      quote: String(formData.get("content")),
      rating: Number(formData.get("rating")),
      is_featured: false
    };

    if (editingTestimonial) {
      setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? testimonialData : t));
      toast({ title: "Testimonial updated successfully" });
    } else {
      setTestimonials([...testimonials, testimonialData]);
      toast({ title: "Testimonial created successfully" });
    }
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
      icon: serviceIcon,
      display_order: editingService?.display_order || services.length
    };

    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? serviceData : s));
      toast({ title: "Service updated successfully" });
    } else {
      setServices([...services, serviceData]);
      toast({ title: "Service created successfully" });
    }
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
      bio: String(formData.get("bio")) || null,
      image_url: teamMemberImagePreview || editingTeamMember?.image_url || null,
      display_order: editingTeamMember?.display_order || team.length
    };

    if (editingTeamMember) {
      setTeam(team.map(m => m.id === editingTeamMember.id ? memberData : m));
      toast({ title: "Team member updated successfully" });
    } else {
      setTeam([...team, memberData]);
      toast({ title: "Team member added successfully" });
    }
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
      category: String(formData.get("category")),
      display_order: editingFaq?.display_order || faqs.length
    };

    if (editingFaq) {
      setFaqs(faqs.map(f => f.id === editingFaq.id ? faqData : f));
      toast({ title: "FAQ updated successfully" });
    } else {
      setFaqs([...faqs, faqData]);
      toast({ title: "FAQ created successfully" });
    }
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
      icon: resourceIcon,
      file_url: resourceFile ? `/downloads/${resourceFile.name}` : (String(formData.get("url")) || null),
      file_name: resourceFile?.name || editingResource?.file_name || null,
      file_size: resourceFile ? formatFileSize(resourceFile.size) : editingResource?.file_size || null,
      download_count: editingResource?.download_count || 0
    };

    if (editingResource) {
      setPatientResources(patientResources.map(r => r.id === editingResource.id ? resourceData : r));
      toast({ title: "Resource updated successfully" });
    } else {
      setPatientResources([...patientResources, resourceData]);
      toast({ title: "Resource created successfully" });
    }
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
            <h1 className="text-xl md:text-3xl font-bold text-primary">{getGreeting()}, {adminFirstName}</h1>
            <p className="text-muted-foreground text-xs md:text-sm mt-1">Welcome to your Admin Dashboard</p>
          </header>

          <ScrollArea className="flex-1">
            <main className="p-3 md:p-6">
              {/* Submissions Section */}
              {activeSection === "submissions" && (
                <div className="space-y-6 md:space-y-8">
                  <VisitRequestsTab
                    visitRequests={visitRequests}
                    onUpdateStatus={updateVisitStatus}
                    onSchedule={(req) => openScheduleDialog("visit", req)}
                    onEmail={(req) => openEmailDialog("visit", req)}
                  />

                  <div className="border-t border-border my-8" />

                  <ReferralsTab
                    referrals={referrals}
                    onUpdateStatus={updateReferralStatus}
                    onSchedule={(ref) => openScheduleDialog("referral", ref)}
                    onEmail={(ref) => openEmailDialog("referral", ref)}
                  />
                </div>
              )}

              {/* Appointments Section */}
              {activeSection === "appointments" && (
                <AppointmentsTab
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
                <FormsTab />
              )}

              {/* Site Copy Section */}
              {activeSection === "site-copy" && (
                <SiteCopyTab
                  siteCopy={siteCopy}
                  onUpdateField={handleUpdateCopyField}
                  onSaveSection={handleSaveCopySection}
                  onImageUpload={handleCopyImageUpload}
                />
              )}

              {/* Resources Section */}
              {activeSection === "resources" && (
                <ResourcesTab
                  resources={patientResources}
                  onSave={handleSaveResource}
                  onDelete={handleDeleteResource}
                  editingResource={editingResource}
                  setEditingResource={setEditingResource}
                  resourceIcon={resourceIcon}
                  setResourceIcon={setResourceIcon}
                  resourceFile={resourceFile}
                  onFileUpload={handleFileUpload}
                />
              )}

              {/* Blog Section */}
              {activeSection === "blog" && (
                <BlogTab
                  posts={posts}
                  onSaveArticle={handleAISaveArticle}
                  onDeletePost={handleDeletePost}
                  onSharePost={handleSharePost}
                />
              )}

              {/* Testimonials Section */}
              {activeSection === "testimonials" && (
                <TestimonialsTab
                  testimonials={testimonials}
                  onSave={handleSaveTestimonial}
                  onDelete={handleDeleteTestimonial}
                  editingTestimonial={editingTestimonial}
                  setEditingTestimonial={setEditingTestimonial}
                />
              )}

              {/* Services Section */}
              {activeSection === "services" && (
                <ServicesTab
                  services={services}
                  onSave={handleSaveService}
                  onDelete={handleDeleteService}
                  editingService={editingService}
                  setEditingService={setEditingService}
                  serviceIcon={serviceIcon}
                  setServiceIcon={setServiceIcon}
                />
              )}

              {/* Team Section */}
              {activeSection === "team" && (
                <TeamTab
                  team={team}
                  onSave={handleSaveTeamMember}
                  onDelete={handleDeleteTeamMember}
                  editingTeamMember={editingTeamMember}
                  setEditingTeamMember={setEditingTeamMember}
                  teamMemberImage={teamMemberImage}
                  teamMemberImagePreview={teamMemberImagePreview}
                  onImageUpload={handleTeamMemberImageUpload}
                />
              )}

              {/* FAQs Section */}
              {activeSection === "faqs" && (
                <FaqsTab
                  faqs={faqs}
                  onSave={handleSaveFaq}
                  onDelete={handleDeleteFaq}
                  editingFaq={editingFaq}
                  setEditingFaq={setEditingFaq}
                />
              )}
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

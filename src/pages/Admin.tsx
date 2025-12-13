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
import { Plus, Pencil, Trash2, FileText, Users, Star, HelpCircle, Briefcase, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { blogPosts, BlogPost, categories } from "@/data/blogPosts";
import { 
  defaultTestimonials, defaultServices, defaultTeamMembers, defaultFAQs,
  Testimonial, Service, TeamMember, FAQ 
} from "@/data/siteContent";
import AIArticleGenerator, { ArticleMedia } from "@/components/admin/AIArticleGenerator";

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

  // Dialog states
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isTestimonialDialogOpen, setIsTestimonialDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isFaqDialogOpen, setIsFaqDialogOpen] = useState(false);

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
      icon: String(formData.get("icon"))
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
  };

  const handleDeleteService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
    toast({ title: "Service deleted" });
  };

  // Team Member handlers
  const handleSaveTeamMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const memberData: TeamMember = {
      id: editingTeamMember?.id || String(Date.now()),
      name: String(formData.get("name")),
      role: String(formData.get("role")),
      bio: String(formData.get("bio")),
      image: String(formData.get("image")) || undefined
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
              <Tabs defaultValue="blog" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-6">
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
                        <Button onClick={() => setEditingService(null)}>
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
                            <Label htmlFor="icon">Icon (Lucide icon name)</Label>
                            <Input id="icon" name="icon" defaultValue={editingService?.icon} placeholder="Heart, Home, Stethoscope..." required />
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
                            <Button variant="ghost" size="sm" onClick={() => { setEditingService(service); setIsServiceDialogOpen(true); }}>
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
                            <Label htmlFor="image">Image URL (optional)</Label>
                            <Input id="image" name="image" defaultValue={editingTeamMember?.image} />
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
    </Layout>
  );
};

export default Admin;

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, Pencil, Trash2, Sparkles, Share2, Mail, ArrowLeft, Star, Calendar as CalendarIcon, ArrowUpDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import RoleGate from "@/components/auth/RoleGate";
import AIArticleGenerator from "@/components/admin/AIArticleGenerator";
import AITextEditor from "@/components/admin/AITextEditor";
import { ArticleMedia } from "@/components/admin/AIArticleGenerator";
import { ScheduleDialog } from "@/components/admin/ScheduleDialog";
import { BlogPost, categories } from "@/data/blogPosts";
import AdminPagination from "../AdminPagination";

export interface ExtendedBlogPost extends BlogPost {
    status?: "draft" | "published" | "scheduled";
    scheduledDate?: string;
    media?: ArticleMedia[];
    is_featured?: boolean;
}

interface BlogTabProps {
    posts: ExtendedBlogPost[];
    onSaveArticle: (article: ExtendedBlogPost) => void;
    onDeletePost: (id: string) => void;
    onSharePost: (post: ExtendedBlogPost, platform: string) => void;
    onSetFeatured: (post: ExtendedBlogPost) => void;
}

const BlogTab = ({
    posts,
    onSaveArticle,
    onDeletePost,
    onSharePost,
    onSetFeatured,
}: BlogTabProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showAIGenerator, setShowAIGenerator] = useState(false);
    const [editingPost, setEditingPost] = useState<ExtendedBlogPost | null>(null);
    const [sortField, setSortField] = useState<"title" | "status" | "category" | "author" | "date">("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [sortField, sortDirection]);

    const toggleSort = (field: "title" | "status" | "category" | "author" | "date") => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Reset AI generator view when navigating to the blog tab
    useEffect(() => {
        if (location.pathname === "/admin/blog") {
            setShowAIGenerator(false);
            setEditingPost(null);
        }
    }, [location.pathname, location.key]);

    const getStatusBadge = (status?: string, post?: ExtendedBlogPost) => {
        switch (status) {
            case "draft":
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Draft</Badge>;
            case "scheduled":
                const badge = <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">Scheduled</Badge>;
                if (post && (post.scheduledAt || post.scheduledDate)) {
                    const dateStr = post.scheduledAt || post.scheduledDate;
                    return (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>{badge}</TooltipTrigger>
                                <TooltipContent>
                                    <p>Scheduled for: {new Date(dateStr!).toLocaleString()}</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                }
                return badge;
            default:
                return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Published</Badge>;
        }
    };

    const handleSaveArticle = async (article: ExtendedBlogPost) => {
        await onSaveArticle(article);
        setShowAIGenerator(false);
    };

    const handleSaveEditedArticle = async (article: ExtendedBlogPost & { status: "draft" | "published" | "scheduled"; scheduledAt?: string }) => {
        await onSaveArticle(article);
        setEditingPost(null);
    };

    const handleStatusChange = (post: ExtendedBlogPost, newStatus: "draft" | "published" | "scheduled", scheduledDate?: Date) => {
        const updatedPost = { ...post, status: newStatus };
        if (scheduledDate) {
            updatedPost.scheduledAt = scheduledDate.toISOString();
            updatedPost.scheduledDate = scheduledDate.toISOString();
        }
        onSaveArticle(updatedPost);
    };

    const sortedPosts = [...posts].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case "title":
                comparison = a.title.localeCompare(b.title);
                break;
            case "status":
                comparison = (a.status || "published").localeCompare(b.status || "published");
                break;
            case "category":
                comparison = a.category.localeCompare(b.category);
                break;
            case "author":
                comparison = a.author.localeCompare(b.author);
                break;
            case "date":
                comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
    });

    // Paginate the sorted posts
    const paginatedPosts = sortedPosts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            {editingPost ? (
                <AITextEditor
                    post={editingPost}
                    onSave={handleSaveEditedArticle}
                    onClose={() => setEditingPost(null)}
                />
            ) : showAIGenerator ? (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="flex-1">
                            <h2 className="text-lg md:text-xl font-semibold mb-2">AI Article Generator</h2>
                            <p className="text-sm text-muted-foreground">
                                Use AI to generate high-quality blog content. Configure your AI provider, select a topic, and let the AI create SEO-optimized articles for your blog. <span className="font-medium text-amber-600">AI can make mistakes—check responses before publishing.</span>
                            </p>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setShowAIGenerator(false)}
                                        className="shrink-0"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Back to Posts
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <AIArticleGenerator
                        onSaveArticle={handleSaveArticle}
                        editingArticle={null}
                    />
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                        <h2 className="text-lg md:text-xl font-semibold">Blog Posts ({posts.length})</h2>
                        <div className="flex gap-2">
                            <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                <Button variant="outline" size="sm" onClick={() => setShowAIGenerator(true)} className="flex-1 sm:flex-none">
                                    <Sparkles className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">AI Generate</span><span className="sm:hidden">AI</span>
                                </Button>
                                <Button size="sm" onClick={() => navigate("/admin/blog/new?new=true")} className="flex-1 sm:flex-none">
                                    <Plus className="h-4 w-4 mr-1 sm:mr-2" /> Add
                                </Button>
                            </RoleGate>
                        </div>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden space-y-4">
                        {paginatedPosts.map(post => (
                            <Card key={post.id} className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-medium text-sm line-clamp-2 flex-1 pr-2">{post.title}</p>
                                    <RoleGate
                                        allowedRoles={['admin', 'medical_staff']}
                                        fallback={<div className="scale-90 origin-right">{getStatusBadge(post.status, post)}</div>}
                                    >
                                        <Select
                                            defaultValue={post.status}
                                            onValueChange={(value) => handleStatusChange(post, value as "draft" | "published" | "scheduled")}
                                        >
                                            <SelectTrigger className="w-[110px] h-8">
                                                <SelectValue>
                                                    {getStatusBadge(post.status, post)}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </RoleGate>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                                    <Badge variant="outline" className="capitalize">{post.category}</Badge>
                                    <span>{post.author}</span>
                                    <span>•</span>
                                    <span>{post.date}</span>
                                </div>
                                <div className="flex gap-2">
                                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setEditingPost(post)}
                                        >
                                            <Pencil className="h-3 w-3 mr-1" /> Edit
                                        </Button>
                                    </RoleGate>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Share2 className="h-3 w-3" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => onSharePost(post, "linkedin")}>LinkedIn</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onSharePost(post, "facebook")}>Facebook</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onSharePost(post, "twitter")}>X (Twitter)</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onSharePost(post, "copy")}>Copy Link</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                        <Button variant="ghost" size="sm" onClick={() => onDeletePost(post.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </RoleGate>
                                </div>
                            </Card>
                        ))}
                        {posts.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No blog posts yet</p>
                        )}
                        {/* Mobile Pagination */}
                        <AdminPagination
                            currentPage={currentPage}
                            totalItems={sortedPosts.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50 hover:bg-muted/50">
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => toggleSort("title")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Title
                                            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => toggleSort("status")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Status
                                            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => toggleSort("category")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Category
                                            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => toggleSort("author")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Author
                                            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:bg-muted/50 select-none"
                                        onClick={() => toggleSort("date")}
                                    >
                                        <div className="flex items-center gap-1">
                                            Date
                                            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                    </TableHead>
                                    <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedPosts.map((post, index) => (
                                    <TableRow key={post.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                                        <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                                        <TableCell>
                                            <RoleGate
                                                allowedRoles={['admin', 'medical_staff']}
                                                fallback={getStatusBadge(post.status, post)}
                                            >
                                                <Select
                                                    defaultValue={post.status}
                                                    onValueChange={(value) => handleStatusChange(post, value as "draft" | "published" | "scheduled")}
                                                >
                                                    <SelectTrigger className="w-[110px] h-8 border-none bg-transparent hover:bg-muted p-0 shadow-none">
                                                        <SelectValue asChild>
                                                            {getStatusBadge(post.status, post)}
                                                        </SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="draft">Draft</SelectItem>
                                                        <SelectItem value="published">Published</SelectItem>
                                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </RoleGate>
                                        </TableCell>
                                        <TableCell>{post.category}</TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>{post.date}</TableCell>
                                        <TableCell className="text-right">
                                            <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onSetFeatured(post)}
                                                    title={post.is_featured ? "Featured Post" : "Set as Featured"}
                                                    className={post.is_featured ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50" : "text-muted-foreground hover:text-yellow-500"}
                                                >
                                                    <Star className={`h-4 w-4 ${post.is_featured ? "fill-current" : ""}`} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingPost(post)}
                                                    title="Edit Post"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </RoleGate>
                                            {(post.status === 'draft' || post.status === 'scheduled') && (
                                                <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                                    <ScheduleDialog
                                                        onSchedule={(date) => handleStatusChange(post, 'scheduled', date)}
                                                        initialDate={post.scheduledAt ? new Date(post.scheduledAt) : (post.scheduledDate ? new Date(post.scheduledDate) : undefined)}
                                                        trigger={
                                                            <Button variant="ghost" size="sm" title="Schedule Post">
                                                                <CalendarIcon className="h-4 w-4" />
                                                            </Button>
                                                        }
                                                    />
                                                </RoleGate>
                                            )}

                                            {post.status === 'published' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" title="Share Post">
                                                            <Share2 className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => onSharePost(post, "linkedin")}>
                                                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                                                            LinkedIn
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onSharePost(post, "facebook")}>
                                                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                                            Facebook
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onSharePost(post, "twitter")}>
                                                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                                            X (Twitter)
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onSharePost(post, "reddit")}>
                                                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>
                                                            Reddit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onSharePost(post, "whatsapp")}>
                                                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                                            WhatsApp
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => onSharePost(post, "email")}>
                                                            <Mail className="h-4 w-4 mr-2" />
                                                            Email / Newsletter
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onSharePost(post, "copy")}>
                                                            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                                            Copy Link
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                            <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                                <Button variant="ghost" size="sm" onClick={() => onDeletePost(post.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </RoleGate>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Desktop Pagination */}
                    <div className="hidden md:block">
                        <AdminPagination
                            currentPage={currentPage}
                            totalItems={sortedPosts.length}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default BlogTab;

import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { blogPosts, BlogPost } from "@/data/blogPosts";
import AITextEditor from "@/components/admin/AITextEditor";

interface ExtendedBlogPost extends BlogPost {
  status?: "draft" | "published" | "scheduled";
  scheduledDate?: string;
}

const BlogEditor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get("new") === "true";
  
  const [post, setPost] = useState<ExtendedBlogPost | null>(null);

  useEffect(() => {
    if (isNew) {
      // Create a new blank post
      setPost({
        id: `post-${Date.now()}`,
        title: "",
        excerpt: "",
        content: "",
        category: "prevention",
        author: "",
        date: new Date().toISOString().split("T")[0],
        readTime: "5 min read",
        status: "draft"
      });
    } else if (postId) {
      // Find existing post
      const existingPost = blogPosts.find(p => p.id === postId);
      if (existingPost) {
        setPost({ ...existingPost, status: "published" });
      } else {
        // Post not found, redirect back
        toast({ title: "Post not found", variant: "destructive" });
        navigate("/admin");
      }
    } else {
      navigate("/admin");
    }
  }, [postId, isNew, navigate, toast]);

  const handleSave = (updatedPost: ExtendedBlogPost & { status: "draft" | "published" | "scheduled" }) => {
    // In a real app, this would save to a database
    // For now, we just show success and navigate back
    toast({ 
      title: updatedPost.status === "published" ? "Post published!" : "Draft saved!" 
    });
    navigate("/admin");
  };

  const handleClose = () => {
    navigate("/admin");
  };

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.title || "New Post"} - Blog Editor | AR Advanced Woundcare Solutions</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AITextEditor
        post={post}
        onSave={handleSave}
        onClose={handleClose}
      />
    </>
  );
};

export default BlogEditor;

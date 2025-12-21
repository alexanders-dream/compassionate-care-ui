import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useToast } from "@/hooks/use-toast";
import { BlogPost } from "@/data/blogPosts";
import { useSiteData } from "@/contexts/SiteDataContext";
import AITextEditor from "@/components/admin/AITextEditor";
import { supabase } from "@/integrations/supabase/client";

interface ExtendedBlogPost extends BlogPost {
  status?: "draft" | "published" | "scheduled";
  scheduledDate?: string;
  scheduledAt?: string;
}

const BlogEditor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { postId } = useParams();
  const [searchParams] = useSearchParams();
  const isNew = searchParams.get("new") === "true";
  const { blogPosts, refreshBlogPosts } = useSiteData();

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
      // Find existing post from database
      const existingPost = blogPosts.find(p => p.id === postId);
      if (existingPost) {
        setPost({
          id: existingPost.id,
          title: existingPost.title,
          excerpt: existingPost.excerpt,
          content: existingPost.content,
          category: existingPost.category as any,
          author: existingPost.author,
          date: existingPost.publishedAt || new Date().toISOString().split("T")[0],
          readTime: existingPost.readTime || "5 min read",
          image: existingPost.imageUrl,
          status: existingPost.status as any || "draft"
        });
      } else {
        // Post not found, redirect back
        toast({ title: "Post not found", variant: "destructive" });
        navigate("/admin/blog");
      }
    } else {
      navigate("/admin/blog");
    }
  }, [postId, isNew, navigate, toast, blogPosts]);

  const handleSave = async (updatedPost: ExtendedBlogPost & { status: "draft" | "published" | "scheduled" }) => {
    try {
      const isTempId = updatedPost.id.startsWith("post-");

      const dbPayload: any = {
        title: updatedPost.title,
        excerpt: updatedPost.excerpt,
        content: updatedPost.content,
        category: updatedPost.category,
        author: updatedPost.author,
        read_time: updatedPost.readTime,
        image_url: updatedPost.image,
        status: updatedPost.status,
        slug: updatedPost.slug || updatedPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        scheduled_at: updatedPost.scheduledAt || updatedPost.scheduledDate || null, // Handle both potential property names
      };

      if (updatedPost.status === 'published') {
        if (post?.status !== 'published') {
          dbPayload.published_at = new Date().toISOString();
        }
      }

      let error;

      if (isTempId) {
        // Insert
        const { error: insertError } = await supabase
          .from("blog_posts")
          .insert(dbPayload);
        error = insertError;
      } else {
        // Update
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update(dbPayload)
          .eq("id", updatedPost.id);
        error = updateError;
      }

      if (error) throw error;

      await refreshBlogPosts();

      toast({
        title: updatedPost.status === "published" ? "Post published!" : "Draft saved!"
      });
      navigate("/admin/blog");

    } catch (error: any) {
      console.error("Error saving post:", error);
      toast({
        title: "Error saving post",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    navigate("/admin/blog");
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

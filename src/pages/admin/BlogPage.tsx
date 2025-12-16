import { useState } from "react";
import { useSiteData } from "@/contexts/SiteDataContext";
import BlogTab, { ExtendedBlogPost } from "@/components/admin/tabs/BlogTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const BlogPage = () => {
    const { blogPosts, setBlogPosts, refreshBlogPosts } = useSiteData();
    const { toast } = useToast();

    // Map context posts to ExtendedBlogPost potentially needed by BlogTab
    const posts: ExtendedBlogPost[] = blogPosts.map(post => ({
        ...post,
        date: post.publishedAt || new Date().toISOString().split('T')[0],
        media: [],
        status: post.status, // Ensure status is passed
        category: post.category as any, // Cast category to satisfy the literal type union if it doesn't match exactly
        image: post.imageUrl // Map imageUrl to image expected by UI
    }));

    const handleSaveArticle = async (article: ExtendedBlogPost) => {
        try {
            const postData = {
                title: article.title,
                excerpt: article.excerpt,
                content: article.content,
                author: article.author,
                category: article.category,
                status: article.status || "draft",
                image_url: article.imageUrl || article.image, // Support both
                read_time: article.readTime,
                published_at: article.publishedAt,
                scheduled_at: article.scheduledAt,
                tags: article.tags,
                slug: article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
            };

            let error;
            if (article.id && article.id.length > 10) { // Simple check if it's likely a UUID vs temp ID
                const result = await supabase
                    .from("blog_posts")
                    .update(postData)
                    .eq("id", article.id);
                error = result.error;
            } else {
                const result = await supabase
                    .from("blog_posts")
                    .insert(postData);
                error = result.error;
            }

            if (error) throw error;

            await refreshBlogPosts();
            toast({ title: "Blog post saved successfully" });
        } catch (error) {
            console.error("Error saving blog post:", error);
            toast({ title: "Error saving blog post", variant: "destructive" });
        }
    };

    const handleDeletePost = async (id: string) => {
        try {
            const { error } = await supabase
                .from("blog_posts")
                .delete()
                .eq("id", id);

            if (error) throw error;

            await refreshBlogPosts();
            toast({ title: "Post deleted" });
        } catch (error) {
            console.error("Error deleting post:", error);
            toast({ title: "Error deleting post", variant: "destructive" });
        }
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

    return (
        <BlogTab
            posts={posts}
            onSaveArticle={handleSaveArticle}
            onDeletePost={handleDeletePost}
            onSharePost={handleSharePost}
        />
    );
};

export default BlogPage;

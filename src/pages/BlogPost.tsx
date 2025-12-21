import { Helmet } from "react-helmet-async";
import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useSiteData } from "@/contexts/SiteDataContext";
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { blogPosts, loading } = useSiteData();

  // Find post by ID or Slug for backward compatibility
  const post = blogPosts.find(p => p.id === slug || p.slug === slug);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper filter function
  const isPublished = (p: typeof blogPosts[0]) =>
    p.status === 'published' ||
    (p.status === 'scheduled' && p.scheduledAt && new Date(p.scheduledAt) <= new Date());

  // Get related posts from same category, excluding current post
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id && isPublished(p))
    .slice(0, 3);

  // Get next and previous posts (from filtered published list)
  const publishedPosts = blogPosts.filter(isPublished);
  const currentIndex = publishedPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < publishedPosts.length - 1 ? publishedPosts[currentIndex + 1] : null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>{post.title} | AR Advanced Woundcare Solutions</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      <div className="bg-[#f8fafc] dark:bg-background min-h-screen pb-20">
        {/* Article Header Background */}
        <section className="bg-gradient-to-br from-[#EBF4FA] via-white to-[#EBF4FA] dark:from-secondary/10 dark:via-background dark:to-secondary/5 pt-24 pb-32 md:pb-48 px-4 relative overflow-hidden">
          {post.imageUrl && (
            <>
              <div className="absolute inset-0 z-0">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover opacity-20 dark:opacity-10 blur-sm scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/80 to-[#EBF4FA] dark:from-background/80 dark:via-background/90 dark:to-background" />
              </div>
            </>
          )}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-secondary/5 to-transparent pointer-events-none" />

          <div className="container-main relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group no-underline text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Blog
              </Link>

              <div className="mb-6 flex justify-center">
                <Badge variant="secondary" className="capitalize text-sm px-4 py-1.5 shadow-sm hover:bg-secondary/80 transition-colors cursor-default">
                  {post.category}
                </Badge>
              </div>

              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-secondary mb-8 leading-[1.15] tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground text-sm md:text-base">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{post.author}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-border" />
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {formatDate(post.publishedAt)}
                </span>
                {post.readTime && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-border" />
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {post.readTime}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Article Sheet Container */}
        <div className="container-main -mt-20 md:-mt-32 relative z-20">
          <div className="max-w-[800px] mx-auto">
            {/* The "Paper" Sheet */}
            <div className="bg-card rounded-2xl shadow-xl shadow-secondary/5 border border-border/50 overflow-hidden">
              <div className="p-8 md:p-12 lg:p-16">
                {/* Article Body */}
                <article
                  className={cn(
                    "tiptap prose prose-lg max-w-none mx-auto",
                    "prose-headings:font-display prose-headings:text-secondary prose-headings:font-bold",
                    "prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-10 prose-h2:mb-6",
                    "prose-h3:text-xl prose-h3:md:text-2xl",
                    "prose-p:text-foreground/80 prose-p:leading-8",
                    "prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:font-medium",
                    "prose-li:text-foreground/80 prose-li:my-2",
                    "prose-strong:text-foreground prose-strong:font-semibold",
                    "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-muted-foreground prose-blockquote:my-8",
                    "prose-img:rounded-xl prose-img:shadow-md"
                  )}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post.content, {
                      ADD_TAGS: ["iframe"],
                      ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "style", "title"],
                    })
                  }}
                />

                {/* Share Section */}
                <div className="mt-16 pt-8 border-t border-dashed flex items-center justify-between">
                  <p className="font-display font-semibold text-secondary">Share this article</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="gap-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Post Navigation */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  to={`/blog/${prevPost.id}`}
                  className="group p-6 rounded-xl bg-white dark:bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all text-left"
                >
                  <span className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Previous Article
                  </span>
                  <p className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {prevPost.title}
                  </p>
                </Link>
              ) : <div />}

              {nextPost && (
                <Link
                  to={`/blog/${nextPost.id}`}
                  className="group p-6 rounded-xl bg-white dark:bg-card border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all text-right"
                >
                  <span className="flex items-center justify-end gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-2 font-medium">
                    Next Article
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <p className="font-display font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {nextPost.title}
                  </p>
                </Link>
              )}
            </div>

            {/* CTA Card */}
            <div className="mt-12">
              <div className="bg-secondary rounded-2xl p-8 md:p-12 text-center text-secondary-foreground shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl font-bold mb-4 text-white">
                    Need Specialized Wound Care?
                  </h3>
                  <p className="text-white/90 mb-8 max-w-lg mx-auto text-lg">
                    Our expert clinicians provide personalized care in the comfort of your home. Get in touch today.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20 no-link-style">
                      <Link to="/request-visit">
                        Request a Visit
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="bg-transparent border-white/20 !text-white hover:bg-white/10 hover:!text-white">
                      <Link to="/contact">Contact Us</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-20 mt-12 border-t border-border/50">
            <div className="container-main">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                    Related Articles
                  </h2>
                  <Link
                    to="/blog"
                    className="text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <Card
                      key={relatedPost.id}
                      className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card h-full flex flex-col"
                    >
                      <div className="h-40 bg-muted flex items-center justify-center relative overflow-hidden">
                        {relatedPost.imageUrl ? (
                          <div className="absolute inset-0">
                            <img
                              src={relatedPost.imageUrl}
                              alt={relatedPost.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/10" />
                          </div>
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
                        )}
                        <Badge variant="secondary" className="capitalize relative z-10 shadow-sm hover:bg-secondary/80 transition-colors backdrop-blur-sm bg-white/90 dark:bg-slate-800/90">
                          {relatedPost.category}
                        </Badge>
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl font-display line-clamp-2 group-hover:text-primary transition-colors">
                          <Link to={`/blog/${relatedPost.id}`}>
                            {relatedPost.title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col">
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {relatedPost.readTime}
                          </span>
                          <Link
                            to={`/blog/${relatedPost.id}`}
                            className="text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                          >
                            Read Article
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default BlogPost;

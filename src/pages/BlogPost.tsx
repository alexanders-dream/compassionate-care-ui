import { Helmet } from "react-helmet-async";
import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { blogPosts } from "@/data/blogPosts";
import { Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find(p => p.id === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get related posts from same category
  const relatedPosts = blogPosts
    .filter(p => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Get next and previous posts
  const currentIndex = blogPosts.findIndex(p => p.id === post.id);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

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

      {/* Article Header */}
      <section className="bg-[#EBF4FA] py-16 md:py-24">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Blog
            </Link>

            <Badge variant="secondary" className="capitalize text-sm px-4 py-1.5 mb-6">
              {post.category}
            </Badge>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{post.author}</p>
                  <p className="text-xs text-muted-foreground">Author</p>
                </div>
              </div>
              <span className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm">
                <Calendar className="w-4 h-4 text-primary" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm">
                <Clock className="w-4 h-4 text-primary" />
                {post.readTime}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-card/80 backdrop-blur-sm px-4 py-2.5 rounded-full shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12 md:py-16">
        <div className="container-main">
          <div className="max-w-3xl mx-auto">
            {/* Article Body */}
            <article
              className="prose prose-lg max-w-none
                prose-headings:font-display prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-2xl prose-h2:md:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border/50
                prose-h3:text-xl prose-h3:md:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-base prose-p:md:text-lg
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:my-2 prose-li:text-base prose-li:md:text-lg
                prose-strong:text-foreground prose-strong:font-semibold
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Post Navigation */}
            <div className="mt-16 pt-8 border-t border-border grid md:grid-cols-2 gap-4">
              {prevPost ? (
                <Link
                  to={`/blog/${prevPost.id}`}
                  className="group p-5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Previous</span>
                  <p className="font-medium text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-1">
                    {prevPost.title}
                  </p>
                </Link>
              ) : <div />}
              {nextPost && (
                <Link
                  to={`/blog/${nextPost.id}`}
                  className="group p-5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors text-right"
                >
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Next</span>
                  <p className="font-medium text-foreground mt-1 group-hover:text-primary transition-colors line-clamp-1">
                    {nextPost.title}
                  </p>
                </Link>
              )}
            </div>

            {/* CTA Card */}
            <div className="mt-12">
              <Card className="border-0 shadow-xl bg-[#EBF4FA] overflow-hidden">
                <div className="absolute inset-0" />
                <CardContent className="relative p-8 md:p-10 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                    Need Professional Wound Care?
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                    Our expert clinicians provide personalized wound care in the comfort of your home.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button asChild size="lg">
                      <Link to="/request-visit">
                        Request a Visit
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/contact">Contact Us</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-20 bg-muted/30">
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
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="h-32 bg-[#EBF4FA] flex items-center justify-center">
                      <Badge variant="secondary" className="capitalize">
                        {relatedPost.category}
                      </Badge>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-display line-clamp-2 group-hover:text-primary transition-colors">
                        <Link to={`/blog/${relatedPost.id}`}>
                          {relatedPost.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{relatedPost.readTime}</span>
                        <Link
                          to={`/blog/${relatedPost.id}`}
                          className="text-primary font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                          Read
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
    </Layout>
  );
};

export default BlogPost;

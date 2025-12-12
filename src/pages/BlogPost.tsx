import { Helmet } from "react-helmet-async";
import { useParams, Link, Navigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { blogPosts } from "@/data/blogPosts";
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <Layout>
      <Helmet>
        <title>{post.title} | AR Advanced Woundcare Solutions</title>
        <meta name="description" content={post.excerpt} />
      </Helmet>

      {/* Article Header */}
      <section className="bg-gradient-to-b from-pearl-aqua/30 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link 
              to="/blog" 
              className="inline-flex items-center text-primary hover:underline mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
            
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium capitalize mb-4">
              {post.category}
            </span>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <span className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {post.author}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(post.date)}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {post.readTime}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <article 
              className="prose prose-lg max-w-none
                prose-headings:text-foreground prose-headings:font-bold
                prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:my-1
                prose-strong:text-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Share and CTA */}
            <div className="mt-12 pt-8 border-t border-border">
              <div className="bg-muted/50 rounded-xl p-8 text-center">
                <h3 className="text-xl font-bold text-foreground mb-3">
                  Need Professional Wound Care?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Our expert clinicians provide personalized wound care in the comfort of your home.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button asChild>
                    <Link to="/request-visit">Request a Visit</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/contact">Contact Us</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground mb-8">
                Related Articles
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg line-clamp-2 hover:text-primary transition-colors">
                        <Link to={`/blog/${relatedPost.id}`}>
                          {relatedPost.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {relatedPost.excerpt}
                      </p>
                      <Link 
                        to={`/blog/${relatedPost.id}`}
                        className="text-primary text-sm font-medium inline-flex items-center hover:underline"
                      >
                        Read More
                        <ArrowRight className="ml-1 w-3 h-3" />
                      </Link>
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

import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { blogPosts, categories } from "@/data/blogPosts";
import { Calendar, Clock, User, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredPosts = activeCategory === "all"
    ? blogPosts
    : blogPosts.filter(post => post.category === activeCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  return (
    <Layout>
      <Helmet>
        <title>Wound Care Education Blog | AR Advanced Woundcare Solutions</title>
        <meta
          name="description"
          content="Expert wound care education, prevention tips, and treatment guides. Learn how to care for wounds, prevent complications, and support healing."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-accent/20 py-20 md:py-28">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="container-main relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Expert Resources & Guides
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Wound Care <span className="text-primary">Education</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert insights, prevention tips, and treatment guides to help you understand
              wound care and support your healing journey.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b py-4">
        <div className="container-main">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
                  ${activeCategory === category.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-12 md:py-16">
        <div className="container-main">
          {/* Featured Post */}
          {featuredPost && (
            <Card className="mb-12 overflow-hidden border-0 shadow-xl bg-gradient-to-br from-card to-muted/30 group">
              <div className="md:flex">
                <div className="md:w-2/5 relative bg-gradient-to-br from-primary/10 via-accent/20 to-background p-8 md:p-12 flex items-center justify-center min-h-[280px]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary)/0.1),transparent_50%)]" />
                  <div className="relative text-center">
                    <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-lg">
                      <Sparkles className="w-4 h-4" />
                      Featured Article
                    </div>
                    <Badge variant="secondary" className="capitalize text-sm px-4 py-1">
                      {featuredPost.category}
                    </Badge>
                  </div>
                </div>
                <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
                  <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-display group-hover:text-primary transition-colors duration-300">
                      <Link to={`/blog/${featuredPost.id}`}>
                        {featuredPost.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CardDescription className="text-base md:text-lg mb-6 text-muted-foreground/90 leading-relaxed">
                      {featuredPost.excerpt}
                    </CardDescription>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
                      <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                        <User className="w-4 h-4 text-primary" />
                        {featuredPost.author}
                      </span>
                      <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                        <Calendar className="w-4 h-4 text-primary" />
                        {formatDate(featuredPost.date)}
                      </span>
                      <span className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full">
                        <Clock className="w-4 h-4 text-primary" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <Button asChild size="lg" className="group/btn">
                      <Link to={`/blog/${featuredPost.id}`}>
                        Read Article
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </div>
              </div>
            </Card>
          )}

          {/* Post Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {remainingPosts.map((post, index) => (
              <Card
                key={post.id}
                className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-card"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="relative h-48 bg-gradient-to-br from-primary/5 via-accent/10 to-background flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(var(--primary)/0.08),transparent_50%)] group-hover:scale-110 transition-transform duration-500" />
                  <Badge
                    variant="secondary"
                    className="relative capitalize font-medium px-4 py-1.5 shadow-sm"
                  >
                    {post.category}
                  </Badge>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl font-display line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    <Link to={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="mb-5 line-clamp-3 text-muted-foreground/80">
                    {post.excerpt}
                  </CardDescription>
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <Link
                      to={`/blog/${post.id}`}
                      className="text-primary font-medium text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      Read
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">Try selecting a different category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-primary to-blue-800 py-20">
        {/* Premium decorative elements */}
        <div className="absolute top-0 left-1/3 w-96 h-64 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container-main relative z-10 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Have Questions About Your Wound Care?
          </h2>
          <p className="text-primary-foreground/85 mb-8 max-w-2xl mx-auto text-lg">
            Our expert team is here to help. Schedule a consultation to discuss your specific needs.
          </p>
          <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl">
            <Link to="/request-visit">
              Request a Visit
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;

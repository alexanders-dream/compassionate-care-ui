import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { blogPosts, categories } from "@/data/blogPosts";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredPosts = activeCategory === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
      <section className="bg-gradient-to-b from-pearl-aqua/30 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Wound Care Education
            </h1>
            <p className="text-lg text-muted-foreground">
              Expert insights, prevention tips, and treatment guides to help you understand 
              wound care and support your healing journey.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveCategory}>
            <TabsList className="flex flex-wrap justify-center mb-12 bg-muted/50 p-1 rounded-lg">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-0">
              {/* Featured Post */}
              {filteredPosts.length > 0 && (
                <Card className="mb-12 overflow-hidden border-primary/20">
                  <div className="md:flex">
                    <div className="md:w-2/5 bg-gradient-to-br from-primary/10 to-pearl-aqua/20 p-8 flex items-center justify-center">
                      <div className="text-center">
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium capitalize mb-4">
                          {filteredPosts[0].category}
                        </span>
                        <p className="text-muted-foreground text-sm">Featured Article</p>
                      </div>
                    </div>
                    <div className="md:w-3/5 p-6 md:p-8">
                      <CardHeader className="p-0 pb-4">
                        <CardTitle className="text-2xl md:text-3xl hover:text-primary transition-colors">
                          <Link to={`/blog/${filteredPosts[0].id}`}>
                            {filteredPosts[0].title}
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        <CardDescription className="text-base mb-6">
                          {filteredPosts[0].excerpt}
                        </CardDescription>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {filteredPosts[0].author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(filteredPosts[0].date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {filteredPosts[0].readTime}
                          </span>
                        </div>
                        <Button asChild>
                          <Link to={`/blog/${filteredPosts[0].id}`}>
                            Read Article
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                        </Button>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              )}

              {/* Post Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.slice(1).map((post) => (
                  <Card key={post.id} className="hover:shadow-lg transition-shadow border-border/50">
                    <div className="h-40 bg-gradient-to-br from-primary/5 to-pearl-aqua/10 flex items-center justify-center">
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium capitalize">
                        {post.category}
                      </span>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl hover:text-primary transition-colors line-clamp-2">
                        <Link to={`/blog/${post.id}`}>
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4 line-clamp-3">
                        {post.excerpt}
                      </CardDescription>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <Link 
                        to={`/blog/${post.id}`}
                        className="text-primary font-medium inline-flex items-center hover:underline"
                      >
                        Read More
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No articles found in this category.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Have Questions About Your Wound Care?
          </h2>
          <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Our expert team is here to help. Schedule a consultation to discuss your specific needs.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link to="/request-visit">Request a Visit</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, Search, Loader2, Plus, X, Image, Youtube, Save, Send, Clock, 
  Eye, EyeOff, RefreshCw, FileText, Wand2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiProviders, getProviderById } from "@/data/aiProviders";
import { BlogPost, categories } from "@/data/blogPosts";

interface AIArticleGeneratorProps {
  onSaveArticle: (article: BlogPost & { status: "draft" | "published" | "scheduled"; scheduledDate?: string; media?: ArticleMedia[] }) => void;
  editingArticle?: BlogPost | null;
}

export interface ArticleMedia {
  type: "image" | "youtube";
  url: string;
  caption?: string;
}

const AIArticleGenerator = ({ onSaveArticle, editingArticle }: AIArticleGeneratorProps) => {
  const { toast } = useToast();
  
  // AI Configuration State
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState(false);
  
  // SEO Keywords State
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [isResearchingKeywords, setIsResearchingKeywords] = useState(false);
  
  // Article Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  
  // Article Editor State
  const [title, setTitle] = useState(editingArticle?.title || "");
  const [excerpt, setExcerpt] = useState(editingArticle?.excerpt || "");
  const [content, setContent] = useState(editingArticle?.content || "");
  const [category, setCategory] = useState<BlogPost["category"]>(editingArticle?.category || "guides");
  const [author, setAuthor] = useState(editingArticle?.author || "");
  const [readTime, setReadTime] = useState(editingArticle?.readTime || "");
  const [featuredImage, setFeaturedImage] = useState(editingArticle?.image || "");
  
  // Media State
  const [media, setMedia] = useState<ArticleMedia[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaCaption, setNewMediaCaption] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "youtube">("image");
  
  // Publish State
  const [status, setStatus] = useState<"draft" | "published" | "scheduled">("draft");
  const [scheduledDate, setScheduledDate] = useState("");

  const categoryOptions = categories.filter(c => c.id !== "all");
  const provider = getProviderById(selectedProvider);

  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    setSelectedModel("");
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  const researchKeywords = async () => {
    if (!topic.trim()) {
      toast({ title: "Please enter a topic first", variant: "destructive" });
      return;
    }
    if (!selectedProvider || !selectedModel || !apiKey) {
      toast({ title: "Please configure AI provider first", variant: "destructive" });
      return;
    }

    setIsResearchingKeywords(true);
    
    // Simulate API call - in production, this would call the actual AI API
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulated SEO keywords based on topic
      const simulatedKeywords = [
        `${topic} treatment`,
        `${topic} prevention`,
        `${topic} symptoms`,
        `${topic} care tips`,
        `home remedies ${topic}`,
        `${topic} recovery`,
        `best practices ${topic}`,
      ].slice(0, 5);
      
      setKeywords(prev => [...new Set([...prev, ...simulatedKeywords])]);
      toast({ title: "Keywords researched successfully" });
    } catch (error) {
      toast({ title: "Failed to research keywords", variant: "destructive" });
    } finally {
      setIsResearchingKeywords(false);
    }
  };

  const generateArticle = async () => {
    if (!selectedProvider || !selectedModel || !apiKey) {
      toast({ title: "Please configure AI provider first", variant: "destructive" });
      return;
    }
    if (!topic.trim() && keywords.length === 0) {
      toast({ title: "Please enter a topic or keywords", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulated article generation
      const keywordsList = keywords.length > 0 ? keywords.join(", ") : topic;
      const simulatedTitle = `Complete Guide to ${topic || keywords[0]}: Expert Tips and Best Practices`;
      const simulatedExcerpt = `Discover everything you need to know about ${topic || keywords[0]}. Learn expert tips, prevention strategies, and treatment options for optimal wound care outcomes.`;
      const simulatedContent = `
<p>Understanding ${topic || keywords[0]} is essential for effective wound care management. This comprehensive guide covers everything from prevention to treatment.</p>

<h2>Introduction to ${topic || keywords[0]}</h2>
<p>When it comes to ${topic || keywords[0]}, knowledge is your best defense. Whether you're a patient, caregiver, or healthcare professional, understanding the fundamentals can make a significant difference in outcomes.</p>

<h2>Key Factors to Consider</h2>
<p>Several important factors play a role in ${topic || keywords[0]}:</p>
<ul>
<li>Early identification and intervention</li>
<li>Proper wound assessment techniques</li>
<li>Selection of appropriate treatment methods</li>
<li>Ongoing monitoring and documentation</li>
</ul>

<h2>Prevention Strategies</h2>
<p>Prevention is always better than treatment. Here are proven strategies:</p>
<ol>
<li>Regular skin assessments</li>
<li>Maintaining proper nutrition and hydration</li>
<li>Implementing pressure relief measures</li>
<li>Ensuring proper hygiene practices</li>
</ol>

<h2>Treatment Options</h2>
<p>Modern wound care offers various treatment approaches tailored to specific needs. Consult with healthcare professionals to determine the best course of action for your situation.</p>

<h2>When to Seek Professional Help</h2>
<p>While many wound care situations can be managed at home, certain signs indicate the need for professional intervention. Don't hesitate to reach out to wound care specialists when needed.</p>

<p><em>Keywords: ${keywordsList}</em></p>
      `.trim();

      setTitle(simulatedTitle);
      setExcerpt(simulatedExcerpt);
      setContent(simulatedContent);
      setGeneratedContent(simulatedContent);
      setReadTime(`${Math.ceil(simulatedContent.split(' ').length / 200)} min read`);
      
      toast({ title: "Article generated successfully" });
    } catch (error) {
      toast({ title: "Failed to generate article", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const addMedia = () => {
    if (!newMediaUrl.trim()) return;
    
    setMedia([...media, { type: mediaType, url: newMediaUrl, caption: newMediaCaption }]);
    setNewMediaUrl("");
    setNewMediaCaption("");
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSave = (saveStatus: "draft" | "published" | "scheduled") => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const article: BlogPost & { status: "draft" | "published" | "scheduled"; scheduledDate?: string; media?: ArticleMedia[] } = {
      id: editingArticle?.id || slug,
      title,
      excerpt,
      content,
      category,
      author: author || "AR Woundcare Team",
      date: new Date().toISOString().split('T')[0],
      readTime: readTime || "5 min read",
      image: featuredImage || undefined,
      status: saveStatus,
      scheduledDate: saveStatus === "scheduled" ? scheduledDate : undefined,
      media: media.length > 0 ? media : undefined,
    };

    onSaveArticle(article);
    toast({ 
      title: saveStatus === "published" ? "Article published!" : 
             saveStatus === "scheduled" ? "Article scheduled!" : 
             "Draft saved!" 
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">AI Config</TabsTrigger>
          <TabsTrigger value="research">SEO Research</TabsTrigger>
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="edit">Edit & Publish</TabsTrigger>
        </TabsList>

        {/* AI Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Provider Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select value={selectedProvider} onValueChange={handleProviderChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>AI Model</Label>
                  <Select 
                    value={selectedModel} 
                    onValueChange={setSelectedModel}
                    disabled={!selectedProvider}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedProvider ? "Select model..." : "Select provider first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {provider?.models.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex flex-col">
                            <span>{m.name}</span>
                            {m.description && (
                              <span className="text-xs text-muted-foreground">{m.description}</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={provider?.apiKeyPlaceholder || "Enter API key..."}
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored locally and never sent to our servers.
                </p>
              </div>

              {selectedProvider && selectedModel && apiKey && (
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    AI is configured and ready to generate content!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Research Tab */}
        <TabsContent value="research" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO Keyword Research
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <div className="flex gap-2">
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., diabetic foot care, wound healing"
                  />
                  <Button 
                    onClick={researchKeywords}
                    disabled={isResearchingKeywords || !topic.trim()}
                  >
                    {isResearchingKeywords ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Search className="h-4 w-4 mr-2" />
                    )}
                    Research
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add custom keyword..."
                    onKeyDown={(e) => e.key === "Enter" && addKeyword()}
                  />
                  <Button onClick={addKeyword} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {keyword}
                        <button
                          onClick={() => removeKeyword(keyword)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Generate Article
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm font-medium">Generation Settings:</p>
                <p className="text-sm text-muted-foreground">
                  Provider: {provider?.name || "Not selected"} | 
                  Model: {provider?.models.find(m => m.id === selectedModel)?.name || "Not selected"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Topic: {topic || "Not set"} | Keywords: {keywords.length > 0 ? keywords.join(", ") : "None"}
                </p>
              </div>

              <Button 
                onClick={generateArticle}
                disabled={isGenerating || !selectedProvider || !selectedModel || !apiKey}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Generating Article...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Generate Article with AI
                  </>
                )}
              </Button>

              {!selectedProvider || !selectedModel || !apiKey ? (
                <p className="text-sm text-center text-muted-foreground">
                  Configure AI provider in the first tab to enable generation.
                </p>
              ) : null}

              {generatedContent && (
                <div className="mt-4 p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Generated Preview:</p>
                    <Button variant="outline" size="sm" onClick={generateArticle}>
                      <RefreshCw className="h-4 w-4 mr-1" /> Regenerate
                    </Button>
                  </div>
                  <div 
                    className="prose prose-sm max-w-none max-h-64 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: generatedContent }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Edit & Publish Tab */}
        <TabsContent value="edit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Editor */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Article Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Article title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Brief summary for listings..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content (HTML)</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Article content with HTML formatting..."
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Media Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Media
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={mediaType} onValueChange={(v: "image" | "youtube") => setMediaType(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image">
                          <span className="flex items-center gap-2">
                            <Image className="h-4 w-4" /> Image
                          </span>
                        </SelectItem>
                        <SelectItem value="youtube">
                          <span className="flex items-center gap-2">
                            <Youtube className="h-4 w-4" /> YouTube
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      placeholder={mediaType === "youtube" ? "YouTube video URL..." : "Image URL..."}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMediaCaption}
                      onChange={(e) => setNewMediaCaption(e.target.value)}
                      placeholder="Caption (optional)..."
                      className="flex-1"
                    />
                    <Button onClick={addMedia} variant="outline">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>

                  {media.length > 0 && (
                    <div className="space-y-2 mt-4">
                      {media.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          {item.type === "youtube" ? (
                            <Youtube className="h-4 w-4 text-red-500" />
                          ) : (
                            <Image className="h-4 w-4 text-blue-500" />
                          )}
                          <span className="flex-1 text-sm truncate">{item.url}</span>
                          {item.caption && (
                            <span className="text-xs text-muted-foreground truncate max-w-32">
                              {item.caption}
                            </span>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeMedia(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Article Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(v: BlogPost["category"]) => setCategory(v)}>
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

                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Author name..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readTime">Read Time</Label>
                    <Input
                      id="readTime"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="5 min read"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="featuredImage">Featured Image URL</Label>
                    <Input
                      id="featuredImage"
                      value={featuredImage}
                      onChange={(e) => setFeaturedImage(e.target.value)}
                      placeholder="/images/article.jpg"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Publish</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Schedule (optional)</Label>
                    <Input
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={() => handleSave("draft")} 
                      variant="outline" 
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    
                    {scheduledDate && (
                      <Button 
                        onClick={() => handleSave("scheduled")} 
                        variant="secondary" 
                        className="w-full"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    )}
                    
                    <Button 
                      onClick={() => handleSave("published")} 
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Publish Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIArticleGenerator;

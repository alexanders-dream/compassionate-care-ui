import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sparkles, Search, Loader2, Plus, X, Image, Youtube, Save, Send, Settings,
  Lightbulb, RefreshCw, Wand2, Eye, EyeOff, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiProviders, getProviderById } from "@/data/aiProviders";
import { BlogPost, categories, blogPosts } from "@/data/blogPosts";
import { supabase } from "@/integrations/supabase/client";
import { getAIConfig, saveAIConfig, AIConfig } from "@/lib/ai/config";
import { fetchModels, generateTopics, researchKeywords, generateArticleContent } from "@/lib/ai/service";
import DOMPurify from "dompurify";

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

  // --- AI Config State ---
  const [config, setConfig] = useState<AIConfig>({ provider: "", apiKey: "", model: "" });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigExpanded, setIsConfigExpanded] = useState(false);

  // --- Strategy State ---
  const [topic, setTopic] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("guides");
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);

  // --- Editor State ---
  const [title, setTitle] = useState(editingArticle?.title || "");
  const [content, setContent] = useState(editingArticle?.content || "");
  const [excerpt, setExcerpt] = useState(editingArticle?.excerpt || "");
  const [author, setAuthor] = useState(editingArticle?.author || "AR Woundcare Team");
  const [readTime, setReadTime] = useState(editingArticle?.readTime || "5 min read");
  const [featuredImage, setFeaturedImage] = useState(editingArticle?.image || "");
  const [media, setMedia] = useState<ArticleMedia[]>([]);

  // --- Generation State ---
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>("");

  // --- Effects ---
  useEffect(() => {
    const loadConfig = async () => {
      const savedConfig = await getAIConfig(supabase);
      if (savedConfig) {
        setConfig(savedConfig);
      } else {
        setIsConfigExpanded(true); // Open config if none exists
      }
    };
    loadConfig();
  }, []);

  // --- Handlers: Configuration ---
  const handleSaveConfig = async () => {
    if (!config.provider || !config.apiKey) {
      toast({ title: "Provider and API Key are required", variant: "destructive" });
      return;
    }
    const success = await saveAIConfig(supabase, config);
    if (success) {
      toast({ title: "Settings saved", description: "Your API key has been stored securely." });
      setIsConfigExpanded(false);
    } else {
      toast({ title: "Failed to save settings", variant: "destructive" });
    }
  };

  const handleProviderChange = (providerId: string) => {
    setConfig(prev => ({ ...prev, provider: providerId, model: "" }));
  };

  // --- Handlers: Strategy ---
  const handleSuggestTopics = async () => {
    if (!config.apiKey) {
      toast({ title: "Please configure AI settings first", variant: "destructive" });
      setIsConfigExpanded(true);
      return;
    }
    setIsSuggesting(true);
    try {
      const existingTitles = blogPosts.map(p => p.title);
      const topics = await generateTopics(config, selectedCategory, existingTitles);
      setSuggestedTopics(topics);
      toast({ title: "Topics generated" });
    } catch (error: any) {
      toast({ title: "Error generating topics", description: error.message, variant: "destructive" });
    } finally {
      setIsSuggesting(false);
    }
  };

  const selectTopic = (t: string) => {
    setTopic(t);
    setTitle(t); // Auto-fill title
  };

  // --- Handlers: Generation ---
  const handleGenerate = async () => {
    if (!config.apiKey) {
      toast({ title: "Configure AI first", variant: "destructive" });
      setIsConfigExpanded(true);
      return;
    }
    if (!topic.trim()) {
      toast({ title: "Please enter or select a topic", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    setGenerationStep("Researching SEO keywords...");

    try {
      // 1. Research Keywords
      const businessDetails = "AR Advanced Wound Care, specialized in chronic wounds, diabetic ulcers, and home visits.";
      const researchedKeywords = await researchKeywords(config, topic, businessDetails);
      setKeywords(researchedKeywords);

      setGenerationStep("Drafting content...");

      // 2. Generate Content
      const generatedHtml = await generateArticleContent(config, title || topic, researchedKeywords);
      setContent(generatedHtml);

      // Auto-generate excerpt if empty
      if (!excerpt) {
        setExcerpt(`Learn about ${topic} including prevention, treatment, and expert advice.`);
      }

      toast({ title: "Content Generated Successfully!" });
    } catch (error: any) {
      console.error(error);
      toast({ title: "Generation failed", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // --- Handlers: Saving ---
  const handleSave = (status: "draft" | "published") => {
    if (!title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const article: BlogPost & { status: "draft" | "published" | "scheduled"; scheduledDate?: string; media?: ArticleMedia[] } = {
      id: editingArticle?.id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title,
      excerpt,
      content,
      category: selectedCategory as any,
      author,
      date: new Date().toISOString().split('T')[0],
      readTime,
      image: featuredImage || undefined,
      status,
      media: media.length > 0 ? media : undefined,
    };
    onSaveArticle(article);
    toast({ title: status === "published" ? "Published!" : "Draft Saved" });
  };

  const currentProvider = getProviderById(config.provider);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">

      {/* --- Sidebar (Left) --- */}
      <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2">

        {/* AI Config Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsConfigExpanded(!isConfigExpanded)}>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" /> AI Configuration
              </CardTitle>
              {isConfigExpanded ? <X className="h-4 w-4 text-muted-foreground" /> : <Settings className="h-4 w-4 text-muted-foreground" />}
            </div>
          </CardHeader>
          {isConfigExpanded && (
            <CardContent className="space-y-3 pt-0">
              <div className="space-y-1">
                <Label className="text-xs">Provider</Label>
                <Select value={config.provider} onValueChange={handleProviderChange}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiProviders.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {config.provider && (
                <div className="space-y-1">
                  <Label className="text-xs">Model</Label>
                  <Select value={config.model} onValueChange={(v) => setConfig(prev => ({ ...prev, model: v }))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProvider?.models.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs">API Key</Label>
                <div className="flex gap-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={config.apiKey}
                    onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    className="h-8 text-xs"
                    placeholder={currentProvider?.apiKeyPlaceholder || "API Key"}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              <Button size="sm" onClick={handleSaveConfig} className="w-full h-8 text-xs">Save Settings</Button>
            </CardContent>
          )}
        </Card>

        {/* Strategy Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" /> Content Strategy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="space-y-2">
              <Label className="text-xs">Category</Label>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleSuggestTopics} disabled={isSuggesting}>
                  {isSuggesting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Suggest"}
                </Button>
              </div>
            </div>

            {suggestedTopics.length > 0 && (
              <div className="space-y-1 bg-background p-2 rounded border">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Suggestions:</p>
                {suggestedTopics.map((t, i) => (
                  <div
                    key={i}
                    className="text-xs p-1.5 hover:bg-muted rounded cursor-pointer transition-colors flex justify-between group"
                    onClick={() => selectTopic(t)}
                  >
                    <span className="line-clamp-2">{t}</span>
                    <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label className="text-xs">Topic / Title</Label>
              <Textarea
                placeholder="What do you want to write about?"
                className="h-20 text-sm resize-none"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={handleGenerate}
              disabled={isGenerating || !topic}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {generationStep || "Working..."}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" /> GenerateDraft
                </>
              )}
            </Button>

            {keywords.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-1">Target Keywords:</p>
                <div className="flex flex-wrap gap-1">
                  {keywords.slice(0, 5).map((k, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-1 py-0">{k}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* --- Main Editor (Right) --- */}
      <div className="lg:col-span-8 flex flex-col h-full space-y-4">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="py-3 border-b flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Editor</CardTitle>
              {isGenerating && <span className="text-xs text-muted-foreground animate-pulse">AI is writing...</span>}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleSave("draft")}>
                <Save className="h-4 w-4 mr-2" /> Save Draft
              </Button>
              <Button size="sm" onClick={() => handleSave("published")}>
                <Send className="h-4 w-4 mr-2" /> Publish
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Title</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="font-bold text-lg border-none shadow-none px-0 focus-visible:ring-0"
                placeholder="Article Title..."
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Excerpt</Label>
              <Textarea
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                className="h-16 resize-none bg-muted/30"
                placeholder="Short summary..."
              />
            </div>

            <div className="flex-1 space-y-1 flex flex-col min-h-[300px]">
              <Label className="text-xs text-muted-foreground flex justify-between">
                <span>Content (HTML)</span>
                <span className="font-normal">{content.length} chars</span>
              </Label>
              <Textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                className="flex-1 font-mono text-sm leading-relaxed p-4"
                placeholder="<p>Write something amazing...</p>"
              />
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};

export default AIArticleGenerator;

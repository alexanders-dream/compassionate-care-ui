import { useState, useEffect } from "react";
import RichEditor from "@/components/admin/RichEditor";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImageInsertionDialog } from "@/components/admin/ImageInsertionDialog";
import { SchedulePopover } from "@/components/admin/SchedulePopover";
import {
  Sparkles, Search, Loader2, Plus, X, Image, Youtube, Save, Send, Settings,
  Lightbulb, RefreshCw, Wand2, Eye, EyeOff, Check, ChevronDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { aiProviders, getProviderById, AIModel } from "@/data/aiProviders";
import { BlogPost, categories, blogPosts } from "@/data/blogPosts";
import { supabase } from "@/integrations/supabase/client";
import { getAIConfig, AIConfig } from "@/lib/ai/config";
import { generateTopics, researchKeywords, generateArticleContent } from "@/lib/ai/service";
import { AISidebar } from "@/components/admin/ai/AISidebar";
import { useAIEditor } from "@/hooks/use-ai-editor";
import { useAIConfig } from "@/hooks/use-ai-config";
import { Editor } from "@tiptap/react";

interface AIArticleGeneratorProps {
  onSaveArticle: (article: BlogPost & { status: "draft" | "published" | "scheduled"; scheduledDate?: string; scheduledAt?: string; media?: ArticleMedia[] }) => void;
  editingArticle?: BlogPost | null;
}

export interface ArticleMedia {
  type: "image" | "youtube";
  url: string;
  caption?: string;
}

const AIArticleGenerator = ({ onSaveArticle, editingArticle }: AIArticleGeneratorProps) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // --- AI Config State (for Strategy & Editor) ---
  const { config, setConfig } = useAIConfig();

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
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

  // --- Editor Instance for Quick Actions ---
  const [editor, setEditor] = useState<Editor | null>(null);

  // --- Effects ---
  // No longer needed, useAIConfig handles loading

  // Use AI Hook
  const { isProcessing, applyAIAction, applyCustomPrompt } = useAIEditor({ editor, config });

  // Combine processing states for UI
  const isBusy = isProcessing || isGenerating;

  // --- Handlers: Strategy ---
  const handleSuggestTopics = async () => {
    if (!config.apiKey) {
      toast({ title: "Please configure AI settings first", variant: "destructive" });
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
  const handleSave = (status: "draft" | "published" | "scheduled", scheduledDate?: Date) => {
    if (!title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    const article: BlogPost & { status: "draft" | "published" | "scheduled"; scheduledDate?: string; scheduledAt?: string; media?: ArticleMedia[]; slug?: string } = {
      id: editingArticle?.id || "",
      title,
      excerpt,
      content,
      category: selectedCategory as any,
      author,
      date: new Date().toISOString().split('T')[0],
      readTime,
      image: featuredImage || undefined,
      imageUrl: featuredImage || undefined,
      status,
      media: media.length > 0 ? media : undefined,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      scheduledDate: scheduledDate?.toISOString(),
      scheduledAt: scheduledDate?.toISOString(),
    };
    onSaveArticle(article);
    toast({ title: status === "published" ? "Published!" : "Draft Saved" });
  };

  const currentProvider = getProviderById(config.provider);

  const SidebarContent = (
    <div className="space-y-4">
      {/* AI Config Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" /> AI Configuration
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                    className="p-1 rounded hover:bg-blue-100 transition-colors"
                  >
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isConfigExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {isConfigExpanded ? 'Collapse settings' : 'Expand settings'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Model</Label>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-5 w-5"
                    onClick={handleRefreshModels}
                    disabled={isLoadingModels || !config.apiKey}
                    title="Refresh models"
                  >
                    <RefreshCw className={`h-3 w-3 ${isLoadingModels ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                {isLoadingModels ? (
                  <div className="flex items-center justify-center h-8 bg-muted/50 rounded border text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    Loading models...
                  </div>
                ) : availableModels.length > 0 ? (
                  <Select value={config.model} onValueChange={(v) => setConfig(prev => ({ ...prev, model: v }))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          <span className="flex items-center gap-2">
                            {m.name}
                            {m.description && <span className="text-muted-foreground text-[10px]">({m.description})</span>}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center justify-center h-8 bg-muted/30 rounded border border-dashed text-xs text-muted-foreground gap-1">
                    {config.apiKey ? (
                      <><RefreshCw className="h-3 w-3" /> Click refresh to load models</>
                    ) : (
                      <>Enter API key to load models</>
                    )}
                  </div>
                )}
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
            <div className="space-y-1 bg-background p-2 rounded border max-h-32 overflow-y-auto">
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
            className="w-full bg-primary hover:bg-primary/90 text-xs"
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
                <Sparkles className="h-4 w-4 mr-2" /> Generate Draft
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
      );

      const EditorArea = (
      <Card className="flex-1 flex flex-col overflow-hidden h-full border-0 sm:border rounded-none sm:rounded-lg shadow-none sm:shadow">
        <CardHeader className="py-3 border-b flex flex-row items-center justify-between space-y-0 px-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Editor</CardTitle>
            {isGenerating && <span className="text-xs text-muted-foreground animate-pulse">AI is writing...</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleSave("draft")}>
              <Save className="h-4 w-4 mr-2" /> Save Draft
            </Button>
            <SchedulePopover
              onSchedule={(date) => handleSave("scheduled", date)}
              trigger={
                <Button variant="outline" size="sm" className="gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                  <CalendarIcon className="h-4 w-4" />
                  Schedule
                </Button>
              }
            />
            <Button size="sm" onClick={() => handleSave("published")}>
              <Send className="h-4 w-4 mr-2" /> Publish
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Featured Image</Label>
            <div className="flex gap-2">
              {featuredImage && (
                <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md border">
                  <img src={featuredImage} alt="Featured" className="h-full w-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-5 w-5"
                    onClick={() => setFeaturedImage("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                className="h-20 w-full border-dashed"
                onClick={() => setIsImageDialogOpen(true)}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                {featuredImage ? "Change Image" : "Add Featured Image"}
              </Button>
            </div>
          </div>

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
              <span>Content</span>
              <span className="font-normal">{content.length} chars</span>
            </Label>
            <RichEditor
              content={content}
              onChange={setContent}
              className="flex-1 border rounded-md"
              placeholder="Write something amazing..."
              onEditorReady={setEditor}
            />
          </div>
        </CardContent>
      </Card>
      );

      if (isMobile) {
    return (
      <Tabs defaultValue="editor" className="flex flex-col bg-background pb-20 h-full">
        <TabsList className="grid w-full grid-cols-2 mb-2 sticky top-0 z-10 bg-background/95">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="settings">Setup & AI</TabsTrigger>
        </TabsList>
        <TabsContent value="editor" className="mt-0 flex-1 overflow-auto">
          {EditorArea}
        </TabsContent>
        <TabsContent value="settings" className="mt-0 flex-1 overflow-auto">
          <AISidebar
            config={config}
            setConfig={setConfig}
            isProcessing={isBusy}
            onAction={applyAIAction}
            onCustomPrompt={applyCustomPrompt}
            additionalContent={StrategyCard}
          />
        </TabsContent>
      </Tabs>
      );
  }

      return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[calc(100vh-100px)] border rounded-lg overflow-hidden bg-background shadow-sm">
        {/* --- Main Editor (Left/Center) --- */}
        <div className="lg:col-span-9 flex flex-col h-full overflow-hidden border-r">
          {EditorArea}
        </div>

        {/* --- Sidebar (Right) --- */}
        <div className="lg:col-span-3 h-full overflow-hidden bg-muted/10">
          <AISidebar
            config={config}
            setConfig={setConfig}
            isProcessing={isBusy}
            onAction={applyAIAction}
            onCustomPrompt={applyCustomPrompt}
            additionalContent={StrategyCard}
          />
        </div>

        <ImageInsertionDialog
          open={isImageDialogOpen}
          onOpenChange={setIsImageDialogOpen}
          onImageSelected={setFeaturedImage}
        />
      </div>
      );
};

      export default AIArticleGenerator;

import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sparkles, Wand2, RotateCcw, RotateCw, Save, X, Bold, Italic,
  List, ListOrdered, Heading2, Quote, Link2, Image as ImageIcon,
  Loader2, CheckCircle2, Eye, EyeOff,
  FileText, Settings2, MessageSquare, Zap, PenLine, RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogPost, categories } from "@/data/blogPosts";
import { aiProviders, getProviderById, AIModel } from "@/data/aiProviders";
import { supabase } from "@/integrations/supabase/client";
import { getAIConfig, AIConfig } from "@/lib/ai/config";
import { fetchModels, clearModelCache } from "@/lib/ai/service";

interface AITextEditorProps {
  post: BlogPost;
  onSave: (post: BlogPost & { status: "draft" | "published" | "scheduled" }) => void;
  onClose: () => void;
}

type AIAction = "rewrite" | "expand" | "summarize" | "improve" | "fix_grammar" | "make_formal" | "make_casual" | "add_examples";

const aiActions: { id: AIAction; label: string; icon: React.ReactNode; description: string }[] = [
  { id: "rewrite", label: "Rewrite", icon: <RefreshCw className="h-4 w-4" />, description: "Rewrite the selected text" },
  { id: "expand", label: "Expand", icon: <Zap className="h-4 w-4" />, description: "Add more detail and depth" },
  { id: "summarize", label: "Summarize", icon: <FileText className="h-4 w-4" />, description: "Make it more concise" },
  { id: "improve", label: "Improve", icon: <Sparkles className="h-4 w-4" />, description: "Enhance writing quality" },
  { id: "fix_grammar", label: "Fix Grammar", icon: <CheckCircle2 className="h-4 w-4" />, description: "Correct grammar and spelling" },
  { id: "make_formal", label: "Make Formal", icon: <PenLine className="h-4 w-4" />, description: "Professional tone" },
  { id: "make_casual", label: "Make Casual", icon: <MessageSquare className="h-4 w-4" />, description: "Friendly, conversational tone" },
  { id: "add_examples", label: "Add Examples", icon: <List className="h-4 w-4" />, description: "Include practical examples" },
];

const AITextEditor = ({ post, onSave, onClose }: AITextEditorProps) => {
  const { toast } = useToast();

  // Content state
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [category, setCategory] = useState<BlogPost["category"]>(post.category);
  const [author, setAuthor] = useState(post.author);
  const [readTime, setReadTime] = useState(post.readTime);
  const [featuredImage, setFeaturedImage] = useState(post.image || "");

  // AI state - now using AIConfig structure
  const [config, setConfig] = useState<AIConfig>({ provider: "", apiKey: "", model: "" });
  const [showApiKey, setShowApiKey] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Dynamic models state
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  // Load saved AI config on mount
  useEffect(() => {
    const loadConfig = async () => {
      const savedConfig = await getAIConfig(supabase);
      if (savedConfig) {
        setConfig(savedConfig);
      }
    };
    loadConfig();
  }, []);

  // Fetch models when provider or API key changes
  useEffect(() => {
    const loadModels = async () => {
      if (!config.provider) {
        setAvailableModels([]);
        return;
      }

      setIsLoadingModels(true);
      try {
        const models = await fetchModels(config.provider, config.apiKey);
        setAvailableModels(models);
      } catch (error) {
        console.error('Failed to load models:', error);
        setAvailableModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };
    loadModels();
  }, [config.provider, config.apiKey]);

  // Refresh models function
  const handleRefreshModels = async () => {
    if (!config.provider) return;
    clearModelCache(config.provider);
    setIsLoadingModels(true);
    try {
      const models = await fetchModels(config.provider, config.apiKey);
      setAvailableModels(models);
      toast({ title: "Models refreshed", description: `Loaded ${models.length} models` });
    } catch (error) {
      toast({ title: "Failed to refresh models", variant: "destructive" });
    } finally {
      setIsLoadingModels(false);
    }
  };

  // Handle scroll progress
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = contentEl;
      const progress = scrollHeight > clientHeight
        ? (scrollTop / (scrollHeight - clientHeight)) * 100
        : 0;
      setScrollProgress(progress);
    };

    contentEl.addEventListener("scroll", handleScroll);
    return () => contentEl.removeEventListener("scroll", handleScroll);
  }, []);

  const categoryOptions = categories.filter(c => c.id !== "all");
  const provider = getProviderById(config.provider);
  const isAIConfigured = config.provider && config.model && config.apiKey;

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your article... Select text to apply AI actions.",
      }),
    ],
    content: post.content,
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4",
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, " ");
      setSelectedText(text);
    },
  });

  const applyAIAction = async (action: AIAction) => {
    if (!isAIConfigured) {
      toast({ title: "Please configure AI provider first", variant: "destructive" });
      return;
    }
    if (!editor) return;

    const textToProcess = selectedText || editor.getText();
    if (!textToProcess.trim()) {
      toast({ title: "No text to process", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      // Build prompt based on action
      const actionPrompts: Record<AIAction, string> = {
        rewrite: "Rewrite the following text while preserving its meaning. Return only the rewritten text, no explanations.",
        expand: "Expand the following text with more detail and depth. Maintain a professional tone. Return only the expanded text.",
        summarize: "Summarize the following text concisely. Return only the summary, no explanations.",
        improve: "Improve the quality, flow, and clarity of the following text. Return only the improved text.",
        fix_grammar: "Fix any grammar, spelling, and punctuation errors in the following text. Return only the corrected text.",
        make_formal: "Rewrite the following text in a more formal, professional, and medical-appropriate tone. Return only the formal version.",
        make_casual: "Rewrite the following text in a more casual, empathetic, and patient-friendly tone. Return only the casual version.",
        add_examples: "Add practical, relevant examples to illustrate the points in the following text. Return the text with examples added."
      };

      const systemPrompt = "You are an expert medical content assistant. Output properly formatted HTML content (using <p>, <ul>, <li>, <strong> tags where appropriate) but do NOT wrap the entire response in markdown code blocks. Just return the raw HTML.";

      // Import callAI dynamically to avoid cycle if it was static
      const { callAI } = await import("@/lib/ai/service");

      const processedText = await callAI({
        config,
        systemPrompt: systemPrompt,
        userPrompt: `${actionPrompts[action]}:\n\n"${textToProcess}"`
      });

      // Apply to editor
      if (selectedText) {
        const { from, to } = editor.state.selection;
        // If the returned text doesn't look like HTML, wrap it
        const contentToInsert = processedText.trim().startsWith("<") ? processedText : `<p>${processedText}</p>`;
        editor.chain().focus().deleteRange({ from, to }).insertContent(contentToInsert).run();
      } else {
        // Replacing full content
        // Ensure no markdown code blocks wrapping
        const cleanContent = processedText.replace(/^```html/, '').replace(/```$/, '').trim();
        const contentToSet = cleanContent.startsWith("<") ? cleanContent : `<p>${cleanContent}</p>`;
        editor.commands.setContent(contentToSet);
      }

      setSelectedText("");
      toast({ title: `AI ${action.replace("_", " ")} completed` });
    } catch (error: any) {
      console.error("AI Action failed:", error);
      toast({ title: "AI processing failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const applyCustomPrompt = async () => {
    if (!isAIConfigured) {
      toast({ title: "Please configure AI provider first", variant: "destructive" });
      return;
    }
    if (!customPrompt.trim() || !editor) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const textToProcess = selectedText || editor.getText();
      const systemPrompt = "You are an expert medical content assistant. Output properly formatted HTML content (using <p>, <ul>, <li>, <strong> tags where appropriate) but do NOT wrap the entire response in markdown code blocks. Just return the raw HTML.";

      // Import callAI dynamically
      const { callAI } = await import("@/lib/ai/service");

      const processedText = await callAI({
        config,
        systemPrompt: systemPrompt,
        userPrompt: `Instruction: ${customPrompt}\n\nContent to process:\n"${textToProcess}"`
      });

      // Apply to editor
      if (selectedText) {
        const { from, to } = editor.state.selection;
        const contentToInsert = processedText.trim().startsWith("<") ? processedText : `<p>${processedText}</p>`;
        editor.chain().focus().deleteRange({ from, to }).insertContent(contentToInsert).run();
      } else {
        const cleanContent = processedText.replace(/^```html/, '').replace(/```$/, '').trim();
        const contentToSet = cleanContent.startsWith("<") ? cleanContent : `<p>${cleanContent}</p>`;
        editor.commands.setContent(contentToSet);
      }

      setSelectedText("");
      setCustomPrompt("");
      toast({ title: "Custom AI edit applied" });
    } catch (error: any) {
      console.error("AI Action failed:", error);
      toast({ title: "AI processing failed", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleSave = (status: "draft" | "published" | "scheduled") => {
    if (!title.trim() || !editor?.getHTML()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    onSave({
      ...post,
      title,
      excerpt,
      content: editor.getHTML(),
      category,
      author,
      readTime,
      image: featuredImage || undefined,
      status,
    });
  };

  if (!editor) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Wand2 className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">AI Text Editor</h2>
          {isProcessing && (
            <Badge variant="secondary" className="gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Processing...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            Redo
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave("draft")}>
            <Save className="h-4 w-4 mr-1" />
            Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSave("published")}>
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Publish
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="content" className="flex-1 flex flex-col">
            <div className="border-b px-4 shrink-0 relative">
              <TabsList className="h-10">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              {/* Scroll Progress Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-150 ease-out"
                  style={{ width: `${scrollProgress}%` }}
                />
              </div>
            </div>

            <TabsContent value="content" className="flex-1 flex flex-col overflow-hidden m-0 h-0">
              {/* Sticky Header: Title + Toolbar */}
              <div className="shrink-0 bg-background p-4 pb-2 space-y-3 border-b">
                {/* Title */}
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article Title"
                  className="text-xl font-semibold"
                />

                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg flex-wrap">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={editor.isActive("bold") ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bold</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={editor.isActive("italic") ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Italic</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                      >
                        <Heading2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Heading</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Bullet List</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Numbered List</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                      >
                        <Quote className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Quote</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={editor.isActive("link") ? "secondary" : "ghost"}
                        size="sm"
                        onClick={addLink}
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Link</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={addImage}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Image</TooltipContent>
                  </Tooltip>

                  <div className="h-6 w-px bg-border mx-2" />

                  {selectedText && (
                    <Badge variant="outline" className="text-xs">
                      {selectedText.length} chars selected
                    </Badge>
                  )}
                </div>
              </div>

              {/* Scrollable Content Area */}
              <ScrollArea className="flex-1" ref={contentRef}>
                <div className="flex flex-col gap-4 p-4">
                  {/* Rich Text Editor */}
                  <div className="min-h-[300px] border rounded-lg bg-card">
                    <EditorContent editor={editor} className="min-h-full p-4" />
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Excerpt (optional)</Label>
                    <Textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Brief summary of the article..."
                      className="h-20 resize-none"
                    />
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="settings" className="flex-1 overflow-auto m-0 p-4">
              <div className="max-w-2xl space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as BlogPost["category"])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Author</Label>
                    <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Read Time</Label>
                    <Input value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="5 min read" />
                  </div>
                  <div className="space-y-2">
                    <Label>Featured Image URL</Label>
                    <Input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://..." />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Sidebar */}
        <div className="w-80 border-l bg-muted/30 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b shrink-0">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Assistant
            </h3>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* AI Configuration */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    AI Config
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <Select value={config.provider} onValueChange={(v) => setConfig(prev => ({ ...prev, provider: v, model: "" }))}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select provider..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {config.provider && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Model</span>
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
                        <div className="flex items-center justify-center h-9 bg-muted/50 rounded border text-xs text-muted-foreground">
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          Loading...
                        </div>
                      ) : availableModels.length > 0 ? (
                        <Select value={config.model} onValueChange={(v) => setConfig(prev => ({ ...prev, model: v }))}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select model..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map(m => (
                              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center justify-center h-9 bg-muted/30 rounded border border-dashed text-xs text-muted-foreground">
                          {config.apiKey ? "Click refresh" : "Enter API key"}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={config.apiKey}
                      onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="API Key"
                      className="h-9 text-sm"
                    />
                    <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => setShowApiKey(!showApiKey)}>
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>

                  {isAIConfigured && (
                    <Badge variant="default" className="w-full justify-center bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      AI Ready
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {aiActions.map(action => (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        className="h-auto py-2 px-3 flex flex-col items-start text-left"
                        onClick={() => applyAIAction(action.id)}
                        disabled={isProcessing || !isAIConfigured}
                      >
                        <span className="flex items-center gap-1.5 text-xs font-medium">
                          {action.icon}
                          {action.label}
                        </span>
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {selectedText ? "Applies to selected text" : "Applies to entire content"}
                  </p>
                </CardContent>
              </Card>

              {/* Custom Prompt */}
              <Card>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Custom Prompt
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  <Textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="E.g., Make this more engaging for healthcare professionals..."
                    className="h-24 resize-none text-sm"
                  />
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={applyCustomPrompt}
                    disabled={isProcessing || !isAIConfigured || !customPrompt.trim()}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Wand2 className="h-4 w-4 mr-2" />
                    )}
                    Apply Custom Edit
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default AITextEditor;

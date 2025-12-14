import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Sparkles, Wand2, RotateCcw, Save, X, Bold, Italic, 
  List, ListOrdered, Heading2, Quote, Link2, Image,
  RefreshCw, Loader2, CheckCircle2, Eye, EyeOff,
  FileText, Settings2, MessageSquare, Zap, PenLine
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogPost, categories } from "@/data/blogPosts";
import { aiProviders, getProviderById } from "@/data/aiProviders";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Content state
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [content, setContent] = useState(post.content);
  const [category, setCategory] = useState<BlogPost["category"]>(post.category);
  const [author, setAuthor] = useState(post.author);
  const [readTime, setReadTime] = useState(post.readTime);
  const [featuredImage, setFeaturedImage] = useState(post.image || "");
  
  // AI state
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [apiKey, setApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  
  // Selection state
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  
  // History for undo
  const [history, setHistory] = useState<string[]>([post.content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const categoryOptions = categories.filter(c => c.id !== "all");
  const provider = getProviderById(selectedProvider);
  const isAIConfigured = selectedProvider && selectedModel && apiKey;

  const handleTextSelect = () => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = content.substring(start, end);
      setSelectedText(selected);
      setSelectionStart(start);
      setSelectionEnd(end);
    }
  };

  const saveToHistory = (newContent: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const applyAIAction = async (action: AIAction) => {
    if (!isAIConfigured) {
      toast({ title: "Please configure AI provider first", variant: "destructive" });
      return;
    }

    const textToProcess = selectedText || content;
    if (!textToProcess.trim()) {
      toast({ title: "No text to process", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate AI processing - in production, call actual AI API
      await new Promise(resolve => setTimeout(resolve, 1500));

      let processedText = textToProcess;

      // Simulated AI responses based on action
      switch (action) {
        case "rewrite":
          processedText = `[Rewritten] ${textToProcess.split(' ').reverse().join(' ').split(' ').reverse().join(' ')}`;
          break;
        case "expand":
          processedText = `${textToProcess}\n\nAdditionally, it's important to note that this topic encompasses various aspects that deserve careful consideration. Understanding these nuances can significantly impact outcomes and help achieve better results.`;
          break;
        case "summarize":
          processedText = textToProcess.split('.').slice(0, 2).join('.') + '.';
          break;
        case "improve":
          processedText = textToProcess.replace(/very/gi, 'exceptionally').replace(/good/gi, 'excellent').replace(/bad/gi, 'suboptimal');
          break;
        case "fix_grammar":
          processedText = textToProcess.charAt(0).toUpperCase() + textToProcess.slice(1);
          break;
        case "make_formal":
          processedText = textToProcess.replace(/can't/gi, 'cannot').replace(/won't/gi, 'will not').replace(/don't/gi, 'do not');
          break;
        case "make_casual":
          processedText = textToProcess.replace(/cannot/gi, "can't").replace(/will not/gi, "won't").replace(/do not/gi, "don't");
          break;
        case "add_examples":
          processedText = `${textToProcess}\n\nFor example:\n• Example 1: A practical demonstration of this concept\n• Example 2: Another real-world application\n• Example 3: How this applies to common scenarios`;
          break;
      }

      if (selectedText) {
        const newContent = content.substring(0, selectionStart) + processedText + content.substring(selectionEnd);
        setContent(newContent);
        saveToHistory(newContent);
      } else {
        setContent(processedText);
        saveToHistory(processedText);
      }

      setSelectedText("");
      toast({ title: `AI ${action.replace('_', ' ')} completed` });
    } catch (error) {
      toast({ title: "AI processing failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const applyCustomPrompt = async () => {
    if (!isAIConfigured) {
      toast({ title: "Please configure AI provider first", variant: "destructive" });
      return;
    }
    if (!customPrompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const textToProcess = selectedText || content;
      // Simulated custom AI response
      const processedText = `[Custom AI Edit based on: "${customPrompt.slice(0, 30)}..."]\n\n${textToProcess}`;

      if (selectedText) {
        const newContent = content.substring(0, selectionStart) + processedText + content.substring(selectionEnd);
        setContent(newContent);
        saveToHistory(newContent);
      } else {
        setContent(processedText);
        saveToHistory(processedText);
      }

      setSelectedText("");
      setCustomPrompt("");
      toast({ title: "Custom AI edit applied" });
    } catch (error) {
      toast({ title: "AI processing failed", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const insertFormatting = (before: string, after: string = before) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = content.substring(start, end);
      const newContent = content.substring(0, start) + before + selected + after + content.substring(end);
      setContent(newContent);
      saveToHistory(newContent);
    }
  };

  const handleSave = (status: "draft" | "published" | "scheduled") => {
    if (!title.trim() || !content.trim()) {
      toast({ title: "Title and content are required", variant: "destructive" });
      return;
    }

    onSave({
      ...post,
      title,
      excerpt,
      content,
      category,
      author,
      readTime,
      image: featuredImage || undefined,
      status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-hidden flex flex-col">
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
          <Button variant="outline" size="sm" onClick={undo} disabled={historyIndex === 0}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Undo
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

      <div className="flex-1 flex overflow-hidden">
        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="content" className="flex-1 flex flex-col">
            <div className="border-b px-4 shrink-0">
              <TabsList className="h-10">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="content" className="flex-1 overflow-hidden m-0 p-4">
              <div className="h-full flex flex-col gap-4">
                {/* Title */}
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Article Title"
                  className="text-xl font-semibold"
                />

                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 p-2 bg-muted/50 rounded-lg flex-wrap">
                  <Button variant="ghost" size="sm" onClick={() => insertFormatting("<strong>", "</strong>")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertFormatting("<em>", "</em>")}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertFormatting("<h2>", "</h2>")}>
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertFormatting("<ul>\n<li>", "</li>\n</ul>")}>
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertFormatting("<ol>\n<li>", "</li>\n</ol>")}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertFormatting("<blockquote>", "</blockquote>")}>
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertFormatting('<a href="">', "</a>")}>
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertFormatting('<img src="" alt="" />', "")}>
                    <Image className="h-4 w-4" />
                  </Button>
                  
                  <div className="h-6 w-px bg-border mx-2" />
                  
                  {selectedText && (
                    <Badge variant="outline" className="text-xs">
                      {selectedText.length} chars selected
                    </Badge>
                  )}
                </div>

                {/* Content Editor */}
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                  }}
                  onSelect={handleTextSelect}
                  placeholder="Write your article content here... Select text to apply AI actions."
                  className="flex-1 resize-none font-mono text-sm min-h-[300px]"
                />

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
                  <Select value={selectedProvider} onValueChange={(v) => { setSelectedProvider(v); setSelectedModel(""); }}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select provider..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedProvider}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select model..." />
                    </SelectTrigger>
                    <SelectContent>
                      {provider?.models.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex gap-2">
                    <Input
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
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

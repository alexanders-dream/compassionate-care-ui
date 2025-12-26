import { useState, useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import ExtensionBubbleMenu from "@tiptap/extension-bubble-menu";
import ExtensionFloatingMenu from "@tiptap/extension-floating-menu";
import Placeholder from "@tiptap/extension-placeholder";
import { RichEditorMenus } from "./RichEditorMenus";
import { ImageInsertionDialog } from "./ImageInsertionDialog";
import { SchedulePopover } from "./SchedulePopover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  Wand2, RotateCcw, RotateCw, Save, X, Bold, Italic,
  List, ListOrdered, Heading2, Quote, Link2, Image as ImageIcon,
  Loader2, CheckCircle2, Calendar as CalendarIcon, Send, ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogPost, categories } from "@/data/blogPosts";
import { supabase } from "@/integrations/supabase/client";
import { getAIConfig, AIConfig } from "@/lib/ai/config";
import { useAIEditor } from "@/hooks/use-ai-editor";
import { useAIConfig } from "@/hooks/use-ai-config";
import { AISidebar } from "@/components/admin/ai/AISidebar";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

interface AITextEditorProps {
  post: BlogPost;
  onSave: (post: BlogPost & { status: "draft" | "published" | "scheduled"; scheduledAt?: string }) => void;
  onClose: () => void;
}

const AITextEditor = ({ post, onSave, onClose }: AITextEditorProps) => {
  const { toast } = useToast();

  // Content state
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [category, setCategory] = useState<BlogPost["category"]>(post.category);
  const [author, setAuthor] = useState(post.author);
  const [readTime, setReadTime] = useState(post.readTime || "");
  const [featuredImage, setFeaturedImage] = useState(post.image || "");
  const [slug, setSlug] = useState(post.slug || "");
  const [tags, setTags] = useState<string[]>(post.tags || []);
  const [tagsInput, setTagsInput] = useState(post.tags?.join(", ") || "");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(!!post.slug);

  // AI state - managed by useAIConfig hook for consistency
  const { config, setConfig } = useAIConfig();

  // Selection state for UI feedback
  const [selectedText, setSelectedText] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Auto-generate slug
  useEffect(() => {
    if (!isSlugManuallyEdited && title) {
      const generatedSlug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  }, [title, isSlugManuallyEdited]);

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagsInput(e.target.value);
    setTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean));
  };

  const categoryOptions = categories.filter(c => c.id !== "all");

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
          class: "rounded-lg max-w-full my-4",
        },
      }),
      Youtube.configure({
        controls: false,
        width: 640,
        height: 480,
        HTMLAttributes: { class: "rounded-lg max-w-full my-4 mx-auto" },
      }),
      ExtensionBubbleMenu,
      ExtensionFloatingMenu,
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

  // Calculate read time when content changes
  useEffect(() => {
    if (editor) {
      const wordCount = editor.storage.characterCount?.words?.() || editor.getText().split(/\s+/).filter(w => w.length > 0).length;
      const time = Math.ceil(wordCount / 200);
      setReadTime(`${time} min read`);
    }
  }, [editor?.getText()]);

  // Hook for AI Logic
  const { isProcessing, applyAIAction, applyCustomPrompt } = useAIEditor({ editor, config });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  }, [editor]);

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isFeaturedImageDialogOpen, setIsFeaturedImageDialogOpen] = useState(false);

  const addImage = useCallback(() => {
    setIsImageDialogOpen(true);
  }, []);

  const handleImageSelected = useCallback((url: string) => {
    if (editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleFeaturedImageSelected = useCallback((url: string) => {
    setFeaturedImage(url);
  }, []);

  const addYoutube = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter YouTube URL:");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  }, [editor]);

  const handleSave = (status: "draft" | "published" | "scheduled", scheduledDate?: Date) => {
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
      imageUrl: featuredImage || undefined, // Ensure compatibility
      slug,
      tags,
      status,
      scheduledAt: scheduledDate?.toISOString(),
    });
  };

  if (!editor) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
        <div className="flex-1 flex items-start gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onClose}
                  className="shrink-0 mt-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                Back to Posts
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="w-full">
            <AdminPageHeader
              title="Edit Article"
              description={<>Edit your blog post with AI assistance. {isProcessing && <span className="font-medium text-primary">AI is processing...</span>}</>}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area with Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 border rounded-lg overflow-hidden bg-background shadow-sm p-6">
        {/* --- Main Editor (Left/Center) --- */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex-1 flex flex-col border-0 sm:border rounded-none sm:rounded-lg shadow-none sm:shadow">
            <CardHeader className="py-4 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-3 sm:space-y-0 px-6">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Editor</CardTitle>
                {isProcessing && <span className="text-xs text-muted-foreground animate-pulse">AI is working...</span>}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                <Button variant="outline" size="sm" onClick={() => handleSave("draft")} className="flex-1 sm:flex-none px-2 sm:px-4">
                  <Save className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Save Draft</span><span className="inline sm:hidden">Save</span>
                </Button>
                <SchedulePopover
                  onSchedule={(date) => handleSave("scheduled", date)}
                  trigger={
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 px-2 sm:px-4">
                      <CalendarIcon className="h-4 w-4" />
                      <span className="inline">Schedule</span>
                    </Button>
                  }
                />
                <Button size="sm" onClick={() => handleSave("published")} className="flex-1 sm:flex-none px-2 sm:px-4">
                  <Send className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Publish</span><span className="inline sm:hidden">Post</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <Tabs defaultValue="content" className="flex-1 flex flex-col">
                <div className="border-b px-6 py-2 shrink-0 relative">
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

                <TabsContent value="content" className="flex-1 flex-col overflow-hidden m-0 data-[state=active]:flex">
                  {/* Sticky Header: Title + Toolbar */}
                  <div className="shrink-0 bg-background p-6 pb-4 space-y-4 border-b">
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

                  <RichEditorMenus
                    editor={editor}
                    onAddLink={addLink}
                    onAddImage={addImage}
                    onAddYoutube={addYoutube}
                  />

                  {/* Scrollable Content Area */}
                  <ScrollArea className="flex-1" ref={contentRef}>
                    <div className="flex flex-col gap-6 p-6">
                      {/* Rich Text Editor */}
                      <div className="min-h-[300px] border rounded-lg bg-card">
                        <EditorContent editor={editor} className="min-h-full p-6" />
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

                <TabsContent value="settings" className="flex-1 flex-col overflow-hidden !mt-0 bg-muted/10 data-[state=active]:flex">
                  <ScrollArea className="flex-1">
                    <div className="p-6 max-w-4xl mt-0 space-y-0">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* General Settings */}
                        <Card>
                          <CardHeader>
                            <CardTitle>General Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
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
                          </CardContent>
                        </Card>

                        {/* Publishing Details */}
                        <Card>
                          <CardHeader>
                            <CardTitle>Article Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <Label>Read Time</Label>
                              <Input value={readTime} onChange={(e) => setReadTime(e.target.value)} placeholder="Auto-calculated..." />
                              <p className="text-[10px] text-muted-foreground">Auto-calculated based on 200 wpm.</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Slug</Label>
                              <Input
                                value={slug}
                                onChange={(e) => {
                                  setSlug(e.target.value);
                                  setIsSlugManuallyEdited(true);
                                }}
                                placeholder="article-url-slug"
                              />
                              <p className="text-[10px] text-muted-foreground">URL slug for SEO.</p>
                            </div>
                            <div className="space-y-2">
                              <Label>Tags</Label>
                              <Input
                                value={tagsInput}
                                onChange={handleTagsChange}
                                placeholder="health, prevention, guide (comma separated)"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Media Settings */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Featured Media</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <Label>Featured Image</Label>

                          {featuredImage && (
                            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border bg-muted">
                              <img
                                src={featuredImage}
                                alt="Featured preview"
                                className="h-full w-full object-cover"
                                onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Invalid+Image")}
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 h-8 w-8 shadow-sm"
                                onClick={() => setFeaturedImage("")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}

                          <div className="flex gap-2 max-w-xl">
                            <Input
                              value={featuredImage}
                              onChange={(e) => setFeaturedImage(e.target.value)}
                              placeholder="Image URL or Upload..."
                              className="flex-1"
                            />
                            <Button
                              variant="secondary"
                              onClick={() => setIsFeaturedImageDialogOpen(true)}
                              type="button"
                            >
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Choose Image
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Upload an image or paste a URL. This will be displayed behind the article title.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* --- AI Sidebar (Right) --- */}
        <div className="lg:col-span-4 bg-muted/10">
          <AISidebar
            config={config}
            setConfig={setConfig}
            isProcessing={isProcessing}
            onAction={applyAIAction}
            onCustomPrompt={applyCustomPrompt}
          />
        </div>
      </div>

      <ImageInsertionDialog
        open={isImageDialogOpen}
        onOpenChange={setIsImageDialogOpen}
        onImageSelected={handleImageSelected}
      />
      <ImageInsertionDialog
        open={isFeaturedImageDialogOpen}
        onOpenChange={setIsFeaturedImageDialogOpen}
        onImageSelected={handleFeaturedImageSelected}
      />
    </div>
  );
};

export default AITextEditor;

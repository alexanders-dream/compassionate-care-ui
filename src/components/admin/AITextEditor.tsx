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
import {
  Wand2, RotateCcw, RotateCw, Save, X, Bold, Italic,
  List, ListOrdered, Heading2, Quote, Link2, Image as ImageIcon,
  Loader2, CheckCircle2, Calendar as CalendarIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlogPost, categories } from "@/data/blogPosts";
import { supabase } from "@/integrations/supabase/client";
import { getAIConfig, AIConfig } from "@/lib/ai/config";
import { useAIEditor } from "@/hooks/use-ai-editor";
import { useAIConfig } from "@/hooks/use-ai-config";
import { AISidebar } from "@/components/admin/ai/AISidebar";

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
          <SchedulePopover
            onSchedule={(date) => handleSave("scheduled", date)}
            trigger={
              <Button variant="outline" size="sm" className="gap-1 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                <CalendarIcon className="h-4 w-4" />
                Schedule
              </Button>
            }
          />
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

            <TabsContent value="content" className="flex-1 flex-col overflow-hidden m-0 data-[state=active]:flex">
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
                  <Button
                    variant={editor.isActive("bold") ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive("italic") ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  >
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  >
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  >
                    <Quote className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={editor.isActive("link") ? "secondary" : "ghost"}
                    size="sm"
                    onClick={addLink}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addImage}
                  >
                    <ImageIcon className="h-4 w-4" />
                  </Button>

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
        </div>

        {/* AI Sidebar */}
        <AISidebar
          config={config}
          setConfig={setConfig}
          isProcessing={isProcessing}
          onAction={applyAIAction}
          onCustomPrompt={applyCustomPrompt}
        />
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

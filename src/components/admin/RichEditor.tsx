import React, { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import ExtensionBubbleMenu from "@tiptap/extension-bubble-menu";
import ExtensionFloatingMenu from "@tiptap/extension-floating-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
    Bold, Italic, List, ListOrdered, Heading2, Heading3, Quote, Link2, Image as ImageIcon,
    Youtube as YoutubeIcon, Undo, Redo, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RichEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    className?: string;
}

const RichEditor = ({ content, onChange, placeholder = "Start writing...", className }: RichEditorProps) => {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: "text-primary underline" },
            }),
            Image.configure({
                HTMLAttributes: { class: "rounded-lg max-w-full my-4" },
            }),
            Youtube.configure({
                controls: false,
                width: 640,
                height: 480,
                HTMLAttributes: { class: "rounded-lg max-w-full my-4 mx-auto" },
            }),
            Placeholder.configure({ placeholder }),
            ExtensionBubbleMenu,
            ExtensionFloatingMenu,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: `prose prose-sm max-w-none focus:outline-none min-h-[300px] p-4 ${className}`,
            },
        },
    });

    // Sync content from prop to editor (e.g. when AI generates content)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // --- Handlers ---

    const addLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) return;

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    const addImageResult = (url: string) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('blog-media')
                .getPublicUrl(filePath);

            addImageResult(data.publicUrl);
            toast({ title: "Image uploaded successfully" });
        } catch (error: any) {
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageUrl = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const url = formData.get("url") as string;
        if (url) {
            addImageResult(url);
        }
    };

    const handleYoutubeUrl = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const url = formData.get("url") as string;
        if (url && editor) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    };

    if (!editor) return null;

    return (
        <div className="flex flex-col border rounded-md overflow-hidden bg-background relative">

            {/* Bubble Menu for Text Selection */}
            {editor && (
                <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex overflow-hidden border rounded-lg shadow-xl bg-background text-foreground">
                    <Button variant={editor.isActive("bold") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0 rounded-none">
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant={editor.isActive("italic") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 p-0 rounded-none">
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant={editor.isActive("link") ? "secondary" : "ghost"} size="sm" onClick={addLink} className="h-8 w-8 p-0 rounded-none">
                        <Link2 className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-8" />
                    <Button variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 w-8 p-0 rounded-none">
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-8 w-8 p-0 rounded-none">
                        <Heading3 className="h-4 w-4" />
                    </Button>
                </BubbleMenu>
            )}

            {/* Floating Menu for Empty Lines */}
            {editor && (
                <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex gap-1 overflow-hidden border rounded-lg shadow-xl bg-background text-foreground p-1">
                    <Button variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 w-8 p-0">
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button variant={editor.isActive("bulletList") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 p-0">
                        <List className="h-4 w-4" />
                    </Button>
                    <Button variant={editor.isActive("orderedList") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 p-0">
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                </FloatingMenu>
            )}

            {/* Main Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-muted/50 border-b flex-wrap sticky top-0 z-10">
                {/* Undo/Redo */}
                <div className="flex items-center gap-1 mr-2">
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0">
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0">
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Text Formatting */}
                <Button variant={editor.isActive("bold") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0">
                    <Bold className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("italic") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 p-0">
                    <Italic className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 w-8 p-0">
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-8 w-8 p-0">
                    <Heading3 className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("bulletList") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 p-0">
                    <List className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("orderedList") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 p-0">
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("blockquote") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="h-8 w-8 p-0">
                    <Quote className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6 mx-1" />

                {/* Media */}
                <Button variant={editor.isActive("link") ? "secondary" : "ghost"} size="sm" onClick={addLink} className="h-8 w-8 p-0">
                    <Link2 className="h-4 w-4" />
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                        <Tabs defaultValue="upload" className="w-full">
                            <TabsList className="w-full justify-start rounded-none border-b bg-muted/50 p-0 h-9">
                                <TabsTrigger value="upload" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-9 px-4 text-xs">Upload</TabsTrigger>
                                <TabsTrigger value="url" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-9 px-4 text-xs">URL</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="p-4">
                                <div className="grid w-full items-center gap-3">
                                    <Label htmlFor="image-upload" className="text-xs">Upload Image</Label>
                                    <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="h-8 text-xs file:text-xs" />
                                    {isUploading && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Uploading...</div>}
                                </div>
                            </TabsContent>
                            <TabsContent value="url" className="p-4">
                                <form onSubmit={handleImageUrl} className="grid w-full items-center gap-3">
                                    <Label htmlFor="image-url" className="text-xs">Image URL</Label>
                                    <div className="flex gap-2">
                                        <Input id="image-url" name="url" placeholder="https://..." className="h-8 text-xs" />
                                        <Button type="submit" size="sm" className="h-8 text-xs">Add</Button>
                                    </div>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <YoutubeIcon className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                        <form onSubmit={handleYoutubeUrl} className="grid w-full items-center gap-3">
                            <Label htmlFor="youtube-url" className="text-xs">YouTube URL</Label>
                            <div className="flex gap-2">
                                <Input id="youtube-url" name="url" placeholder="https://youtube.com/..." className="h-8 text-xs" />
                                <Button type="submit" size="sm" className="h-8 text-xs">Embed</Button>
                            </div>
                        </form>
                    </PopoverContent>
                </Popover>

            </div>

            {/* Content */}
            <EditorContent editor={editor} className="min-h-[300px]" />
        </div>
    );
};

export default RichEditor;

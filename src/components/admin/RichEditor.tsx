import React, { useState, useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { RichEditorMenus } from "./RichEditorMenus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Youtube from "@tiptap/extension-youtube";
import ExtensionBubbleMenu from "@tiptap/extension-bubble-menu";
import ExtensionFloatingMenu from "@tiptap/extension-floating-menu";
import { Video } from "@/lib/tiptap/VideoExtension";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Removing Popover
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ImageInsertionDialog } from "./ImageInsertionDialog";
import { VideoInsertionDialog } from "./VideoInsertionDialog";
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
    onEditorReady?: (editor: any) => void;
}

const RichEditor = ({ content, onChange, placeholder = "Start writing...", className, onEditorReady }: RichEditorProps) => {
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
            Video,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            if (onEditorReady) {
                onEditorReady(editor);
            }
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

    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);

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

    const handleImageSelected = (url: string) => {
        if (editor) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const handleVideoSelected = (url: string, type: 'youtube' | 'video') => {
        if (!editor) return;

        if (type === 'youtube') {
            editor.commands.setYoutubeVideo({ src: url });
        } else {
            editor.commands.setVideo({ src: url });
        }
    };

    if (!editor) return null;

    return (
        <div className="flex flex-col border rounded-md overflow-hidden bg-background relative">

            {/* Shared Bubble and Floating Menus */}
            <RichEditorMenus
                editor={editor}
                onAddLink={addLink}
                onAddImage={() => setIsImageDialogOpen(true)}
                onAddYoutube={() => setIsVideoDialogOpen(true)}
            />

            <ImageInsertionDialog
                open={isImageDialogOpen}
                onOpenChange={setIsImageDialogOpen}
                onImageSelected={handleImageSelected}
            />

            <VideoInsertionDialog
                open={isVideoDialogOpen}
                onOpenChange={setIsVideoDialogOpen}
                onVideoSelected={handleVideoSelected}
            />

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

                <Button variant="ghost" size="sm" onClick={() => setIsImageDialogOpen(true)} className="h-8 w-8 p-0">
                    <ImageIcon className="h-4 w-4" />
                </Button>

                <Button variant="ghost" size="sm" onClick={() => setIsVideoDialogOpen(true)} className="h-8 w-8 p-0">
                    <YoutubeIcon className="h-4 w-4" />
                </Button>

            </div>

            {/* Content */}
            <EditorContent editor={editor} className="min-h-[300px]" />
        </div >
    );
};

export default RichEditor;

import React from "react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import { Editor } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Bold, Italic, Link2, Heading2, Heading3, List, ListOrdered, Quote,
    Image as ImageIcon, Youtube as YoutubeIcon, Minus, Undo, Redo
} from "lucide-react";

interface RichEditorMenusProps {
    editor: Editor | null;
    onAddLink?: () => void;
    onAddImage?: () => void;
    onAddYoutube?: () => void;
}

export const RichEditorMenus = ({ editor, onAddLink, onAddImage, onAddYoutube }: RichEditorMenusProps) => {
    if (!editor) return null;

    // Default handlers if not provided (fallback to simple prompts)
    const handleAddLink = onAddLink || (() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    });

    const handleAddImage = onAddImage || (() => {
        const url = window.prompt("Image URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    });

    const handleAddYoutube = onAddYoutube || (() => {
        const url = window.prompt("YouTube URL");
        if (url) {
            editor.commands.setYoutubeVideo({ src: url });
        }
    });

    return (
        <>
            {/* Bubble Menu for Text Selection */}
            <BubbleMenu editor={editor} className="flex overflow-hidden border rounded-lg shadow-xl bg-background text-foreground animate-in fade-in slide-in-from-bottom-2 max-w-[90vw] flex-wrap">
                <Button variant={editor.isActive("bold") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0 rounded-none">
                    <Bold className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("italic") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 p-0 rounded-none">
                    <Italic className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("link") ? "secondary" : "ghost"} size="sm" onClick={handleAddLink} className="h-8 w-8 p-0 rounded-none">
                    <Link2 className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 w-8 p-0 rounded-none">
                    <Heading2 className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-8 w-8 p-0 rounded-none">
                    <Heading3 className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("blockquote") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="h-8 w-8 p-0 rounded-none">
                    <Quote className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant={editor.isActive("bulletList") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 p-0 rounded-none">
                    <List className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("orderedList") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 p-0 rounded-none">
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" onClick={handleAddImage} className="h-8 w-8 p-0 rounded-none">
                    <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleAddYoutube} className="h-8 w-8 p-0 rounded-none">
                    <YoutubeIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="h-8 w-8 p-0 rounded-none">
                    <Minus className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-8" />
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0 rounded-none">
                    <Undo className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0 rounded-none">
                    <Redo className="h-4 w-4" />
                </Button>
            </BubbleMenu>

            {/* Floating Menu for Empty Lines */}
            <FloatingMenu editor={editor} className="flex gap-1 overflow-hidden border rounded-lg shadow-xl bg-background text-foreground p-1 animate-in fade-in slide-in-from-bottom-2 max-w-[90vw] flex-wrap">
                <Button variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="h-8 w-8 p-0 text-xs font-semibold">
                    H2
                </Button>
                <Button variant={editor.isActive("heading", { level: 3 }) ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="h-8 w-8 p-0 text-xs font-semibold">
                    H3
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant={editor.isActive("bold") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0">
                    <Bold className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("italic") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 p-0">
                    <Italic className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("link") ? "secondary" : "ghost"} size="sm" onClick={handleAddLink} className="h-8 w-8 p-0">
                    <Link2 className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("blockquote") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBlockquote().run()} className="h-8 w-8 p-0">
                    <Quote className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant={editor.isActive("bulletList") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 p-0">
                    <List className="h-4 w-4" />
                </Button>
                <Button variant={editor.isActive("orderedList") ? "secondary" : "ghost"} size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 p-0">
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" onClick={handleAddImage} className="h-8 w-8 p-0">
                    <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleAddYoutube} className="h-8 w-8 p-0">
                    <YoutubeIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().setHorizontalRule().run()} className="h-8 w-8 p-0">
                    <Minus className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} className="h-8 w-8 p-0">
                    <Undo className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} className="h-8 w-8 p-0">
                    <Redo className="h-4 w-4" />
                </Button>
            </FloatingMenu>
        </>
    );
};

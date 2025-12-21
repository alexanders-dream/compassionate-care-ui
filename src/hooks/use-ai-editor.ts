import { useState } from "react";
import { Editor } from "@tiptap/react";
import { useToast } from "@/hooks/use-toast";
import { AIConfig } from "@/lib/ai/config";
import { Sparkles, Zap, FileText, CheckCircle2, PenLine, MessageSquare, List, RefreshCw } from "lucide-react";

export type AIAction = "rewrite" | "expand" | "summarize" | "improve" | "fix_grammar" | "make_formal" | "make_casual" | "add_examples";

export const aiActions: { id: AIAction; label: string; icon: any; description: string }[] = [
    { id: "rewrite", label: "Rewrite", icon: RefreshCw, description: "Rewrite the selected text" },
    { id: "expand", label: "Expand", icon: Zap, description: "Add more detail and depth" },
    { id: "summarize", label: "Summarize", icon: FileText, description: "Make it more concise" },
    { id: "improve", label: "Improve", icon: Sparkles, description: "Enhance writing quality" },
    { id: "fix_grammar", label: "Fix Grammar", icon: CheckCircle2, description: "Correct grammar and spelling" },
    { id: "make_formal", label: "Make Formal", icon: PenLine, description: "Professional tone" },
    { id: "make_casual", label: "Make Casual", icon: MessageSquare, description: "Friendly, conversational tone" },
    { id: "add_examples", label: "Add Examples", icon: List, description: "Include practical examples" },
];

interface UseAIEditorProps {
    editor: Editor | null;
    config: AIConfig;
}

export const useAIEditor = ({ editor, config }: UseAIEditorProps) => {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);

    const isAIConfigured = !!(config.provider && config.apiKey && config.model);

    const applyAIAction = async (action: AIAction) => {
        if (!isAIConfigured) {
            toast({ title: "Please configure AI provider first", variant: "destructive" });
            return;
        }
        if (!editor) return;

        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, " ");
        const textToProcess = selectedText || editor.getText();

        if (!textToProcess.trim()) {
            toast({ title: "No text to process", variant: "destructive" });
            return;
        }

        setIsProcessing(true);

        try {
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

            // Import callAI dynamically
            const { callAI } = await import("@/lib/ai/service");

            const processedText = await callAI({
                config,
                systemPrompt: systemPrompt,
                userPrompt: `${actionPrompts[action]}:\n\n"${textToProcess}"`
            });

            // Apply to editor
            if (selectedText) {
                // If the returned text doesn't look like HTML, wrap it
                const contentToInsert = processedText.trim().startsWith("<") ? processedText : `<p>${processedText}</p>`;
                editor.chain().focus().deleteRange({ from, to }).insertContent(contentToInsert).run();
            } else {
                // Replacing full content
                const cleanContent = processedText.replace(/^```html/, '').replace(/```$/, '').trim();
                const contentToSet = cleanContent.startsWith("<") ? cleanContent : `<p>${cleanContent}</p>`;
                editor.commands.setContent(contentToSet);
            }

            toast({ title: `AI ${action.replace("_", " ")} completed` });
        } catch (error: any) {
            console.error("AI Action failed:", error);
            toast({ title: "AI processing failed", description: error.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const applyCustomPrompt = async (prompt: string) => {
        if (!isAIConfigured) {
            toast({ title: "Please configure AI provider first", variant: "destructive" });
            return;
        }
        if (!prompt.trim() || !editor) {
            toast({ title: "Please enter a prompt", variant: "destructive" });
            return;
        }

        setIsProcessing(true);

        try {
            const { from, to } = editor.state.selection;
            const selectedText = editor.state.doc.textBetween(from, to, " ");
            const textToProcess = selectedText || editor.getText();

            const systemPrompt = "You are an expert medical content assistant. Output properly formatted HTML content (using <p>, <ul>, <li>, <strong> tags where appropriate) but do NOT wrap the entire response in markdown code blocks. Just return the raw HTML.";

            const { callAI } = await import("@/lib/ai/service");

            const processedText = await callAI({
                config,
                systemPrompt: systemPrompt,
                userPrompt: `Instruction: ${prompt}\n\nContent to process:\n"${textToProcess}"`
            });

            if (selectedText) {
                const contentToInsert = processedText.trim().startsWith("<") ? processedText : `<p>${processedText}</p>`;
                editor.chain().focus().deleteRange({ from, to }).insertContent(contentToInsert).run();
            } else {
                const cleanContent = processedText.replace(/^```html/, '').replace(/```$/, '').trim();
                const contentToSet = cleanContent.startsWith("<") ? cleanContent : `<p>${cleanContent}</p>`;
                editor.commands.setContent(contentToSet);
            }

            toast({ title: "Custom AI edit applied" });
        } catch (error: any) {
            console.error("AI Action failed:", error);
            toast({ title: "AI processing failed", description: error.message, variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        isProcessing,
        applyAIAction,
        applyCustomPrompt
    };
};

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface YoutubeInsertionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVideoSelected: (url: string) => void;
}

export function YoutubeInsertionDialog({ open, onOpenChange, onVideoSelected }: YoutubeInsertionDialogProps) {
    const [url, setUrl] = useState("");

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            onVideoSelected(url);
            onOpenChange(false);
            setUrl("");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Insert YouTube Video</DialogTitle>
                    <DialogDescription>
                        Paste the URL of the YouTube video you want to embed.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUrlSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="youtube-url">Video URL</Label>
                        <Input
                            id="youtube-url"
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={!url}>Insert Video</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

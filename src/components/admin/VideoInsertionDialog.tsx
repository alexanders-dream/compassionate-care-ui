import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, Link as LinkIcon, Image as ImageIcon, Video as VideoIcon, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadToCloudinary, listCloudinaryResources } from "@/lib/cloudinary";

interface VideoInsertionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onVideoSelected: (url: string, type: 'youtube' | 'video') => void;
}

export function VideoInsertionDialog({ open, onOpenChange, onVideoSelected }: VideoInsertionDialogProps) {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("gallery");

    // URL State
    const [url, setUrl] = useState("");

    // Upload State
    const [isUploading, setIsUploading] = useState(false);

    // Gallery State
    const [galleryVideos, setGalleryVideos] = useState<{ name: string; url: string; created_at?: string }[]>([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);

    useEffect(() => {
        if (open && activeTab === "gallery") {
            fetchGalleryVideos();
        }
    }, [open, activeTab]);

    const fetchGalleryVideos = async () => {
        setIsLoadingGallery(true);
        try {
            const { resources } = await listCloudinaryResources('video');

            const videos = resources.map(res => ({
                name: res.public_id,
                url: res.secure_url,
                created_at: res.created_at
            }));

            setGalleryVideos(videos);
        } catch (error: any) {
            console.error("Error fetching video gallery:", error);
            toast({ title: "Failed to load video gallery", description: error.message, variant: "destructive" });
        } finally {
            setIsLoadingGallery(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            toast({ title: "File too large", description: "Video must be less than 100MB", variant: "destructive" });
            return;
        }

        setIsUploading(true);
        try {
            const uploadResult = await uploadToCloudinary(file, 'video');

            onVideoSelected(uploadResult.secure_url, 'video');
            onOpenChange(false);
            toast({ title: "Video uploaded successfully" });

            // Refresh gallery in background
            fetchGalleryVideos();
        } catch (error: any) {
            console.error("Error uploading video:", error);
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            // Simple YouTube detection
            const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
            onVideoSelected(url, isYoutube ? 'youtube' : 'video');
            onOpenChange(false);
            setUrl("");
        }
    };

    const handleDeleteVideo = async (e: React.MouseEvent, videoName: string) => {
        e.stopPropagation();
        toast({ title: "Deletion not supported", description: "Please delete videos from Cloudinary dashboard.", variant: "destructive" });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Insert Video</DialogTitle>
                    <DialogDescription>
                        Upload a video, choose from gallery, or paste a URL (YouTube or direct link).
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="gallery" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="gallery">Gallery</TabsTrigger>
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="url">URL</TabsTrigger>
                    </TabsList>

                    <TabsContent value="gallery" className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <Label>Previously Uploaded Videos</Label>
                            <Button variant="ghost" size="sm" onClick={fetchGalleryVideos} disabled={isLoadingGallery}>
                                <RefreshCw className={`h-4 w-4 ${isLoadingGallery ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <ScrollArea className="h-[300px] border rounded-md p-4">
                            {isLoadingGallery ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                    <p>Loading gallery...</p>
                                </div>
                            ) : galleryVideos.length > 0 ? (
                                <div className="grid grid-cols-2 gap-4">
                                    {galleryVideos.map((video, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors bg-muted/20"
                                            onClick={() => {
                                                onVideoSelected(video.url, 'video');
                                                onOpenChange(false);
                                            }}
                                        >
                                            <div className="aspect-video w-full bg-black flex items-center justify-center">
                                                <VideoIcon className="h-8 w-8 text-white/50" />
                                            </div>
                                            <div className="p-2 text-xs truncate bg-background/90">
                                                {video.name}
                                            </div>
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => handleDeleteVideo(e, video.name)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                                    <VideoIcon className="h-10 w-10 mb-2 opacity-20" />
                                    <p>No videos found in gallery</p>
                                    <Button variant="link" onClick={() => setActiveTab("upload")}>Upload one now</Button>
                                </div>
                            )}
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="upload" className="mt-4">
                        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:bg-muted/50 transition-colors">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleFileUpload}
                                className="hidden"
                                id="video-upload"
                                disabled={isUploading}
                            />
                            <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-4">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                        <div className="space-y-1">
                                            <p className="font-medium">Uploading video...</p>
                                            <p className="text-xs text-muted-foreground">Please wait, this may take a moment</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-4 bg-primary/10 rounded-full">
                                            <Upload className="h-8 w-8 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium">Click to upload video</p>
                                            <p className="text-xs text-muted-foreground">MP4, WebM, OGG up to 50MB</p>
                                        </div>
                                    </>
                                )}
                            </label>
                        </div>
                    </TabsContent>

                    <TabsContent value="url" className="mt-4 space-y-4">
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label htmlFor="video-url">Video URL</Label>
                                <Input
                                    id="video-url"
                                    placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Supports YouTube links and direct video files (MP4, WebM).
                                </p>
                            </div>
                            <Button onClick={handleUrlSubmit} disabled={!url} className="w-full">
                                Insert Video
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

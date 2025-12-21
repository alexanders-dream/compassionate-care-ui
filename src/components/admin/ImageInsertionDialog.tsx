import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, RotateCw, Image as ImageIcon, Check, Crop as CropIcon, ZoomIn, ZoomOut, RotateCcw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/canvasUtils";
import { Slider } from "@/components/ui/slider";

interface ImageInsertionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImageSelected: (url: string) => void;
}

export function ImageInsertionDialog({ open, onOpenChange, onImageSelected }: ImageInsertionDialogProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [url, setUrl] = useState("");

    // Gallery state
    const [galleryImages, setGalleryImages] = useState<{ name: string, url: string }[]>([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);
    const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | null>(null);

    // Cropping State
    const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    const fetchGalleryImages = async () => {
        setIsLoadingGallery(true);
        try {
            const { data, error } = await supabase.storage
                .from('blog-media')
                .list('', {
                    limit: 100,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                });

            if (error) throw error;

            const images = data
                ?.filter(file => file.name !== '.emptyFolderPlaceholder')
                .map(file => {
                    const { data: { publicUrl } } = supabase.storage
                        .from('blog-media')
                        .getPublicUrl(file.name);
                    return { name: file.name, url: publicUrl };
                }) || [];

            setGalleryImages(images);
        } catch (error: any) {
            console.error("Error fetching gallery:", error);
            toast({ title: "Failed to load gallery", description: error.message, variant: "destructive" });
        } finally {
            setIsLoadingGallery(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchGalleryImages();
            setSelectedGalleryImage(null);
            setUrl("");
            setCroppingImageSrc(null);
            setZoom(1);
            setRotation(0);
        }
    }, [open]);

    // File Upload Handler (Read as Data URL first)
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            setCroppingImageSrc(reader.result as string);
        });
        reader.readAsDataURL(file);
    };

    const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropUpload = async () => {
        if (!croppingImageSrc || !croppedAreaPixels) return;

        setIsUploading(true);
        try {
            const croppedBlob = await getCroppedImg(
                croppingImageSrc,
                croppedAreaPixels,
                rotation
            );

            if (!croppedBlob) throw new Error("Failed to crop image");

            const fileName = `cropped-${Date.now()}.jpg`;
            const { error: uploadError } = await supabase.storage
                .from('blog-media')
                .upload(fileName, croppedBlob);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('blog-media')
                .getPublicUrl(fileName);

            // Refresh gallery after upload
            await fetchGalleryImages();

            // Select and close
            onImageSelected(data.publicUrl);
            onOpenChange(false);
            toast({ title: "Image cropped and uploaded!" });

        } catch (error: any) {
            console.error("Crop/Upload error", error);
            toast({ title: "Upload failed", description: error.message, variant: "destructive" });
        } finally {
            setIsUploading(false);
            setCroppingImageSrc(null); // Reset
        }
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) {
            onImageSelected(url);
            onOpenChange(false);
            setUrl("");
        }
    };

    // Delete Image Handler
    const handleDeleteImage = async (e: React.MouseEvent, imageName: string) => {
        e.stopPropagation(); // Prevent selection when clicking delete

        // Removed confirmation as requested
        // if (!window.confirm("Are you sure you want to delete this image? This cannot be undone.")) {
        //     return;
        // }

        try {
            const { error } = await supabase.storage
                .from('blog-media')
                .remove([imageName]);

            if (error) throw error;

            toast({ title: "Image deleted" });
            fetchGalleryImages(); // Refresh gallery

            // If the deleted image was selected, deselect it
            const { data } = supabase.storage.from('blog-media').getPublicUrl(imageName);
            if (selectedGalleryImage === data.publicUrl) {
                setSelectedGalleryImage(null);
            }

        } catch (error: any) {
            console.error("Error deleting image:", error);
            toast({ title: "Failed to delete image", description: error.message, variant: "destructive" });
        }
    };

    // Gallery Select Handlers
    const handleStartCrop = () => {
        if (selectedGalleryImage) {
            setCroppingImageSrc(selectedGalleryImage);
        }
    };

    const handleInsertOriginal = () => {
        if (selectedGalleryImage) {
            onImageSelected(selectedGalleryImage);
            onOpenChange(false);
        }
    };

    if (croppingImageSrc) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-4 border-b flex-shrink-0">
                        <DialogTitle>Crop Image</DialogTitle>
                    </DialogHeader>

                    <div className="relative flex-1 bg-black w-full min-h-0">
                        <Cropper
                            image={croppingImageSrc}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={undefined} // Allow free crop or set 16/9, 4/3, etc.
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                        />
                    </div>

                    <div className="p-4 bg-background border-t space-y-4 flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <span className="w-16 text-xs text-muted-foreground flex items-center gap-1"><ZoomIn className="w-3 h-3" /> Zoom</span>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(vals) => setZoom(vals[0])}
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="w-16 text-xs text-muted-foreground flex items-center gap-1"><RotateCcw className="w-3 h-3" /> Rotate</span>
                            <Slider
                                value={[rotation]}
                                min={0}
                                max={360}
                                step={1}
                                onValueChange={(vals) => setRotation(vals[0])}
                                className="flex-1"
                            />
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setCroppingImageSrc(null)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCropUpload} disabled={isUploading}>
                                {isUploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Crop & Insert
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Insert Image</DialogTitle>
                    <DialogDescription>
                        Choose from gallery, upload new, or paste URL.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="gallery" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 border-b">
                        <TabsList className="grid w-full grid-cols-3 mb-2">
                            <TabsTrigger value="gallery">Gallery</TabsTrigger>
                            <TabsTrigger value="upload">Upload</TabsTrigger>
                            <TabsTrigger value="url">URL</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="gallery" className="flex-1 flex flex-col min-h-0 m-0 p-0">
                        <div className="p-4 border-b flex justify-between items-center bg-muted/20">
                            <span className="text-xs text-muted-foreground">
                                {galleryImages.length} images found
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchGalleryImages}
                                disabled={isLoadingGallery}
                                className="h-8 gap-1.5"
                            >
                                <RotateCw className={cn("h-3.5 w-3.5", isLoadingGallery && "animate-spin")} />
                                Refresh
                            </Button>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {isLoadingGallery && galleryImages.length === 0 ? (
                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                        <p>Loading gallery...</p>
                                    </div>
                                ) : galleryImages.length > 0 ? (
                                    galleryImages.map((img) => (
                                        <div
                                            key={img.name}
                                            onClick={() => setSelectedGalleryImage(img.url)}
                                            className={cn(
                                                "group relative aspect-square border rounded-md overflow-hidden cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                                                selectedGalleryImage === img.url && "ring-2 ring-primary ring-offset-2"
                                            )}
                                        >
                                            <img
                                                src={img.url}
                                                alt={img.name}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                                loading="lazy"
                                            />
                                            {selectedGalleryImage === img.url && (
                                                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                                                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Delete Button - Visible on validation or hover */}
                                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="h-6 w-6 rounded-full opacity-90 hover:opacity-100"
                                                    onClick={(e) => handleDeleteImage(e, img.name)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground gap-2 border-2 border-dashed rounded-lg bg-muted/10">
                                        <ImageIcon className="h-10 w-10 opacity-20" />
                                        <p>No images found in gallery</p>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t bg-background flex justify-end gap-2">
                            <Button variant="outline" onClick={handleStartCrop} disabled={!selectedGalleryImage}>
                                <CropIcon className="w-4 h-4 mr-2" />
                                Crop & Insert
                            </Button>
                            <Button onClick={handleInsertOriginal} disabled={!selectedGalleryImage}>
                                <Check className="w-4 h-4 mr-2" />
                                Insert Original
                            </Button>
                        </div>
                    </TabsContent>

                    <TabsContent value="upload" className="flex-1 p-6 m-0">
                        <div className="flex flex-col items-center justify-center h-full gap-4 border-2 border-dashed rounded-lg bg-muted/10 p-8">
                            <div className="rounded-full bg-primary/10 p-4">
                                <ImageIcon className="h-8 w-8 text-primary" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-semibold text-lg">Upload an image</h3>
                                <p className="text-sm text-muted-foreground">
                                    Click to browse or drag and drop
                                </p>
                            </div>
                            <div className="relative">
                                <Input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={isUploading}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <Button disabled={isUploading} className="w-full min-w-[150px]">
                                    Select File
                                </Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="url" className="flex-1 p-6 m-0">
                        <form onSubmit={handleUrlSubmit} className="max-w-md mx-auto space-y-4 pt-8">
                            <div className="space-y-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <Input
                                    id="image-url"
                                    placeholder="https://example.com/image.jpg"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    autoFocus
                                />
                                <p className="text-xs text-muted-foreground">
                                    Paste the full URL of the image you want to insert.
                                </p>
                            </div>
                            <Button type="submit" disabled={!url} className="w-full">
                                Insert Image
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Trash2, Image as ImageIcon } from "lucide-react";
import { SiteCopySection } from "@/data/siteCopy";
import { ImageInsertionDialog } from "@/components/admin/ImageInsertionDialog";

interface SiteCopyTabProps {
    siteCopy: SiteCopySection[];
    onUpdateField: (sectionId: string, fieldKey: string, newValue: string) => void;
    onSaveSection: (sectionId: string) => void;
}

const SiteCopyTab = ({
    siteCopy,
    onUpdateField,
    onSaveSection,
}: SiteCopyTabProps) => {
    const [selectedCopyPage, setSelectedCopyPage] = useState<string>("all");
    // Track which image field's dialog is open: { sectionId, fieldKey } or null
    const [activeImageField, setActiveImageField] = useState<{ sectionId: string; fieldKey: string } | null>(null);

    const uniquePages = ["all", ...new Set(siteCopy.map(s => s.page))];
    const filteredCopySections = selectedCopyPage === "all"
        ? siteCopy
        : siteCopy.filter(s => s.page === selectedCopyPage);

    const handleImageSelected = (url: string) => {
        if (activeImageField) {
            onUpdateField(activeImageField.sectionId, activeImageField.fieldKey, url);
            setActiveImageField(null);
        }
    };

    const openImageDialog = (sectionId: string, fieldKey: string) => {
        setActiveImageField({ sectionId, fieldKey });
    };

    return (
        <div className="space-y-6">

            <div className="space-y-6">
                {filteredCopySections.map(section => (
                    <Card key={section.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Badge variant="outline" className="mb-2">{section.page}</Badge>
                                    <CardTitle className="text-lg">{section.section}</CardTitle>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={() => onSaveSection(section.id)}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {section.fields.map(field => (
                                <div key={field.key}>
                                    <Label htmlFor={`${section.id}-${field.key}`}>{field.label}</Label>
                                    {field.type === "image" ? (
                                        <div className="mt-1 space-y-3">
                                            {field.value && (
                                                <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border bg-muted">
                                                    <img
                                                        src={field.value}
                                                        alt={field.label}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => openImageDialog(section.id, field.key)}
                                                >
                                                    <ImageIcon className="h-4 w-4 mr-2" />
                                                    {field.value ? "Change Image" : "Select Image"}
                                                </Button>
                                                {field.value && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onUpdateField(section.id, field.key, "")}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Remove
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ) : field.type === "textarea" ? (
                                        <Textarea
                                            id={`${section.id}-${field.key}`}
                                            value={field.value}
                                            onChange={(e) => onUpdateField(section.id, field.key, e.target.value)}
                                            rows={3}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <Input
                                            id={`${section.id}-${field.key}`}
                                            value={field.value}
                                            onChange={(e) => onUpdateField(section.id, field.key, e.target.value)}
                                            className="mt-1"
                                        />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Image Insertion Dialog - shared across all image fields */}
            <ImageInsertionDialog
                open={activeImageField !== null}
                onOpenChange={(open) => {
                    if (!open) setActiveImageField(null);
                }}
                onImageSelected={handleImageSelected}
            />
        </div>
    );
};

export default SiteCopyTab;

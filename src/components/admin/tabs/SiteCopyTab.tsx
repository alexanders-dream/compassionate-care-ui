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
import { CheckCircle2, Trash2, Image } from "lucide-react";
import { SiteCopySection } from "@/data/siteCopy";
import { useToast } from "@/hooks/use-toast";

interface SiteCopyTabProps {
    siteCopy: SiteCopySection[];
    onUpdateField: (sectionId: string, fieldKey: string, newValue: string) => void;
    onSaveSection: (sectionId: string) => void;
    onImageUpload: (sectionId: string, fieldKey: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SiteCopyTab = ({
    siteCopy,
    onUpdateField,
    onSaveSection,
    onImageUpload,
}: SiteCopyTabProps) => {
    const [selectedCopyPage, setSelectedCopyPage] = useState<string>("all");

    const uniquePages = ["all", ...new Set(siteCopy.map(s => s.page))];
    const filteredCopySections = selectedCopyPage === "all"
        ? siteCopy
        : siteCopy.filter(s => s.page === selectedCopyPage);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Site Copy Management</h2>
                <Select value={selectedCopyPage} onValueChange={setSelectedCopyPage}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by page" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniquePages.map(page => (
                            <SelectItem key={page} value={page}>
                                {page === "all" ? "All Pages" : page}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <p className="text-sm text-muted-foreground">
                Edit the text content displayed across your website. Changes will be reflected site-wide.
            </p>

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
                                                <label
                                                    htmlFor={`${section.id}-${field.key}`}
                                                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md cursor-pointer hover:bg-secondary/80 transition-colors text-sm font-medium"
                                                >
                                                    <Image className="h-4 w-4" />
                                                    {field.value ? "Change Image" : "Upload Image"}
                                                </label>
                                                <input
                                                    type="file"
                                                    id={`${section.id}-${field.key}`}
                                                    accept="image/*"
                                                    onChange={(e) => onImageUpload(section.id, field.key, e)}
                                                    className="hidden"
                                                />
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
        </div>
    );
};

export default SiteCopyTab;

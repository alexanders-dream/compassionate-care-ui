import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import IconPicker from "@/components/admin/IconPicker";
import { PatientResource } from "@/contexts/SiteDataContext";
import { useToast } from "@/hooks/use-toast";

interface ResourcesTabProps {
    resources: PatientResource[];
    onSave: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: string) => void;
    editingResource: PatientResource | null;
    setEditingResource: (resource: PatientResource | null) => void;
    resourceIcon: string;
    setResourceIcon: (icon: string) => void;
    resourceFile: File | null;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ResourcesTab = ({
    resources,
    onSave,
    onDelete,
    editingResource,
    setEditingResource,
    resourceIcon,
    setResourceIcon,
    resourceFile,
    onFileUpload,
}: ResourcesTabProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenDialog = (resource: PatientResource | null) => {
        setEditingResource(resource);
        setResourceIcon(resource?.icon || "FileText");
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSave(e);
        setIsDialogOpen(false);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold">Patient Resources ({resources.length})</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" /> Add Resource
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingResource ? "Edit Resource" : "New Resource"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" defaultValue={editingResource?.title} required />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" defaultValue={editingResource?.description} rows={3} required />
                            </div>
                            <div>
                                <Label>Icon</Label>
                                <IconPicker value={resourceIcon} onChange={setResourceIcon} name="icon" />
                            </div>
                            <div>
                                <Label>File Upload</Label>
                                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                                    <input
                                        type="file"
                                        onChange={onFileUpload}
                                        className="hidden"
                                        id="resource-file"
                                    />
                                    <label htmlFor="resource-file" className="cursor-pointer">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-sm text-muted-foreground">
                                                {resourceFile ? resourceFile.name : "Click to upload file"}
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="url">Or External URL</Label>
                                <Input id="url" name="url" defaultValue={editingResource?.file_url || ""} placeholder="https://..." />
                            </div>
                            <Button type="submit" className="w-full">Save Resource</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {resources.map(resource => (
                    <Card key={resource.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{resource.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{resource.file_name || resource.file_url || "No file"}</p>
                            </div>
                            <Badge variant="outline" className="ml-2 shrink-0">Resource</Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(resource)}>
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(resource.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {resources.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No resources yet</p>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>File</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.map(resource => (
                            <TableRow key={resource.id}>
                                <TableCell className="font-medium">{resource.title}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">Resource</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {resource.file_name || resource.file_url || "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(resource)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => onDelete(resource.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </>
    );
};

export default ResourcesTab;

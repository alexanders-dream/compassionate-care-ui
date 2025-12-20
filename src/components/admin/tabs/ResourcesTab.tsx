import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, FileText, Upload, FolderOpen, Loader2, Check, ArrowUpDown } from "lucide-react";
import IconPicker from "@/components/admin/IconPicker";
import RoleGate from "@/components/auth/RoleGate";
import { PatientResource } from "@/contexts/SiteDataContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import AdminPagination from "../AdminPagination";

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
    isUploading?: boolean;
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
    isUploading = false,
}: ResourcesTabProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedExistingFile, setSelectedExistingFile] = useState<PatientResource | null>(null);
    const [sortField, setSortField] = useState<"title" | "type" | "file_name">("title");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [sortField, sortDirection]);

    const toggleSort = (field: "title" | "type" | "file_name") => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Filter resources that have actual uploaded files (not external URLs)
    const uploadedResources = resources.filter(r =>
        r.file_url && r.file_url.includes('patient-resources')
    );

    const handleOpenDialog = (resource: PatientResource | null) => {
        setEditingResource(resource);
        setResourceIcon(resource?.icon || "FileText");
        setSelectedExistingFile(null);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSave(e);
        if (!isUploading) {
            setIsDialogOpen(false);
            setSelectedExistingFile(null);
        }
    };

    // Close dialog when upload completes
    useEffect(() => {
        if (!isUploading && isDialogOpen) {
            // Dialog stays open during upload, closes after
        }
    }, [isUploading]);

    const sortedResources = [...resources].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case "title":
                comparison = a.title.localeCompare(b.title);
                break;
            case "type":
                comparison = 0; // Currently all are "Resource"
                break;
            case "file_name":
                const fileA = a.file_name || a.file_url || "";
                const fileB = b.file_name || b.file_url || "";
                comparison = fileA.localeCompare(fileB);
                break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
    });

    // Paginate the sorted resources
    const paginatedResources = sortedResources.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold">Patient Resources ({resources.length})</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" /> Add Resource
                            </Button>
                        </DialogTrigger>
                    </RoleGate>
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
            <div className="md:hidden space-y-4">
                {paginatedResources.map(resource => (
                    <Card key={resource.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{resource.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{resource.file_name || resource.file_url || "No file"}</p>
                            </div>
                            <Badge variant="outline" className="ml-2 shrink-0">Resource</Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(resource)}>
                                    <Pencil className="h-3 w-3 mr-1" /> Edit
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => onDelete(resource.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </RoleGate>
                        </div>
                    </Card>
                ))}
                {resources.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No resources yet</p>
                )}
                {/* Mobile Pagination */}
                <AdminPagination
                    currentPage={currentPage}
                    totalItems={sortedResources.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-200 hover:bg-slate-200">
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("title")}
                            >
                                <div className="flex items-center gap-1">
                                    Title
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("type")}
                            >
                                <div className="flex items-center gap-1">
                                    Type
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("file_name")}
                            >
                                <div className="flex items-center gap-1">
                                    File
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedResources.map((resource, index) => (
                            <TableRow key={resource.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                                <TableCell className="font-medium">{resource.title}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">Resource</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {resource.file_name || resource.file_url || "—"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(resource)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => onDelete(resource.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </RoleGate>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Desktop Pagination */}
            <div className="hidden md:block">
                <AdminPagination
                    currentPage={currentPage}
                    totalItems={sortedResources.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </>
    );
};

export default ResourcesTab;

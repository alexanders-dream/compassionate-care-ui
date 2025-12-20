import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, ArrowUpDown, Image as ImageIcon, X } from "lucide-react";
import { InsuranceProvider } from "@/contexts/SiteDataContext";
import AdminPagination from "../AdminPagination";
import { ImageInsertionDialog } from "../ImageInsertionDialog";

interface InsuranceTabProps {
    insuranceProviders: InsuranceProvider[];
    onSave: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: string) => void;
    editingProvider: InsuranceProvider | null;
    setEditingProvider: (provider: InsuranceProvider | null) => void;
    logoUrl: string;
    setLogoUrl: (url: string) => void;
    isActive: boolean;
    setIsActive: (active: boolean) => void;
}

const InsuranceTab = ({
    insuranceProviders,
    onSave,
    onDelete,
    editingProvider,
    setEditingProvider,
    logoUrl,
    setLogoUrl,
    isActive,
    setIsActive,
}: InsuranceTabProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [sortField, setSortField] = useState<"name" | "description" | "is_active">("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [sortField, sortDirection]);

    const toggleSort = (field: "name" | "description" | "is_active") => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleOpenDialog = (provider: InsuranceProvider | null) => {
        setEditingProvider(provider);
        setLogoUrl(provider?.logo_url || "");
        setIsActive(provider?.is_active ?? true);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSave(e);
        setIsDialogOpen(false);
    };

    const handleImageSelected = (url: string) => {
        setLogoUrl(url);
        setIsImageDialogOpen(false);
    };

    const sortedProviders = [...insuranceProviders].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "description":
                comparison = (a.description || "").localeCompare(b.description || "");
                break;
            case "is_active":
                comparison = (a.is_active === b.is_active) ? 0 : a.is_active ? -1 : 1;
                break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
    });

    // Paginate the sorted providers
    const paginatedProviders = sortedProviders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold">Insurance Providers ({insuranceProviders.length})</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" /> Add Provider
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProvider ? "Edit Provider" : "New Provider"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name *</Label>
                                <Input id="name" name="name" defaultValue={editingProvider?.name} required />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" defaultValue={editingProvider?.description || ""} rows={2} />
                            </div>
                            <div>
                                <Label htmlFor="payment_details">Payment Details</Label>
                                <Textarea id="payment_details" name="payment_details" defaultValue={editingProvider?.payment_details || ""} rows={3} placeholder="Coverage information, accepted plans, billing notes..." />
                            </div>
                            <div>
                                <Label>Logo</Label>
                                <div className="mt-2 flex items-center gap-3">
                                    {logoUrl ? (
                                        <div className="relative">
                                            <img src={logoUrl} alt="Logo preview" className="h-16 w-auto max-w-32 object-contain rounded border" />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={() => setLogoUrl("")}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="h-16 w-24 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                    )}
                                    <Button type="button" variant="outline" onClick={() => setIsImageDialogOpen(true)}>
                                        {logoUrl ? "Change Logo" : "Select Logo"}
                                    </Button>
                                </div>
                                <input type="hidden" name="logo_url" value={logoUrl} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="is_active">Active</Label>
                                <Switch
                                    id="is_active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                />
                                <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />
                            </div>
                            <Button type="submit" className="w-full">Save Provider</Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <ImageInsertionDialog
                    open={isImageDialogOpen}
                    onOpenChange={setIsImageDialogOpen}
                    onImageSelected={handleImageSelected}
                />
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {paginatedProviders.map(provider => (
                    <Card key={provider.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                {provider.logo_url ? (
                                    <img src={provider.logo_url} alt={provider.name} className="h-10 w-auto max-w-16 object-contain rounded" />
                                ) : (
                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                )}
                                <div>
                                    <p className="font-medium">{provider.name}</p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${provider.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {provider.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {provider.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{provider.description}</p>
                        )}
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(provider)}>
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(provider.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {insuranceProviders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No insurance providers yet</p>
                )}
                {/* Mobile Pagination */}
                <AdminPagination
                    currentPage={currentPage}
                    totalItems={sortedProviders.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-200 hover:bg-slate-200">
                            <TableHead className="w-20">Logo</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("name")}
                            >
                                <div className="flex items-center gap-1">
                                    Name
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("description")}
                            >
                                <div className="flex items-center gap-1">
                                    Description
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("is_active")}
                            >
                                <div className="flex items-center gap-1">
                                    Status
                                    <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
                                </div>
                            </TableHead>
                            <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedProviders.map((provider, index) => (
                            <TableRow key={provider.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                                <TableCell>
                                    {provider.logo_url ? (
                                        <img src={provider.logo_url} alt={provider.name} className="h-8 w-auto max-w-16 object-contain rounded" />
                                    ) : (
                                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="font-medium">{provider.name}</TableCell>
                                <TableCell className="max-w-xs truncate">{provider.description || '—'}</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${provider.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {provider.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(provider)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => onDelete(provider.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
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
                    totalItems={sortedProviders.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </>
    );
};

export default InsuranceTab;

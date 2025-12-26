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
import { Plus, Pencil, Trash2, ArrowUpDown, Image as ImageIcon, X, Shield } from "lucide-react";
import { InsuranceProvider } from "@/contexts/SiteDataContext";
import RoleGate from "@/components/auth/RoleGate";
import AdminPagination from "../AdminPagination";
import { ImageInsertionDialog } from "../ImageInsertionDialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { CardActionFooter } from "../CardActionFooter";

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
    const { hasRole } = useAuth();
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
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Insurance Providers ({insuranceProviders.length})
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" /> Add Provider
                            </Button>
                        </DialogTrigger>
                    </RoleGate>
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
                    <Card key={provider.id} className="overflow-hidden shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl bg-card transition-all active:scale-[0.99]">
                        <div className="p-4 flex items-start gap-3">
                            <div className="h-10 w-12 shrink-0 flex items-center justify-center bg-muted/50 rounded p-0.5">
                                {provider.logo_url ? (
                                    <img src={provider.logo_url} alt={provider.name} className="h-full w-full object-contain" />
                                ) : (
                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <p className="font-medium text-sm">{provider.name}</p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-medium ${provider.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                        {provider.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {provider.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{provider.description}</p>
                                )}
                            </div>
                        </div>

                        {hasRole(['admin', 'medical_staff']) && (
                            <CardActionFooter
                                actions={[
                                    {
                                        label: "Edit",
                                        icon: Pencil,
                                        onClick: () => handleOpenDialog(provider),
                                    },
                                    {
                                        label: "Delete",
                                        icon: Trash2,
                                        onClick: () => onDelete(provider.id),
                                        className: "text-destructive hover:text-destructive hover:bg-destructive/10"
                                    }
                                ]}
                            />
                        )}
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
            <div className="hidden md:block overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-0">
                            <TableHead className="w-20">Logo</TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("name")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Name
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "name" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by name {sortField === "name" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("description")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Description
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "description" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by description {sortField === "description" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("is_active")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Status
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "is_active" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by status {sortField === "is_active" ? `(${sortDirection === "asc" ? "active first" : "inactive first"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
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
                                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(provider)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => onDelete(provider.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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

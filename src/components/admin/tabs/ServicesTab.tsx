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
import { Plus, Pencil, Trash2, ArrowUpDown, Briefcase } from "lucide-react";
import IconPicker from "@/components/admin/IconPicker";
import { Service } from "@/contexts/SiteDataContext";
import { getIconByName } from "@/lib/icons";
import RoleGate from "@/components/auth/RoleGate";
import AdminPagination from "../AdminPagination";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { CardActionFooter } from "../CardActionFooter";

interface ServicesTabProps {
    services: Service[];
    onSave: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: string) => void;
    editingService: Service | null;
    setEditingService: (service: Service | null) => void;
    serviceIcon: string;
    setServiceIcon: (icon: string) => void;
}

const ServicesTab = ({
    services,
    onSave,
    onDelete,
    editingService,
    setEditingService,
    serviceIcon,
    setServiceIcon,
}: ServicesTabProps) => {
    const { hasRole } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortField, setSortField] = useState<"title" | "description" | "icon">("title");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [sortField, sortDirection]);

    const toggleSort = (field: "title" | "description" | "icon") => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleOpenDialog = (service: Service | null) => {
        setEditingService(service);
        setServiceIcon(service?.icon || "Heart");
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSave(e);
        setIsDialogOpen(false);
    };

    const sortedServices = [...services].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case "title":
                comparison = a.title.localeCompare(b.title);
                break;
            case "description":
                comparison = a.description.localeCompare(b.description);
                break;
            case "icon":
                comparison = a.icon.localeCompare(b.icon);
                break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
    });

    // Paginate the sorted services
    const paginatedServices = sortedServices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-primary" />
                    Services ({services.length})
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" /> Add Service
                            </Button>
                        </DialogTrigger>
                    </RoleGate>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingService ? "Edit Service" : "New Service"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" name="title" defaultValue={editingService?.title} required />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" defaultValue={editingService?.description} rows={3} required />
                            </div>
                            <div>
                                <Label>Icon</Label>
                                <IconPicker value={serviceIcon} onChange={setServiceIcon} name="icon" />
                            </div>
                            <Button type="submit" className="w-full">Save Service</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {paginatedServices.map(service => (
                    <Card key={service.id} className="overflow-hidden shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl bg-card transition-all active:scale-[0.99]">
                        <div className="p-4 flex items-start gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                                {(() => {
                                    const Icon = getIconByName(service.icon);
                                    return <Icon className="h-5 w-5 text-primary" />;
                                })()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium mb-1">{service.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                            </div>
                        </div>

                        {hasRole(['admin', 'medical_staff']) && (
                            <CardActionFooter
                                actions={[
                                    {
                                        label: "Edit",
                                        icon: Pencil,
                                        onClick: () => handleOpenDialog(service),
                                    },
                                    {
                                        label: "Delete",
                                        icon: Trash2,
                                        onClick: () => onDelete(service.id),
                                        className: "text-destructive hover:text-destructive hover:bg-destructive/10"
                                    }
                                ]}
                            />
                        )}
                    </Card>
                ))}
                {services.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No services yet</p>
                )}
                {/* Mobile Pagination */}
                <AdminPagination
                    currentPage={currentPage}
                    totalItems={sortedServices.length}
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
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("title")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Title
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "title" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by title {sortField === "title" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
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
                                onClick={() => toggleSort("icon")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Icon
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "icon" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by icon name {sortField === "icon" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedServices.map((service, index) => (
                            <TableRow key={service.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                                <TableCell className="font-medium">{service.title}</TableCell>
                                <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                                <TableCell>
                                    {(() => {
                                        const Icon = getIconByName(service.icon);
                                        return (
                                            <div className="flex items-center gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="p-1.5 bg-primary/10 rounded-md">
                                                                <Icon className="h-4 w-4 text-primary" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{service.icon}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                                <span className="text-xs text-muted-foreground">{service.icon}</span>
                                            </div>
                                        );
                                    })()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(service)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => onDelete(service.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
                    totalItems={sortedServices.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </>
    );
};

export default ServicesTab;

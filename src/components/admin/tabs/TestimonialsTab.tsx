import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, ArrowUpDown, MessageSquareQuote } from "lucide-react";
import { Testimonial } from "@/contexts/SiteDataContext";
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

interface TestimonialsTabProps {
    testimonials: Testimonial[];
    onSave: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: string) => void;
    editingTestimonial: Testimonial | null;
    setEditingTestimonial: (testimonial: Testimonial | null) => void;
}

const TestimonialsTab = ({
    testimonials,
    onSave,
    onDelete,
    editingTestimonial,
    setEditingTestimonial,
}: TestimonialsTabProps) => {
    const { hasRole } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [sortField, setSortField] = useState<"name" | "role" | "rating">("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [sortField, sortDirection]);

    const toggleSort = (field: "name" | "role" | "rating") => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleOpenDialog = (testimonial: Testimonial | null) => {
        setEditingTestimonial(testimonial);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSave(e);
        setIsDialogOpen(false);
    };

    const sortedTestimonials = [...testimonials].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "role":
                comparison = a.role.localeCompare(b.role);
                break;
            case "rating":
                comparison = a.rating - b.rating;
                break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
    });

    // Paginate the sorted testimonials
    const paginatedTestimonials = sortedTestimonials.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <MessageSquareQuote className="h-5 w-5 text-primary" />
                    Testimonials ({testimonials.length})
                </h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" /> Add Testimonial
                            </Button>
                        </DialogTrigger>
                    </RoleGate>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "New Testimonial"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" defaultValue={editingTestimonial?.name} required />
                            </div>
                            <div>
                                <Label htmlFor="role">Role</Label>
                                <Input id="role" name="role" defaultValue={editingTestimonial?.role} placeholder="Patient, Caregiver, etc." required />
                            </div>
                            <div>
                                <Label htmlFor="content">Testimonial</Label>
                                <Textarea id="content" name="content" defaultValue={editingTestimonial?.quote} rows={4} required />
                            </div>
                            <div>
                                <Label htmlFor="rating">Rating (1-5)</Label>
                                <Input id="rating" name="rating" type="number" min="1" max="5" defaultValue={editingTestimonial?.rating || 5} required />
                            </div>
                            <Button type="submit" className="w-full">Save Testimonial</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {paginatedTestimonials.map(testimonial => (
                    <Card key={testimonial.id} className="overflow-hidden shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl bg-card transition-all active:scale-[0.99]">
                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{testimonial.name}</p>
                                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                </div>
                                <span className="text-sm">{"⭐".repeat(testimonial.rating)}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 italic">"{testimonial.quote}"</p>
                        </div>

                        {hasRole(['admin', 'medical_staff']) && (
                            <CardActionFooter
                                actions={[
                                    {
                                        label: "Edit",
                                        icon: Pencil,
                                        onClick: () => handleOpenDialog(testimonial),
                                    },
                                    {
                                        label: "Delete",
                                        icon: Trash2,
                                        onClick: () => onDelete(testimonial.id),
                                        className: "text-destructive hover:text-destructive hover:bg-destructive/10"
                                    }
                                ]}
                            />
                        )}
                    </Card>
                ))}
                {testimonials.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No testimonials yet</p>
                )}
                {/* Mobile Pagination */}
                <AdminPagination
                    currentPage={currentPage}
                    totalItems={sortedTestimonials.length}
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
                                onClick={() => toggleSort("role")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Role
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "role" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by role {sortField === "role" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("rating")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Rating
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "rating" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by rating {sortField === "rating" ? `(${sortDirection === "asc" ? "lowest first" : "highest first"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTestimonials.map((testimonial, index) => (
                            <TableRow key={testimonial.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                                <TableCell className="font-medium">{testimonial.name}</TableCell>
                                <TableCell>{testimonial.role}</TableCell>
                                <TableCell>{"⭐".repeat(testimonial.rating)}</TableCell>
                                <TableCell className="text-right">
                                    <RoleGate allowedRoles={['admin', 'medical_staff']}>
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(testimonial)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => onDelete(testimonial.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
                    totalItems={sortedTestimonials.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>
        </>
    );
};

export default TestimonialsTab;

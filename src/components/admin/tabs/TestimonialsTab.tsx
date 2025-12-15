import { useState } from "react";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Testimonial } from "@/contexts/SiteDataContext";

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
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenDialog = (testimonial: Testimonial | null) => {
        setEditingTestimonial(testimonial);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSave(e);
        setIsDialogOpen(false);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold">Testimonials ({testimonials.length})</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" /> Add Testimonial
                        </Button>
                    </DialogTrigger>
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
            <div className="md:hidden space-y-3">
                {testimonials.map(testimonial => (
                    <Card key={testimonial.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-medium">{testimonial.name}</p>
                                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                            </div>
                            <span className="text-sm">{"⭐".repeat(testimonial.rating)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{testimonial.quote}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(testimonial)}>
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(testimonial.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {testimonials.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No testimonials yet</p>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Rating</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {testimonials.map(testimonial => (
                            <TableRow key={testimonial.id}>
                                <TableCell className="font-medium">{testimonial.name}</TableCell>
                                <TableCell>{testimonial.role}</TableCell>
                                <TableCell>{"⭐".repeat(testimonial.rating)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(testimonial)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => onDelete(testimonial.id)}>
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

export default TestimonialsTab;

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
import { FAQ } from "@/contexts/SiteDataContext";

interface FaqsTabProps {
    faqs: FAQ[];
    onSave: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: string) => void;
    editingFaq: FAQ | null;
    setEditingFaq: (faq: FAQ | null) => void;
}

const FaqsTab = ({
    faqs,
    onSave,
    onDelete,
    editingFaq,
    setEditingFaq,
}: FaqsTabProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleOpenDialog = (faq: FAQ | null) => {
        setEditingFaq(faq);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSave(e);
        setIsDialogOpen(false);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold">FAQs ({faqs.length})</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" /> Add FAQ
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingFaq ? "Edit FAQ" : "New FAQ"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="question">Question</Label>
                                <Input id="question" name="question" defaultValue={editingFaq?.question} required />
                            </div>
                            <div>
                                <Label htmlFor="answer">Answer</Label>
                                <Textarea id="answer" name="answer" defaultValue={editingFaq?.answer} rows={4} required />
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Input id="category" name="category" defaultValue={editingFaq?.category} placeholder="Services, Insurance, etc." required />
                            </div>
                            <Button type="submit" className="w-full">Save FAQ</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {faqs.map(faq => (
                    <Card key={faq.id} className="p-4">
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <p className="font-medium text-sm line-clamp-2 flex-1">{faq.question}</p>
                            <Badge variant="outline" className="shrink-0">{faq.category}</Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(faq)}>
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(faq.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {faqs.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No FAQs yet</p>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Question</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {faqs.map(faq => (
                            <TableRow key={faq.id}>
                                <TableCell className="font-medium max-w-md truncate">{faq.question}</TableCell>
                                <TableCell>{faq.category}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(faq)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => onDelete(faq.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                        <Trash2 className="h-4 w-4" />
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

export default FaqsTab;

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
import { Plus, Pencil, Trash2, User } from "lucide-react";
import { TeamMember } from "@/contexts/SiteDataContext";
import { ImageInsertionDialog } from "@/components/admin/ImageInsertionDialog";

interface TeamTabProps {
    team: TeamMember[];
    onSave: (e: React.FormEvent<HTMLFormElement>) => void;
    onDelete: (id: string) => void;
    editingTeamMember: TeamMember | null;
    setEditingTeamMember: (member: TeamMember | null) => void;
    teamMemberImage: File | null;
    teamMemberImagePreview: string | null;
    onImageSelected: (url: string) => void;
}

const TeamTab = ({
    team,
    onSave,
    onDelete,
    editingTeamMember,
    setEditingTeamMember,
    teamMemberImage,
    teamMemberImagePreview,
    onImageSelected,
}: TeamTabProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

    const handleOpenDialog = (member: TeamMember | null) => {
        setEditingTeamMember(member);
        setIsDialogOpen(true);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        onSave(e);
        setIsDialogOpen(false);
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h2 className="text-lg md:text-xl font-semibold">Team Members ({team.length})</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" /> Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingTeamMember ? "Edit Team Member" : "New Team Member"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" defaultValue={editingTeamMember?.name} required />
                            </div>
                            <div>
                                <Label htmlFor="role">Role/Title</Label>
                                <Input id="role" name="role" defaultValue={editingTeamMember?.role} required />
                            </div>
                            <div>
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea id="bio" name="bio" defaultValue={editingTeamMember?.bio} rows={3} required />
                            </div>
                            <div>
                                <Label>Profile Image</Label>
                                <div className="mt-2 space-y-3">
                                    {(teamMemberImagePreview || editingTeamMember?.image_url) && (
                                        <div className="flex items-center gap-3">
                                            <img src={teamMemberImagePreview || editingTeamMember?.image_url || ""} alt="Profile preview" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                                            <span className="text-sm text-muted-foreground">Current image</span>
                                        </div>
                                    )}
                                    <div
                                        className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                        onClick={() => setIsImageDialogOpen(true)}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-2 bg-muted rounded-full"><User className="h-5 w-5 text-muted-foreground" /></div>
                                            <span className="text-sm text-muted-foreground">Click to select image</span>
                                        </div>
                                    </div>
                                    <ImageInsertionDialog
                                        open={isImageDialogOpen}
                                        onOpenChange={setIsImageDialogOpen}
                                        onImageSelected={onImageSelected}
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Save Team Member</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {team.map(member => (
                    <Card key={member.id} className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                            {member.image_url && <img src={member.image_url} alt={member.name} className="w-12 h-12 rounded-full object-cover shrink-0" />}
                            <div className="flex-1 min-w-0">
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-muted-foreground">{member.role}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{member.bio}</p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenDialog(member)}>
                                <Pencil className="h-3 w-3 mr-1" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDelete(member.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </Card>
                ))}
                {team.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No team members yet</p>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-200 hover:bg-slate-200">
                            <TableHead className="text-slate-700 font-semibold">Name</TableHead>
                            <TableHead className="text-slate-700 font-semibold">Role</TableHead>
                            <TableHead className="text-slate-700 font-semibold">Bio</TableHead>
                            <TableHead className="text-right text-slate-700 font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {team.map((member, index) => (
                            <TableRow key={member.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
                                <TableCell className="font-medium">{member.name}</TableCell>
                                <TableCell>{member.role}</TableCell>
                                <TableCell className="max-w-xs truncate">{member.bio}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(member)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => onDelete(member.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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

export default TeamTab;

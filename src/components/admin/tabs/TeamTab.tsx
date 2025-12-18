import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, User, Shield, Key, Eye, EyeOff } from "lucide-react";
import { TeamMember } from "@/contexts/SiteDataContext";
import { ImageInsertionDialog } from "@/components/admin/ImageInsertionDialog";
import { Badge } from "@/components/ui/badge";

// Extended Type for the Unified View
export interface EnhancedTeamMember extends TeamMember {
    email?: string; // from Profile/User
    system_role?: string; // from UserRoles
    user_id?: string; // link to auth user
}

interface TeamTabProps {
    team: EnhancedTeamMember[];
    onSave: (memberData: any, isNew: boolean, password?: string) => Promise<void>;
    onDelete: (id: string, userId?: string) => Promise<void>;
    onPasswordReset?: (userId: string, newPassword: string) => Promise<void>;

    // Legacy/State Props
    editingTeamMember: EnhancedTeamMember | null;
    setEditingTeamMember: (member: EnhancedTeamMember | null) => void;
    teamMemberImagePreview: string | null;
    onImageSelected: (url: string) => void;
}

const TeamTab = ({
    team,
    onSave,
    onDelete,
    onPasswordReset,
    editingTeamMember,
    setEditingTeamMember,
    teamMemberImagePreview,
    onImageSelected,
}: TeamTabProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [activeTab, setActiveTab] = useState("public");

    // Password Reset State (for existing users)
    const [resetPassword, setResetPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    const handleOpenDialog = (member: EnhancedTeamMember | null) => {
        setEditingTeamMember(member);
        setActiveTab("public");
        setResetPassword("");
        setShowPassword(false);
        setShowResetPassword(false);
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData(e.currentTarget);

            // Construct data object
            const data: any = {
                // Public Data
                name: formData.get("name"),
                role: formData.get("role"), // Job Title
                bio: formData.get("bio"),
                image_url: teamMemberImagePreview || editingTeamMember?.image_url,
                display_order: editingTeamMember?.display_order,

                // System Data
                email: formData.get("email"),
                system_role: formData.get("system_role"),

                // Meta
                id: editingTeamMember?.id,
                user_id: editingTeamMember?.user_id
            };

            const password = formData.get("password") as string; // For new users

            await onSave(data, !editingTeamMember, password);

            // Handle separate password reset for existing users if provided
            if (editingTeamMember && resetPassword && onPasswordReset && editingTeamMember.user_id) {
                await onPasswordReset(editingTeamMember.user_id, resetPassword);
            }

            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to save:", error);
            // Error handling usually done in parent
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <div>
                    <h2 className="text-lg md:text-xl font-semibold">User & Team Management</h2>
                    <p className="text-sm text-muted-foreground">Manage system access and public team profiles.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" /> Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingTeamMember ? "Edit User / Team Member" : "New User / Team Member"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit}>
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="public">Public Details</TabsTrigger>
                                    <TabsTrigger value="account">Account Settings</TabsTrigger>
                                </TabsList>

                                {/* PUBLIC DETAILS TAB */}
                                <TabsContent value="public" className="space-y-4">
                                    <div className="p-4 bg-muted/30 rounded-lg space-y-4 border">
                                        <div>
                                            <Label htmlFor="name">Display Name</Label>
                                            <Input id="name" name="name" defaultValue={editingTeamMember?.name} required placeholder="e.g. Dr. Jane Smith" />
                                        </div>
                                        <div>
                                            <Label htmlFor="role">Job Title (Public)</Label>
                                            <Input id="role" name="role" defaultValue={editingTeamMember?.role} required placeholder="e.g. Senior Wound Specialist" />
                                        </div>
                                        <div>
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea id="bio" name="bio" defaultValue={editingTeamMember?.bio || ""} rows={3} placeholder="Short professional biography..." />
                                        </div>
                                        <div>
                                            <Label>Profile Image</Label>
                                            <div className="mt-2 flex items-center gap-4">
                                                {(teamMemberImagePreview || editingTeamMember?.image_url) ? (
                                                    <img src={teamMemberImagePreview || editingTeamMember?.image_url || ""} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-border" />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
                                                        <User className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <Button type="button" variant="outline" size="sm" onClick={() => setIsImageDialogOpen(true)}>
                                                    Select Image
                                                </Button>
                                                <ImageInsertionDialog
                                                    open={isImageDialogOpen}
                                                    onOpenChange={setIsImageDialogOpen}
                                                    onImageSelected={onImageSelected}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* ACCOUNT SETTINGS TAB */}
                                <TabsContent value="account" className="space-y-4">
                                    <div className="p-4 bg-muted/30 rounded-lg space-y-4 border">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Shield className="h-4 w-4 text-primary" />
                                            <h3 className="font-semibold text-sm">System Access Controls</h3>
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                defaultValue={editingTeamMember?.email}
                                                // If editing existing user, email might be read-only depending on auth flow implementation
                                                // For now, let's allow editing for display, backend handles logic
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="system_role">System Role (RBAC)</Label>
                                            <Select name="system_role" defaultValue={editingTeamMember?.system_role || "user"}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="user">User (Standard)</SelectItem>
                                                    <SelectItem value="admin">Administrator</SelectItem>
                                                    <SelectItem value="medical_staff">Medical Staff</SelectItem>
                                                    <SelectItem value="front_office">Front Office</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Determines what sections of the dashboard they can access.
                                            </p>
                                        </div>

                                        <div className="border-t pt-4 mt-2">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Key className="h-4 w-4 text-primary" />
                                                <h3 className="font-semibold text-sm">Password Management</h3>
                                            </div>

                                            {!editingTeamMember ? (
                                                <div className="space-y-2">
                                                    <Label htmlFor="password">Initial Password</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            name="password"
                                                            type={showPassword ? "text" : "password"}
                                                            required
                                                            minLength={6}
                                                            className="pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                            tabIndex={-1}
                                                        >
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Set a temporary password for the new user.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Label htmlFor="reset_password">Reset Password</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="reset_password"
                                                            value={resetPassword}
                                                            onChange={(e) => setResetPassword(e.target.value)}
                                                            type={showResetPassword ? "text" : "password"}
                                                            minLength={6}
                                                            placeholder="Enter new password to reset"
                                                            className="pr-10"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowResetPassword(!showResetPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                                            tabIndex={-1}
                                                        >
                                                            {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">Leave blank to keep existing password.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <div className="mt-6 flex justify-end gap-3">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save User"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Desktop Table - Unified View */}
            <div className="hidden md:block overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>User</TableHead>
                            <TableHead>Public Role</TableHead>
                            <TableHead>System Access</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {team.map((member) => (
                            <TableRow key={member.id} className="hover:bg-muted/5">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden">
                                            {member.image_url ? (
                                                <img src={member.image_url} alt={member.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                                                    {member.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">{member.name}</p>
                                            <p className="text-xs text-muted-foreground">{member.email || "No email linked"}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>{member.role}</TableCell>
                                <TableCell>
                                    <Badge variant={member.system_role === 'admin' ? "default" : "secondary"}>
                                        {member.system_role || 'User'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(member)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(member.id, member.user_id)}
                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {team.map((member) => (
                    <Card key={member.id} className="p-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted overflow-hidden shrink-0">
                                {member.image_url ? (
                                    <img src={member.image_url} alt={member.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium">
                                        {member.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium truncate">{member.name}</h3>
                                        <p className="text-xs text-muted-foreground">{member.role}</p>
                                    </div>
                                    <Badge variant={member.system_role === 'admin' ? "default" : "secondary"} className="text-[10px] px-1.5 py-0 h-5">
                                        {member.system_role || 'User'}
                                    </Badge>
                                </div>

                                <div className="mt-3 flex justify-end gap-2">
                                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleOpenDialog(member)}>
                                        Edit
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => onDelete(member.id, member.user_id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
};

export default TeamTab;

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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, User, Shield, Key, Eye, EyeOff, ArrowUpDown, Users } from "lucide-react";
import { TeamMember } from "@/contexts/SiteDataContext";
import RoleGate from "@/components/auth/RoleGate";
import { ImageInsertionDialog } from "@/components/admin/ImageInsertionDialog";
import { Badge } from "@/components/ui/badge";
import AdminPagination from "../AdminPagination";
import { useToast } from "@/hooks/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";


// Extended Type for the Unified View
export interface EnhancedTeamMember extends TeamMember {
    email?: string; // from Profile/User
    system_role?: string; // from UserRoles
    user_id?: string; // link to auth user
    is_public: boolean;
}

interface TeamTabProps {
    team: EnhancedTeamMember[];
    onSave: (memberData: any, isNew: boolean, password?: string) => Promise<void>;
    onDelete: (id: string, userId?: string) => Promise<void>;
    onCredentialsUpdate?: (userId: string, email?: string, newPassword?: string) => Promise<void>;

    // Legacy/State Props
    editingTeamMember: EnhancedTeamMember | null;
    setEditingTeamMember: (member: EnhancedTeamMember | null) => void;
    teamMemberImagePreview: string | null;
    onImageSelected: (url: string) => void;
    onVisibilityChange: (id: string, newVisibility: boolean) => Promise<void>;
}

const TeamTab = ({
    team,
    onSave,
    onDelete,
    onCredentialsUpdate,
    editingTeamMember,
    setEditingTeamMember,
    teamMemberImagePreview,
    onImageSelected,
    onVisibilityChange,
}: TeamTabProps) => {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<EnhancedTeamMember | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [sortField, setSortField] = useState<"name" | "role" | "is_public" | "system_role">("name");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when sort changes
    useEffect(() => {
        setCurrentPage(1);
    }, [sortField, sortDirection]);

    const toggleSort = (field: "name" | "role" | "is_public" | "system_role") => {
        if (field === sortField) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Form State (Controlled Inputs)
    const [activeTab, setActiveTab] = useState("public");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const [bio, setBio] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [email, setEmail] = useState("");
    const [systemRole, setSystemRole] = useState("user");
    const [password, setPassword] = useState("");

    // Password Reset State
    const [resetPassword, setResetPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showResetPassword, setShowResetPassword] = useState(false);

    // Initialize State
    useEffect(() => {
        if (isDialogOpen) {
            if (editingTeamMember) {
                setName(editingTeamMember.name || "");
                setRole(editingTeamMember.role || "");
                setBio(editingTeamMember.bio || "");
                setIsPublic(editingTeamMember.is_public ?? true);
                setEmail(editingTeamMember.email || "");
                setSystemRole(editingTeamMember.system_role || "user");
            } else {
                setName("");
                setRole("");
                setBio("");
                setIsPublic(true);
                setEmail("");
                setSystemRole("user");
                setPassword("");
            }
            setResetPassword("");
            setShowPassword(false);
            setShowResetPassword(false);
        }
    }, [isDialogOpen, editingTeamMember]);

    const handleOpenDialog = (member: EnhancedTeamMember | null) => {
        setEditingTeamMember(member);
        setActiveTab("public");
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Validate: If creating a system user, both email and password are required
            if (!editingTeamMember && (email || password)) {
                if (!email || !password) {
                    toast({
                        title: "Incomplete Account Settings",
                        description: "Both email and password are required to create a system user. Leave both blank for a public-only member.",
                        variant: "destructive"
                    });
                    setIsSaving(false);
                    return;
                }
            }

            // Construct data object from State
            const data: any = {
                name,
                role,
                bio,
                image_url: teamMemberImagePreview || editingTeamMember?.image_url,
                display_order: editingTeamMember?.display_order,
                is_public: isPublic,
                email,
                system_role: systemRole,
                id: editingTeamMember?.id,
                user_id: editingTeamMember?.user_id
            };

            await onSave(data, !editingTeamMember, password);
            // Handle credential updates for existing users (email/password)
            if (editingTeamMember && onCredentialsUpdate && editingTeamMember.user_id) {
                const emailChanged = email !== editingTeamMember.email;
                if (emailChanged || resetPassword) {
                    await onCredentialsUpdate(
                        editingTeamMember.user_id,
                        emailChanged ? email : undefined,
                        resetPassword || undefined
                    );
                }
            }

            setIsDialogOpen(false);
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await onDelete(itemToDelete.id, itemToDelete.user_id);
            setItemToDelete(null);
        }
    };

    const sortedTeam = [...team].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "role":
                comparison = a.role.localeCompare(b.role);
                break;
            case "is_public":
                comparison = (a.is_public === b.is_public) ? 0 : a.is_public ? -1 : 1;
                break;
            case "system_role":
                comparison = (a.system_role || "").localeCompare(b.system_role || "");
                break;
        }
        return sortDirection === "asc" ? comparison : -comparison;
    });

    // Paginate the sorted team
    const paginatedTeam = sortedTeam.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team Members ({team.length})
                </h2>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <RoleGate allowedRoles={['admin']}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog(null)} className="w-full sm:w-auto">
                                <Plus className="h-4 w-4 mr-2" /> Add Member
                            </Button>
                        </DialogTrigger>
                    </RoleGate>
                    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>{editingTeamMember ? "Edit User / Team Member" : "New User / Team Member"}</DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} autoComplete="off">
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
                                            <Input
                                                id="name"
                                                name="name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                placeholder="e.g. Dr. Jane Smith"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="role">Job Title (Public)</Label>
                                            <Input
                                                id="role"
                                                name="role"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                required
                                                placeholder="e.g. Senior Wound Specialist"
                                                autoComplete="off"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="bio">Bio</Label>
                                            <Textarea
                                                id="bio"
                                                name="bio"
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                rows={3}
                                                placeholder="Short professional biography..."
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2 border p-3 rounded-md bg-background">
                                            <Switch
                                                id="is_public"
                                                name="is_public"
                                                checked={isPublic}
                                                onCheckedChange={setIsPublic}
                                            />
                                            <Label htmlFor="is_public" className="cursor-pointer">
                                                Show on Website (About Us Page)
                                            </Label>
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
                                            <Label htmlFor="email">Email Address {email && <span className="text-red-500">*</span>}</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoComplete="new-password" // Often works better to stop generic autofill
                                                required={!!(email || password)} // Only required if creating a system user (any account field filled)
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">Leave blank to create a public-only team member without system access.</p>
                                        </div>

                                        <div>
                                            <Label htmlFor="system_role">System Role (RBAC)</Label>
                                            <RoleGate allowedRoles={['admin']} fallback={<p className="text-sm text-foreground/80 py-2">{systemRole}</p>}>
                                                <Select name="system_role" value={systemRole} onValueChange={setSystemRole}>
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
                                            </RoleGate>
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
                                                    <Label htmlFor="password">Initial Password {password && <span className="text-red-500">*</span>}</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="password"
                                                            name="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            type={showPassword ? "text" : "password"}
                                                            required={!!(email || password)} // Only required if creating a system user
                                                            minLength={6}
                                                            className="pr-10"
                                                            autoComplete="new-password"
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
                                                    <p className="text-xs text-muted-foreground">Leave blank for public-only member. Required if email is provided.</p>
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
                                                            autoComplete="new-password"
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
                        <TableRow className="bg-muted/50 hover:bg-muted/50 border-b-0">
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("name")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                User
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
                                                Public Role
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
                                onClick={() => toggleSort("is_public")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                Visibility
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "is_public" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by visibility {sortField === "is_public" ? `(${sortDirection === "asc" ? "visible first" : "hidden first"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead
                                className="cursor-pointer hover:bg-muted/50 select-none"
                                onClick={() => toggleSort("system_role")}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1">
                                                System Access
                                                <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === "system_role" ? "text-primary" : "text-muted-foreground"}`} />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="text-xs">Click to sort by system role {sortField === "system_role" ? `(${sortDirection === "asc" ? "A-Z" : "Z-A"})` : ""}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>
                            <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTeam.map((member, index) => (
                            <TableRow key={member.id} className={index % 2 === 1 ? "bg-muted/50" : ""}>
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
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            checked={member.is_public}
                                            onCheckedChange={(checked) => onVisibilityChange(member.id, checked)}
                                        />
                                        <span className={`text-xs ${member.is_public ? 'text-green-600' : 'text-muted-foreground'}`}>
                                            {member.is_public ? 'Visible' : 'Hidden'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        member.system_role === 'admin' ? "default" :
                                            member.system_role === 'Public Only' ? "outline" :
                                                "secondary"
                                    } className="capitalize">
                                        {member.system_role === 'Public Only' ? 'Public Only' :
                                            (member.system_role || 'User').replace(/_/g, ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(member)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <RoleGate allowedRoles={['admin']}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setItemToDelete(member)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
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
                    totalItems={sortedTeam.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {paginatedTeam.map((member) => (
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
                                        <div className="flex items-center gap-2">
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-muted-foreground">{member.role}</p>
                                            <div className="flex items-center gap-1.5 ml-2">
                                                <Switch
                                                    id={`mobile-vis-${member.id}`}
                                                    className="h-5 w-9"
                                                    checked={member.is_public}
                                                    onCheckedChange={(checked) => onVisibilityChange(member.id, checked)}
                                                />
                                                <Label htmlFor={`mobile-vis-${member.id}`} className="text-[10px] text-muted-foreground font-normal">
                                                    {member.is_public ? 'Visible' : 'Hidden'}
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        member.system_role === 'admin' ? "default" :
                                            member.system_role === 'Public Only' ? "outline" :
                                                "secondary"
                                    } className="text-[10px] px-1.5 py-0 h-5 capitalize">
                                        {member.system_role === 'Public Only' ? 'Public Only' :
                                            (member.system_role || 'User').replace(/_/g, ' ')}
                                    </Badge>
                                </div>

                                <div className="mt-3 flex justify-end gap-2">
                                    <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleOpenDialog(member)}>
                                        Edit
                                    </Button>
                                    <RoleGate allowedRoles={['admin']}>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive" onClick={() => setItemToDelete(member)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </RoleGate>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
                {/* Mobile Pagination */}
                <AdminPagination
                    currentPage={currentPage}
                    totalItems={sortedTeam.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setItemsPerPage}
                />
            </div>

            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove <span className="font-semibold">{itemToDelete?.name}</span> from the team.
                            {itemToDelete?.user_id && " This will also delete their system access and user account."}
                            <br />
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete User
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default TeamTab;

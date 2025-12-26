import { useState, useEffect } from "react";
import { useSiteData } from "@/contexts/SiteDataContext"; // Keeping for cache invalidation if needed
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeamTab, { EnhancedTeamMember } from "@/components/admin/tabs/TeamTab";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const TeamPage = () => {
    // We use local state for the Unified View instead of just SiteData, 
    // because SiteData only has public team info, not email/roles.
    const [unifiedTeam, setUnifiedTeam] = useState<EnhancedTeamMember[]>([]);
    const [loading, setLoading] = useState(true);

    // For modifying the global context if needed
    const { setTeamMembers, teamMembers } = useSiteData();
    const { toast } = useToast();

    // UI States
    const [editingTeamMember, setEditingTeamMember] = useState<EnhancedTeamMember | null>(null);
    const [teamMemberImagePreview, setTeamMemberImagePreview] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Public Team Data
            const { data: teamData, error: teamError } = await supabase
                .from("team_members")
                .select("*")
                .order("display_order", { ascending: true });

            if (teamError) throw teamError;

            // 2. Fetch All Profiles (Auth Metadata)
            const { data: profilesData, error: profilesError } = await supabase
                .from("profiles")
                .select("*");

            if (profilesError) throw profilesError;

            // 3. Fetch All User Roles
            const { data: rolesData, error: rolesError } = await supabase
                .from("user_roles")
                .select("*");

            if (rolesError) throw rolesError;

            // Merge Data
            const teamByUserId = new Map(teamData.filter(t => (t as any).user_id).map(t => [(t as any).user_id, t]));
            // Only use name mapping for team members who DO NOT have a linked user_id yet
            const teamByName = new Map(teamData.filter(t => !(t as any).user_id).map(t => [t.name.toLowerCase(), t]));

            const roleMap = new Map(rolesData.map(r => [r.user_id, r.role]));

            const merged: EnhancedTeamMember[] = [];
            const processedTeamIds = new Set<string>();

            // Add Profiles (System Users)
            profilesData.forEach(p => {
                let teamMem = teamByUserId.get(p.user_id);

                // Fallback: Try to match by name if not linked by ID, but only if that name entry hasn't been claimed
                if (!teamMem && p.full_name) {
                    const potentialMem = teamByName.get(p.full_name.toLowerCase());
                    if (potentialMem && !processedTeamIds.has(potentialMem.id)) {
                        teamMem = potentialMem;
                    }
                }

                if (teamMem) {
                    processedTeamIds.add(teamMem.id);
                    merged.push({
                        ...teamMem, // Inherit Public Props
                        email: p.email || "",
                        system_role: roleMap.get(p.user_id) || "user",
                        user_id: p.user_id, // Ensure this link is known
                        is_public: (teamMem as any).is_public ?? true
                    });
                } else {
                    // User exists but has no public Team Member entry yet (or name collision prevented linking)
                    merged.push({
                        id: "temp_" + p.user_id, // Virtual ID
                        name: p.full_name || "Unknown User",
                        role: "System User", // Placeholder public role
                        bio: "",
                        image_url: p.avatar_url,
                        display_order: 999,
                        is_public: false, // Default to hidden since they aren't in team_members yet
                        // Enhanced props
                        email: p.email || "",
                        system_role: roleMap.get(p.user_id) || "user",
                        user_id: p.user_id
                    });
                }
            });

            // Add remaining Team Members (No Auth Profile linked)
            teamData.forEach(t => {
                if (!processedTeamIds.has(t.id)) {
                    merged.push({
                        ...t,
                        is_public: (t as any).is_public ?? true,
                        system_role: "Public Only" // Indicator
                    });
                }
            });

            setUnifiedTeam(merged);
            setTeamMembers(teamData.map(t => ({ ...t, is_public: (t as any).is_public ?? true }))); // Update global cache

        } catch (error) {
            console.error("Error fetching unified team data:", error);
            toast({ title: "Failed to load team data", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTeamMemberImageSelected = (url: string) => {
        setTeamMemberImagePreview(url);
        toast({ title: "Image selected" });
    };

    const handleAdminUpdateCredentials = async (userId: string, email?: string, newPassword?: string) => {
        if (!email && !newPassword) return;

        try {
            const { data: responseData, error: funcError } = await supabase.functions.invoke('update-user', {
                body: {
                    userId,
                    email: email || undefined,
                    password: newPassword || undefined
                }
            });

            if (funcError) throw funcError;
            if (responseData?.error) throw new Error(responseData.error);

            if (responseData?.warning) {
                toast({
                    title: "Updated with warnings",
                    description: responseData.warning + (responseData.errors ? " " + responseData.errors.join(", ") : ""),
                    variant: "destructive"
                });
            } else {
                const updates = [];
                if (responseData?.emailUpdated) updates.push("email");
                if (responseData?.passwordUpdated) updates.push("password");
                toast({ title: `User ${updates.join(" and ")} updated successfully` });
            }

            fetchData(); // Refresh the list
        } catch (error: any) {
            console.error("Credential update error:", error);
            toast({
                title: "Update failed",
                description: error.message || "Failed to update user credentials. Make sure the 'update-user' edge function is deployed.",
                variant: "destructive"
            });
        }
    };

    const handleSaveUser = async (data: any, isNew: boolean, password?: string) => {
        try {
            // PATH 1: Create/Convert to System User (with account credentials)
            if (data.email && password && !data.user_id) {
                console.log("PATH 1: Creating system user with account");
                const { data: responseData, error: funcError } = await supabase.functions.invoke('create-user', {
                    body: {
                        email: data.email,
                        password: password,
                        name: data.name,
                        role: data.role,
                        bio: data.bio,
                        image_url: data.image_url,
                        is_public: data.is_public ?? true,
                        system_role: data.system_role,
                        // If this is an existing team member, pass its ID to update instead of creating duplicate
                        team_member_id: (!isNew && data.id && !data.id.startsWith('temp_')) ? data.id : undefined
                    }
                });

                if (funcError) throw funcError;
                if (responseData?.error) throw new Error(responseData.error);

                if (responseData?.warning) {
                    toast({
                        title: "User created with warnings",
                        description: responseData.warning + (responseData.errors ? " " + responseData.errors.join(", ") : ""),
                        variant: "destructive"
                    });
                } else {
                    toast({ title: "User created successfully", description: "Account created and linked to team member." });
                }
                fetchData();
                setEditingTeamMember(null);
                setTeamMemberImagePreview(null);
                return;
            }

            // PATH 2: Create/Update Public-Only Team Member (no account)
            if (!data.user_id) {
                console.log("PATH 2: Creating/updating public-only team member");
                let teamMemberId = data.id;

                if (isNew || (teamMemberId && teamMemberId.startsWith("temp_"))) {
                    // Create new public-only member
                    const { data: newTeam, error } = await supabase
                        .from("team_members")
                        .insert({
                            name: data.name,
                            role: data.role,
                            bio: data.bio,
                            image_url: data.image_url,
                            is_public: data.is_public ?? true,
                            display_order: 100
                        })
                        .select()
                        .single();

                    if (error) throw error;
                    toast({ title: "Team member created", description: "Public-only member added successfully." });
                } else {
                    // Update existing public-only member
                    const { error } = await supabase
                        .from("team_members")
                        .update({
                            name: data.name,
                            role: data.role,
                            bio: data.bio,
                            image_url: data.image_url,
                            is_public: data.is_public
                        })
                        .eq("id", teamMemberId);

                    if (error) throw error;
                    toast({ title: "Team member updated", description: "Public details updated successfully." });
                }

                fetchData();
                setEditingTeamMember(null);
                setTeamMemberImagePreview(null);
                return;
            }

            // PATH 3: Update Existing System User's Public Details (has account, updating profile only)
            if (data.user_id && !isNew) {
                console.log("PATH 3: Updating existing system user's public details");

                // Update team member public details
                const { error: teamError } = await supabase
                    .from("team_members")
                    .update({
                        name: data.name,
                        role: data.role,
                        bio: data.bio,
                        image_url: data.image_url,
                        is_public: data.is_public
                    })
                    .eq("id", data.id);

                if (teamError) throw teamError;

                // Update system role if changed
                const { data: existingRole } = await supabase
                    .from("user_roles")
                    .select("*")
                    .eq("user_id", data.user_id)
                    .maybeSingle();

                if (existingRole) {
                    if (existingRole.role !== data.system_role) {
                        await supabase.from("user_roles").update({ role: data.system_role }).eq("user_id", data.user_id);
                    }
                } else {
                    await supabase.from("user_roles").insert({ user_id: data.user_id, role: data.system_role });
                }

                toast({ title: "User updated", description: "Profile details updated successfully." });
                fetchData();
                setEditingTeamMember(null);
                setTeamMemberImagePreview(null);
                return;
            }

            // Fallback (should not reach here)
            toast({ title: "Saved successfully" });
            fetchData();

        } catch (error: any) {
            console.error("Save error:", error);
            toast({ title: "Error saving", description: error.message, variant: "destructive" });
        }

        setEditingTeamMember(null);
        setTeamMemberImagePreview(null);
    };

    const handleDelete = async (id: string, userId?: string) => {
        try {
            // 1. Delete Team Member Entry (Public Profile)
            if (!id.startsWith("temp_")) {
                const { error } = await supabase.from("team_members").delete().eq("id", id);
                if (error) throw error;
            }

            // 2. Delete System User (Auth & Roles) using Edge Function
            if (userId) {
                const { data: resData, error: funcError } = await supabase.functions.invoke('delete-user', {
                    body: { userId }
                });

                if (funcError || resData?.error) {
                    console.error("Edge function delete error:", funcError);
                    // Fallback: If edge function fails (not deployed?), try to at least remove access role
                    // but warn user.
                    await supabase.from("user_roles").delete().eq("user_id", userId);
                    toast({
                        title: "Partial Deletion",
                        description: "Removed public profile and access role. Deploy 'delete-user' function to fully remove auth account.",
                        variant: "destructive"
                    });
                } else {
                    toast({ title: "User and Member removed" });
                }
            } else {
                toast({ title: "Member removed" });
            }

            setUnifiedTeam(unifiedTeam.filter(m => m.id !== id));
            fetchData();
        } catch (error: any) {
            console.error("Error deleting:", error);
            toast({ title: "Error deleting", description: error.message, variant: "destructive" });
        }
    };

    const handleVisibilityChange = async (id: string, newVisibility: boolean) => {
        // Optimistic Update
        setUnifiedTeam(prev => prev.map(m => m.id === id ? { ...m, is_public: newVisibility } : m));

        try {
            if (id.startsWith("temp_")) {
                // It's a system user not in team_members yet. We need to "add" them to the team_members table.
                const member = unifiedTeam.find(m => m.id === id);
                if (!member) return;

                const { data: newTeam, error } = await supabase
                    .from("team_members")
                    .insert({
                        name: member.name,
                        role: member.role, // "System User" usually
                        bio: "",
                        image_url: member.image_url,
                        is_public: newVisibility,
                        display_order: 100,
                        user_id: member.user_id
                    })
                    .select()
                    .single();

                if (error) throw error;

                // Update local state with real ID
                setUnifiedTeam(prev => prev.map(m => m.id === id ? { ...m, ...newTeam, is_public: newVisibility } : m));
                toast({ title: newVisibility ? "User is now visible" : "User is now hidden" });

            } else {
                // Existing team member
                const { error } = await supabase
                    .from("team_members")
                    .update({ is_public: newVisibility } as any)
                    .eq("id", id);

                if (error) throw error;
                toast({ title: newVisibility ? "User is now visible" : "User is now hidden" });

                // Update global context if needed
                setTeamMembers(teamMembers.map(t => t.id === id ? { ...t, is_public: newVisibility } : t));
            }
        } catch (error) {
            console.error("Error updating visibility:", error);
            toast({ title: "Failed to update visibility", variant: "destructive" });
            // Revert optimistic update
            setUnifiedTeam(prev => prev.map(m => m.id === id ? { ...m, is_public: !newVisibility } : m));
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Team"
                description="Manage team members and users"
            />

            <TeamTab
                team={unifiedTeam}
                onSave={handleSaveUser}
                onDelete={handleDelete}
                onCredentialsUpdate={handleAdminUpdateCredentials}
                editingTeamMember={editingTeamMember}
                setEditingTeamMember={setEditingTeamMember}
                teamMemberImagePreview={teamMemberImagePreview}
                onImageSelected={handleTeamMemberImageSelected}
                onVisibilityChange={handleVisibilityChange}
            />
        </div>
    );
};

export default TeamPage;

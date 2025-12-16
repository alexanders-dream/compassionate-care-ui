import { useState } from "react";
import { useSiteData, TeamMember } from "@/contexts/SiteDataContext";
import TeamTab from "@/components/admin/tabs/TeamTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TeamPage = () => {
    const { teamMembers, setTeamMembers } = useSiteData();
    const { toast } = useToast();

    const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
    const [teamMemberImage, setTeamMemberImage] = useState<File | null>(null);
    const [teamMemberImagePreview, setTeamMemberImagePreview] = useState<string | null>(null);

    const handleTeamMemberImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setTeamMemberImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setTeamMemberImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            toast({ title: `Image selected: ${file.name}` });
        }
    };

    const handleSaveTeamMember = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Use preview (base64) or existing url
        const imageUrl = teamMemberImagePreview || editingTeamMember?.image_url || null;

        const memberData = {
            name: String(formData.get("name")),
            role: String(formData.get("role")),
            bio: String(formData.get("bio")) || null,
            image_url: imageUrl,
            display_order: editingTeamMember?.display_order || teamMembers.length
        };

        try {
            if (editingTeamMember) {
                const { error } = await supabase
                    .from("team_members")
                    .update(memberData)
                    .eq("id", editingTeamMember.id);

                if (error) throw error;

                setTeamMembers(teamMembers.map(m => m.id === editingTeamMember.id ? { ...m, ...memberData } : m));
                toast({ title: "Team member updated successfully" });
            } else {
                const { data, error } = await supabase
                    .from("team_members")
                    .insert(memberData)
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setTeamMembers([...teamMembers, data]);
                    toast({ title: "Team member added successfully" });
                }
            }
        } catch (error) {
            console.error("Error saving team member:", error);
            toast({ title: "Error saving team member", variant: "destructive" });
        }

        setEditingTeamMember(null);
        setTeamMemberImage(null);
        setTeamMemberImagePreview(null);
    };

    const handleDeleteTeamMember = async (id: string) => {
        try {
            const { error } = await supabase
                .from("team_members")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setTeamMembers(teamMembers.filter(m => m.id !== id));
            toast({ title: "Team member removed" });
        } catch (error) {
            console.error("Error deleting team member:", error);
            toast({ title: "Error deleting team member", variant: "destructive" });
        }
    };

    return (
        <TeamTab
            team={teamMembers}
            onSave={handleSaveTeamMember}
            onDelete={handleDeleteTeamMember}
            editingTeamMember={editingTeamMember}
            setEditingTeamMember={setEditingTeamMember}
            teamMemberImage={teamMemberImage}
            teamMemberImagePreview={teamMemberImagePreview}
            onImageUpload={handleTeamMemberImageUpload}
        />
    );
};

export default TeamPage;

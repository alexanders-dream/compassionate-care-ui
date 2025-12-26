import { useSiteData } from "@/contexts/SiteDataContext";
import SiteCopyTab from "@/components/admin/tabs/SiteCopyTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const SiteCopyPage = () => {
    const { siteCopy, setSiteCopy } = useSiteData();
    const { toast } = useToast();

    const handleUpdateCopyField = (sectionId: string, fieldKey: string, newValue: string) => {
        setSiteCopy(siteCopy.map(section => {
            if (section.id === sectionId) {
                return {
                    ...section,
                    fields: section.fields.map(field =>
                        field.key === fieldKey ? { ...field, value: newValue } : field
                    )
                };
            }
            return section;
        }));
    };

    const handleSaveCopySection = async (sectionId: string) => {
        const section = siteCopy.find(s => s.id === sectionId);
        if (!section) return;

        // Transform fields back to content object for JSON storage
        const content = section.fields.reduce((acc, field) => {
            acc[field.key] = field.value;
            return acc;
        }, {} as Record<string, string>);

        try {
            const { error } = await supabase
                .from("site_copy")
                .upsert({
                    id: section.id,
                    page: "home", // Assuming home for now, or derive from section metadata if available
                    section: section.id,
                    content: content
                })
                .select();

            if (error) throw error;

            toast({ title: "Site copy updated", description: "Changes saved successfully" });
        } catch (error) {
            console.error("Error saving site copy:", error);
            toast({ title: "Error saving site copy", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Site Copy"
                description="Manage website text content"
            />

            <SiteCopyTab
                siteCopy={siteCopy}
                onUpdateField={handleUpdateCopyField}
                onSaveSection={handleSaveCopySection}
            />
        </div>
    );
};

export default SiteCopyPage;

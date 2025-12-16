import { useSiteData, PatientResource } from "@/contexts/SiteDataContext";
import { useState } from "react";
import ResourcesTab from "@/components/admin/tabs/ResourcesTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ResourcesPage = () => {
    const { patientResources, setPatientResources } = useSiteData();
    const { toast } = useToast();

    const [editingResource, setEditingResource] = useState<PatientResource | null>(null);
    const [resourceIcon, setResourceIcon] = useState("FileText");
    const [resourceFile, setResourceFile] = useState<File | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setResourceFile(file);
            toast({ title: `File selected: ${file.name}` });
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleSaveResource = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Handle file upload to Storage (if strictly needed, but reusing naive logic for now)
        // Admin.tsx logic for `file_url` was: if resourceFile, use `/downloads/${name}`, else input url.
        // We should replicate this for now.
        const fileUrl = resourceFile ? `/downloads/${resourceFile.name}` : (String(formData.get("url")) || null);
        const fileName = resourceFile?.name || editingResource?.file_name || null;
        const fileSize = resourceFile ? formatFileSize(resourceFile.size) : editingResource?.file_size || null;

        const resourceData = {
            title: String(formData.get("title")),
            description: String(formData.get("description")),
            icon: resourceIcon,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize,
            download_count: editingResource?.download_count || 0
        };

        try {
            if (editingResource) {
                const { error } = await supabase
                    .from("patient_resources")
                    .update(resourceData)
                    .eq("id", editingResource.id);

                if (error) throw error;

                setPatientResources(patientResources.map(r => r.id === editingResource.id ? { ...r, ...resourceData } : r));
                toast({ title: "Resource updated successfully" });
            } else {
                const { data, error } = await supabase
                    .from("patient_resources")
                    .insert(resourceData)
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setPatientResources([...patientResources, data]);
                    toast({ title: "Resource created successfully" });
                }
            }
        } catch (error) {
            console.error("Error saving resource:", error);
            toast({ title: "Error saving resource", variant: "destructive" });
        }

        setEditingResource(null);
        setResourceFile(null);
        setResourceIcon("FileText");
    };

    const handleDeleteResource = async (id: string) => {
        try {
            const { error } = await supabase
                .from("patient_resources")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setPatientResources(patientResources.filter(r => r.id !== id));
            toast({ title: "Resource deleted" });
        } catch (error) {
            console.error("Error deleting resource:", error);
            toast({ title: "Error deleting resource", variant: "destructive" });
        }
    };

    return (
        <ResourcesTab
            resources={patientResources}
            onSave={handleSaveResource}
            onDelete={handleDeleteResource}
            editingResource={editingResource}
            setEditingResource={setEditingResource}
            resourceIcon={resourceIcon}
            setResourceIcon={setResourceIcon}
            resourceFile={resourceFile}
            onFileUpload={handleFileUpload}
        />
    );
};

export default ResourcesPage;

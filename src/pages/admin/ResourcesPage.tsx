import { useSiteData, PatientResource } from "@/contexts/SiteDataContext";
import { useState } from "react";
import ResourcesTab from "@/components/admin/tabs/ResourcesTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const BUCKET_NAME = "patient-resources";

const ResourcesPage = () => {
    const { patientResources, setPatientResources } = useSiteData();
    const { toast } = useToast();

    const [editingResource, setEditingResource] = useState<PatientResource | null>(null);
    const [resourceIcon, setResourceIcon] = useState("FileText");
    const [resourceFile, setResourceFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

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

    const uploadFileToStorage = async (file: File): Promise<{ url: string; fileName: string; fileSize: string } | null> => {
        try {
            const fileExt = file.name.split('.').pop();
            const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(uniqueName, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(uniqueName);

            return {
                url: data.publicUrl,
                fileName: file.name,
                fileSize: formatFileSize(file.size)
            };
        } catch (error) {
            console.error("Error uploading file:", error);
            return null;
        }
    };

    const handleSaveResource = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsUploading(true);
        const formData = new FormData(e.currentTarget);

        let fileUrl = editingResource?.file_url || null;
        let fileName = editingResource?.file_name || null;
        let fileSize = editingResource?.file_size || null;

        // If a new file is selected, upload it
        if (resourceFile) {
            const uploadResult = await uploadFileToStorage(resourceFile);
            if (uploadResult) {
                fileUrl = uploadResult.url;
                fileName = uploadResult.fileName;
                fileSize = uploadResult.fileSize;
            } else {
                toast({ title: "Error uploading file", variant: "destructive" });
                setIsUploading(false);
                return;
            }
        } else {
            // Check if an external URL was provided
            const externalUrl = String(formData.get("url") || "").trim();
            if (externalUrl && externalUrl !== editingResource?.file_url) {
                fileUrl = externalUrl;
                fileName = null;
                fileSize = null;
            }
        }

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
        setIsUploading(false);
    };

    const handleDeleteResource = async (id: string) => {
        const resource = patientResources.find(r => r.id === id);

        try {
            // If the file was uploaded to our storage bucket, delete it
            if (resource?.file_url?.includes(BUCKET_NAME)) {
                const urlParts = resource.file_url.split('/');
                const fileName = urlParts[urlParts.length - 1];
                if (fileName) {
                    await supabase.storage.from(BUCKET_NAME).remove([fileName]);
                }
            }

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

    // Handler for selecting a file from gallery
    const handleSelectExistingFile = (url: string, fileName: string, fileSize: string) => {
        // This will be passed to the form
        setResourceFile(null); // Clear any new file selection
        // The form will use the selected existing file's URL
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Patient Resources"
                description="Manage downloadable patient resources"
            />

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
                isUploading={isUploading}
            />
        </div>
    );
};

export default ResourcesPage;


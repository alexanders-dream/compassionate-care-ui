import { useSiteData, PatientResource } from "@/contexts/SiteDataContext";
import { useState } from "react";
import ResourcesTab from "@/components/admin/tabs/ResourcesTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { uploadToCloudinary } from "@/lib/cloudinary";

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
            // Use 'raw' for PDFs and other documents, or 'auto' to let Cloudinary decide
            const uploadResult = await uploadToCloudinary(file, 'auto');

            return {
                url: uploadResult.secure_url,
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
            // Cloudinary deletion not implemented from client
            if (resource?.file_url?.includes('cloudinary')) {
                // Optional: Call a backend function to delete from Cloudinary
                console.log("Skipping Cloudinary deletion from client");
            } else if (resource?.file_url?.includes('patient-resources')) {
                // Legacy Supabase deletion (optional, if you want to keep cleaning up old files)
                // const urlParts = resource.file_url.split('/');
                // const fileName = urlParts[urlParts.length - 1];
                // if (fileName) {
                //     await supabase.storage.from('patient-resources').remove([fileName]);
                // }
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
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Patient Resources</h2>
                <p className="text-muted-foreground">Manage downloadable patient resources</p>
            </div>

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


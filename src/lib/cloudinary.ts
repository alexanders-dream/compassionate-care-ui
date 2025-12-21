import { supabase } from "@/integrations/supabase/client";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET; // Optional if using signed uploads without preset
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;

interface CloudinaryResource {
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    created_at: string;
    resource_type: string;
}

interface CloudinaryUploadResult {
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    resource_type: string;
}

export const uploadToCloudinary = async (file: File | Blob, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto'): Promise<CloudinaryUploadResult> => {
    if (!CLOUD_NAME) throw new Error("Cloudinary Cloud Name not set");

    // 1. Get signature from Supabase Edge Function
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign: Record<string, any> = {
        timestamp,
        // folder: 'blog-media', // Optional: Organize uploads
    };

    if (UPLOAD_PRESET) {
        paramsToSign.upload_preset = UPLOAD_PRESET;
    }

    const { data: signData, error: signError } = await supabase.functions.invoke('cloudinary-sign', {
        body: { paramsToSign }
    });

    if (signError || !signData.signature) {
        console.error("Signature generation failed", signError);
        throw new Error("Failed to generate upload signature");
    }

    // 2. Upload to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", API_KEY);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signData.signature);
    if (UPLOAD_PRESET) formData.append("upload_preset", UPLOAD_PRESET);
    // if (paramsToSign.folder) formData.append("folder", paramsToSign.folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
    });

    const data = await response.json();

    if (data.error) {
        throw new Error(data.error.message);
    }

    return data;
};

export const listCloudinaryResources = async (resourceType: 'image' | 'video' = 'image', nextCursor?: string): Promise<{ resources: CloudinaryResource[], next_cursor?: string }> => {
    const { data, error } = await supabase.functions.invoke('cloudinary-list', {
        body: { resourceType, nextCursor }
    });

    if (error) {
        console.error("Failed to list resources", error);
        throw new Error("Failed to load gallery");
    }

    return {
        resources: data.resources,
        next_cursor: data.next_cursor
    };
};

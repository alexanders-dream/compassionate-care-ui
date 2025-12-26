import { useSiteData, Service } from "@/contexts/SiteDataContext";
import { useState } from "react";
import ServicesTab from "@/components/admin/tabs/ServicesTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AdminPageHeader from "@/components/admin/AdminPageHeader";

const ServicesPage = () => {
    const { services, setServices } = useSiteData();
    const { toast } = useToast();

    const [editingService, setEditingService] = useState<Service | null>(null);
    const [serviceIcon, setServiceIcon] = useState("Heart");

    const handleSaveService = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const serviceData = {
            title: String(formData.get("title")),
            description: String(formData.get("description")),
            icon: serviceIcon,
            display_order: editingService?.display_order || services.length
        };

        try {
            if (editingService) {
                // Update existing
                const { error } = await supabase
                    .from("services")
                    .update(serviceData)
                    .eq("id", editingService.id);

                if (error) throw error;

                setServices(services.map(s => s.id === editingService.id ? { ...s, ...serviceData } : s));
                toast({ title: "Service updated successfully" });
            } else {
                // Create new
                const { data, error } = await supabase
                    .from("services")
                    .insert(serviceData)
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setServices([...services, data]);
                    toast({ title: "Service created successfully" });
                }
            }
        } catch (error) {
            console.error("Error saving service:", error);
            toast({ title: "Error saving service", variant: "destructive" });
        }

        setEditingService(null);
        setServiceIcon("Heart");
    };

    const handleDeleteService = async (id: string) => {
        try {
            const { error } = await supabase
                .from("services")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setServices(services.filter(s => s.id !== id));
            toast({ title: "Service deleted" });
        } catch (error) {
            console.error("Error deleting service:", error);
            toast({ title: "Error deleting service", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Services"
                description="Manage services offered"
            />

            <ServicesTab
                services={services}
                onSave={handleSaveService}
                onDelete={handleDeleteService}
                editingService={editingService}
                setEditingService={setEditingService}
                serviceIcon={serviceIcon}
                setServiceIcon={setServiceIcon}
            />
        </div>
    );
};

export default ServicesPage;

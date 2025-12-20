import { useSiteData, InsuranceProvider } from "@/contexts/SiteDataContext";
import { useState } from "react";
import InsuranceTab from "@/components/admin/tabs/InsuranceTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const InsurancePage = () => {
    const { insuranceProviders, setInsuranceProviders } = useSiteData();
    const { toast } = useToast();

    const [editingProvider, setEditingProvider] = useState<InsuranceProvider | null>(null);
    const [logoUrl, setLogoUrl] = useState("");
    const [isActive, setIsActive] = useState(true);

    const handleSaveProvider = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const providerData = {
            name: String(formData.get("name")),
            description: formData.get("description") ? String(formData.get("description")) : null,
            payment_details: formData.get("payment_details") ? String(formData.get("payment_details")) : null,
            logo_url: logoUrl || null,
            is_active: isActive,
            display_order: editingProvider?.display_order || insuranceProviders.length
        };

        try {
            if (editingProvider) {
                // Update existing
                const { error } = await (supabase as any)
                    .from("insurance_providers")
                    .update(providerData)
                    .eq("id", editingProvider.id);

                if (error) throw error;

                setInsuranceProviders(insuranceProviders.map(p => p.id === editingProvider.id ? { ...p, ...providerData } : p));
                toast({ title: "Insurance provider updated successfully" });
            } else {
                // Create new
                const { data, error } = await (supabase as any)
                    .from("insurance_providers")
                    .insert(providerData)
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setInsuranceProviders([...insuranceProviders, data as InsuranceProvider]);
                    toast({ title: "Insurance provider created successfully" });
                }
            }
        } catch (error) {
            console.error("Error saving insurance provider:", error);
            toast({ title: "Error saving insurance provider", variant: "destructive" });
        }

        setEditingProvider(null);
        setLogoUrl("");
        setIsActive(true);
    };

    const handleDeleteProvider = async (id: string) => {
        try {
            const { error } = await (supabase as any)
                .from("insurance_providers")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setInsuranceProviders(insuranceProviders.filter(p => p.id !== id));
            toast({ title: "Insurance provider deleted" });
        } catch (error) {
            console.error("Error deleting insurance provider:", error);
            toast({ title: "Error deleting insurance provider", variant: "destructive" });
        }
    };

    return (
        <InsuranceTab
            insuranceProviders={insuranceProviders}
            onSave={handleSaveProvider}
            onDelete={handleDeleteProvider}
            editingProvider={editingProvider}
            setEditingProvider={setEditingProvider}
            logoUrl={logoUrl}
            setLogoUrl={setLogoUrl}
            isActive={isActive}
            setIsActive={setIsActive}
        />
    );
};

export default InsurancePage;

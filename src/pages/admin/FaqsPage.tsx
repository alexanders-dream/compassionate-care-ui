import { useState } from "react";
import { useSiteData, FAQ } from "@/contexts/SiteDataContext";
import FaqsTab from "@/components/admin/tabs/FaqsTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const FaqsPage = () => {
    const { faqs, setFaqs } = useSiteData();
    const { toast } = useToast();

    const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

    const handleSaveFaq = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const faqData = {
            question: String(formData.get("question")),
            answer: String(formData.get("answer")),
            category: String(formData.get("category")),
            display_order: editingFaq?.display_order || faqs.length
        };

        try {
            if (editingFaq) {
                const { error } = await supabase
                    .from("faqs")
                    .update(faqData)
                    .eq("id", editingFaq.id);

                if (error) throw error;

                setFaqs(faqs.map(f => f.id === editingFaq.id ? { ...f, ...faqData } : f));
                toast({ title: "FAQ updated successfully" });
            } else {
                const { data, error } = await supabase
                    .from("faqs")
                    .insert(faqData)
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setFaqs([...faqs, data]);
                    toast({ title: "FAQ created successfully" });
                }
            }
        } catch (error) {
            console.error("Error saving FAQ:", error);
            toast({ title: "Error saving FAQ", variant: "destructive" });
        }

        setEditingFaq(null);
    };

    const handleDeleteFaq = async (id: string) => {
        try {
            const { error } = await supabase
                .from("faqs")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setFaqs(faqs.filter(f => f.id !== id));
            toast({ title: "FAQ deleted" });
        } catch (error) {
            console.error("Error deleting FAQ:", error);
            toast({ title: "Error deleting FAQ", variant: "destructive" });
        }
    };

    return (
        <FaqsTab
            faqs={faqs}
            onSave={handleSaveFaq}
            onDelete={handleDeleteFaq}
            editingFaq={editingFaq}
            setEditingFaq={setEditingFaq}
        />
    );
};

export default FaqsPage;

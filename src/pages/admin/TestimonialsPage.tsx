import { useSiteData, Testimonial } from "@/contexts/SiteDataContext";
import { useState } from "react";
import TestimonialsTab from "@/components/admin/tabs/TestimonialsTab";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TestimonialsPage = () => {
    const { testimonials, setTestimonials } = useSiteData();
    const { toast } = useToast();

    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

    const handleSaveTestimonial = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const testimonialData = {
            name: String(formData.get("name")),
            role: String(formData.get("role")) || null,
            quote: String(formData.get("content")),
            rating: Number(formData.get("rating")),
            is_featured: false
        };

        try {
            if (editingTestimonial) {
                const { error } = await supabase
                    .from("testimonials")
                    .update(testimonialData)
                    .eq("id", editingTestimonial.id);

                if (error) throw error;

                setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? { ...t, ...testimonialData } : t));
                toast({ title: "Testimonial updated successfully" });
            } else {
                const { data, error } = await supabase
                    .from("testimonials")
                    .insert(testimonialData)
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    setTestimonials([...testimonials, data]);
                    toast({ title: "Testimonial created successfully" });
                }
            }
        } catch (error) {
            console.error("Error saving testimonial:", error);
            toast({ title: "Error saving testimonial", variant: "destructive" });
        }

        setEditingTestimonial(null);
    };

    const handleDeleteTestimonial = async (id: string) => {
        try {
            const { error } = await supabase
                .from("testimonials")
                .delete()
                .eq("id", id);

            if (error) throw error;

            setTestimonials(testimonials.filter(t => t.id !== id));
            toast({ title: "Testimonial deleted" });
        } catch (error) {
            console.error("Error deleting testimonial:", error);
            toast({ title: "Error deleting testimonial", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Testimonials</h2>
                <p className="text-muted-foreground">Manage patient testimonials</p>
            </div>

            <TestimonialsTab
                testimonials={testimonials}
                onSave={handleSaveTestimonial}
                onDelete={handleDeleteTestimonial}
                editingTestimonial={editingTestimonial}
                setEditingTestimonial={setEditingTestimonial}
            />
        </div>
    );
};

export default TestimonialsPage;

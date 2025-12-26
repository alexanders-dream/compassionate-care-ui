import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
    full_name: string;
    avatar_url: string | null;
}

export const useUserProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setProfile(null);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("profiles")
                    .select("full_name, avatar_url")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') {
                    console.error("Error fetching user profile:", error);
                }

                if (data) {
                    setProfile({
                        full_name: data.full_name || "",
                        avatar_url: data.avatar_url
                    });
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    return { profile, loading, user };
};

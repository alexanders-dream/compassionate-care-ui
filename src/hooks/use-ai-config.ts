import { useState, useEffect } from "react";
import { AIConfig, getAIConfig } from "@/lib/ai/config";
import { supabase } from "@/integrations/supabase/client";

export const useAIConfig = () => {
    const [config, setConfig] = useState<AIConfig>({ provider: "", apiKey: "", model: "" });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            setIsLoading(true);
            try {
                const savedConfig = await getAIConfig(supabase);
                if (savedConfig) {
                    setConfig(savedConfig);
                }
            } catch (error) {
                console.error("Failed to load AI config", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    return { config, setConfig, isLoading };
};

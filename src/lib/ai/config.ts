import { createClient } from '@supabase/supabase-js';

// NOTE: In a real app, you should use the hook 'useSupabaseClient' or similar context if available,
// but for these standalone utility functions, we might need a client instance passed in, 
// or we rely on the caller to provide the client. 
// For simplicity in this 'config.ts', we'll define helper functions that accept the supabase client.

export const AI_PROVIDER_KEY = 'ai_provider_config';

export interface AIConfig {
    provider: string;
    apiKey: string;
    model: string;
}

export const getAIConfig = async (supabase: any): Promise<AIConfig | null> => {
    const { data, error } = await supabase
        .from('app_config')
        .select('value')
        .eq('key', AI_PROVIDER_KEY)
        .single();

    if (error || !data) {
        return null;
    }

    try {
        return JSON.parse(data.value) as AIConfig;
    } catch (e) {
        console.error("Failed to parse AI config", e);
        return null;
    }
};

export const saveAIConfig = async (supabase: any, config: AIConfig): Promise<boolean> => {
    const { error } = await supabase
        .from('app_config')
        .upsert(
            {
                key: AI_PROVIDER_KEY,
                value: JSON.stringify(config),
                is_secret: true,
                updated_at: new Date().toISOString()
            },
            { onConflict: 'key' }
        );

    if (error) {
        console.error("Failed to save AI config", error);
        return false;
    }
    return true;
};

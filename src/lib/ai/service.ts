import { AIConfig } from './config';

// This is a browser-side implementation. In a production app, 
// strictly sensitive calls should ideally go through an Edge Function.
// However, for this admin-only tool, we will make direct calls if the user provides the key.

interface AIRequestParams {
    config: AIConfig;
    systemPrompt: string;
    userPrompt: string;
    jsonMode?: boolean;
}

const callOpenAI = async ({ config, systemPrompt, userPrompt, jsonMode }: AIRequestParams) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: jsonMode ? { type: 'json_object' } : undefined
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

const callAnthropic = async ({ config, systemPrompt, userPrompt }: AIRequestParams) => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': config.apiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
            'dangerously-allow-browser': 'true'
        },
        body: JSON.stringify({
            model: config.model,
            system: systemPrompt,
            messages: [
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Anthropic API failed');
    }

    const data = await response.json();
    return data.content[0].text;
};

const callGoogle = async ({ config, systemPrompt, userPrompt }: AIRequestParams) => {
    // Google Gemini API (REST)
    // Structure: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
            }]
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Google Gemini API failed');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
};

const callOpenAICompatible = async ({ config, systemPrompt, userPrompt, jsonMode, baseUrl }: AIRequestParams & { baseUrl: string }) => {
    const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: jsonMode ? { type: 'json_object' } : undefined
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || `API call to ${baseUrl} failed`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
};

// Generic handler - exported for use in quick actions
export const callAI = async (params: AIRequestParams) => {
    const { config } = params;

    switch (config.provider) {
        case 'openai':
            return callOpenAI(params);
        case 'anthropic':
            return callAnthropic(params);
        case 'google':
            return callGoogle(params);
        case 'deepseek':
            return callOpenAICompatible({ ...params, baseUrl: 'https://api.deepseek.com/v1' }); // Check exact DeepSeek URL
        case 'groq':
            return callOpenAICompatible({ ...params, baseUrl: 'https://api.groq.com/openai/v1' });
        case 'openrouter':
            return callOpenAICompatible({ ...params, baseUrl: 'https://openrouter.ai/api/v1' });
        default:
            throw new Error(`Provider ${config.provider} not implemented.`);
    }
};

// --- Model Fetching ---
// Cache for fetched models to avoid repeated API calls
const modelCache: Map<string, { models: AIModel[]; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface AIModel {
    id: string;
    name: string;
    description?: string;
}

// OpenAI Models
const fetchOpenAIModels = async (apiKey: string): Promise<AIModel[]> => {
    const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!response.ok) throw new Error('Failed to fetch OpenAI models');

    const data = await response.json();
    // Filter for GPT chat models only (exclude embeddings, whisper, dall-e, tts)
    return data.data
        .filter((m: any) => m.id.includes('gpt') && !m.id.includes('instruct'))
        .map((m: any) => ({
            id: m.id,
            name: m.id.replace(/-/g, ' ').replace(/gpt/gi, 'GPT').replace(/\d+/g, (n: string) => ` ${n}`).trim(),
            description: m.owned_by === 'openai' ? 'OpenAI Model' : m.owned_by
        }))
        .sort((a: AIModel, b: AIModel) => b.id.localeCompare(a.id)); // Newest first
};

// Anthropic Models
const fetchAnthropicModels = async (apiKey: string): Promise<AIModel[]> => {
    const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        }
    });

    if (!response.ok) throw new Error('Failed to fetch Anthropic models');

    const data = await response.json();
    return data.data
        .map((m: any) => ({
            id: m.id,
            name: m.display_name || m.id.replace(/-/g, ' ').replace(/claude/gi, 'Claude'),
            description: m.description || 'Anthropic Model'
        }))
        .sort((a: AIModel, b: AIModel) => b.id.localeCompare(a.id));
};

// Google Gemini Models
const fetchGoogleModels = async (apiKey: string): Promise<AIModel[]> => {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) throw new Error('Failed to fetch Google models');

    const data = await response.json();
    // Filter for models that support generateContent
    return data.models
        .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => ({
            id: m.name.replace('models/', ''),
            name: m.displayName || m.name.replace('models/', ''),
            description: m.description?.slice(0, 50) || 'Google AI Model'
        }));
};

// Groq Models (OpenAI-compatible)
const fetchGroqModels = async (apiKey: string): Promise<AIModel[]> => {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!response.ok) throw new Error('Failed to fetch Groq models');

    const data = await response.json();
    return data.data
        .filter((m: any) => m.active !== false)
        .map((m: any) => ({
            id: m.id,
            name: m.id.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            description: m.owned_by || 'Groq Model'
        }));
};

// DeepSeek Models (OpenAI-compatible)
const fetchDeepSeekModels = async (apiKey: string): Promise<AIModel[]> => {
    const response = await fetch('https://api.deepseek.com/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!response.ok) throw new Error('Failed to fetch DeepSeek models');

    const data = await response.json();
    return data.data.map((m: any) => ({
        id: m.id,
        name: m.id.replace(/-/g, ' ').replace(/deepseek/gi, 'DeepSeek'),
        description: 'DeepSeek Model'
    }));
};

// OpenRouter Models (no auth required for listing)
const fetchOpenRouterModels = async (_apiKey: string): Promise<AIModel[]> => {
    const response = await fetch('https://openrouter.ai/api/v1/models');

    if (!response.ok) throw new Error('Failed to fetch OpenRouter models');

    const data = await response.json();
    // Return top models sorted by popularity/context length
    return data.data
        .slice(0, 50) // Limit to top 50 models
        .map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            description: `${m.context_length ? `${Math.round(m.context_length / 1000)}k ctx` : ''}`
        }));
};

export const fetchModels = async (providerId: string, apiKey: string): Promise<AIModel[]> => {
    // Check cache first
    const cacheKey = `${providerId}:${apiKey.slice(-6)}`; // Use last 6 chars of key for cache key
    const cached = modelCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.models;
    }

    if (!apiKey) {
        return []; // No API key, return empty - UI will show prompt
    }

    try {
        let models: AIModel[] = [];

        switch (providerId) {
            case 'openai':
                models = await fetchOpenAIModels(apiKey);
                break;
            case 'anthropic':
                models = await fetchAnthropicModels(apiKey);
                break;
            case 'google':
                models = await fetchGoogleModels(apiKey);
                break;
            case 'groq':
                models = await fetchGroqModels(apiKey);
                break;
            case 'deepseek':
                models = await fetchDeepSeekModels(apiKey);
                break;
            case 'openrouter':
                models = await fetchOpenRouterModels(apiKey);
                break;
            default:
                return [];
        }

        // Cache the results
        modelCache.set(cacheKey, { models, timestamp: Date.now() });
        return models;
    } catch (error) {
        console.error(`Failed to fetch models for ${providerId}:`, error);
        return []; // Return empty on error - UI will show prompt
    }
};

// Clear cache for a specific provider (used when refreshing)
export const clearModelCache = (providerId?: string) => {
    if (providerId) {
        for (const key of modelCache.keys()) {
            if (key.startsWith(providerId)) {
                modelCache.delete(key);
            }
        }
    } else {
        modelCache.clear();
    }
};

export const researchKeywords = async (config: AIConfig, topic: string, businessContext: string) => {
    const systemPrompt = "You are an SEO expert. Output a JSON object with a key 'keywords' containing a list of 10 relevant SEO keywords.";
    const userPrompt = `Generate high-value SEO keywords for the topic: "${topic}". 
  Business Context: ${businessContext}.
  Focus on keywords that drive traffic for wound care and medical services.`;

    const result = await callAI({ config, systemPrompt, userPrompt, jsonMode: true });
    try {
        // Clean markdown blocks if present (some models output ```json ... ```)
        const cleanResult = result.replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(cleanResult).keywords as string[];
    } catch (e) {
        // Fallback if JSON parsing fails
        return result.split('\n').filter((l: string) => l.trim()).map((l: string) => l.replace(/^- /, ''));
    }
};

export const generateTopics = async (config: AIConfig, category: string, existingTitles: string[]) => {
    const systemPrompt = "You are a content strategist. Output a JSON object with a key 'topics' containing a list of 5 unique article ideas.";
    const userPrompt = `Generate 5 unique blog post titles for the category: "${category}".
  Do NOT use any of these existing titles: ${JSON.stringify(existingTitles)}.
  Ensure they are engaging and medically accurate for a wound care website.`;

    const result = await callAI({ config, systemPrompt, userPrompt, jsonMode: true });
    try {
        const cleanResult = result.replace(/^```json/, '').replace(/```$/, '');
        return JSON.parse(cleanResult).topics as string[];
    } catch (e) {
        return [];
    }
};

export const generateArticleContent = async (config: AIConfig, title: string, keywords: string[]) => {
    const systemPrompt = "You are a professional medical writer. Write a comprehensive, SEO-optimized blog post in HTML format. Do not include markdown code blocks, just raw HTML tags like <h1>, <p>, <ul>.";
    const userPrompt = `Write a blog post titled: "${title}".
  Target Keywords: ${keywords.join(', ')}.
  Structure:
  - Introduction
  - Key sections with headers (h2)
  - Practical advice
  - Conclusion
  Measure: ~800 words.
  Tone: Professional, empathetic, and authoritative.`;

    const content = await callAI({ config, systemPrompt, userPrompt });
    // Clean up if model returns code blocks
    return content.replace(/^```html/, '').replace(/```$/, '');
};

export interface AIModel {
  id: string;
  name: string;
  description?: string;
}

export interface AIProvider {
  id: string;
  name: string;
  models: AIModel[];
  apiKeyPlaceholder: string;
}

export const aiProviders: AIProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    apiKeyPlaceholder: "sk-...",
    models: [
      { id: "gpt-4o", name: "GPT-4o", description: "Most capable model" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast and affordable" },
      { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High performance" },
      { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", description: "Cost effective" },
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    apiKeyPlaceholder: "sk-ant-...",
    models: [
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", description: "Latest and most capable" },
      { id: "claude-3-opus-20240229", name: "Claude 3 Opus", description: "Most powerful" },
      { id: "claude-3-sonnet-20240229", name: "Claude 3 Sonnet", description: "Balanced" },
      { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", description: "Fast and affordable" },
    ]
  },
  {
    id: "google",
    name: "Google Gemini",
    apiKeyPlaceholder: "AIza...",
    models: [
      { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Most capable" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast responses" },
      { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro", description: "Stable performance" },
    ]
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    apiKeyPlaceholder: "sk-...",
    models: [
      { id: "deepseek-chat", name: "DeepSeek Chat", description: "General purpose" },
      { id: "deepseek-coder", name: "DeepSeek Coder", description: "Code focused" },
    ]
  },
  {
    id: "groq",
    name: "Groq",
    apiKeyPlaceholder: "gsk_...",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", description: "Powerful open model" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", description: "Ultra fast" },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", description: "Great for long context" },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", description: "Efficient" },
    ]
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    apiKeyPlaceholder: "sk-or-...",
    models: [
      { id: "openai/gpt-4o", name: "GPT-4o (via OpenRouter)" },
      { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet (via OpenRouter)" },
      { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5 (via OpenRouter)" },
      { id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 3.1 405B" },
      { id: "mistralai/mixtral-8x22b-instruct", name: "Mixtral 8x22B" },
    ]
  }
];

export const getProviderById = (id: string) => aiProviders.find(p => p.id === id);

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { Settings2, Sparkles, RefreshCw, Loader2, Eye, EyeOff, CheckCircle2, Zap, AlertTriangle } from "lucide-react";
import { AIConfig, saveAIConfig } from "@/lib/ai/config";
import { aiProviders, getProviderById, AIModel } from "@/data/aiProviders";
import { fetchModels, clearModelCache } from "@/lib/ai/service";
import { useToast } from "@/hooks/use-toast";
import { aiActions, AIAction } from "@/hooks/use-ai-editor";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface AISidebarProps {
    config: AIConfig;
    setConfig: React.Dispatch<React.SetStateAction<AIConfig>>;
    isProcessing: boolean;
    onAction: (action: AIAction) => void;
    onCustomPrompt: (prompt: string) => void;
    additionalContent?: React.ReactNode;
}

export const AISidebar = ({
    config,
    setConfig,
    isProcessing,
    onAction,
    onCustomPrompt,
    additionalContent
}: AISidebarProps) => {
    const { toast } = useToast();
    const [showApiKey, setShowApiKey] = useState(false);
    const [customPrompt, setCustomPrompt] = useState("");
    const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);

    const isAIConfigured = !!(config.provider && config.apiKey && config.model);
    const currentProvider = getProviderById(config.provider);

    // Fetch models when provider or API key changes
    useEffect(() => {
        const loadModels = async () => {
            if (!config.provider) {
                setAvailableModels([]);
                return;
            }

            setIsLoadingModels(true);
            try {
                const models = await fetchModels(config.provider, config.apiKey);
                setAvailableModels(models);
                // Auto-select first if available and none selected
                if (models.length > 0 && !config.model) {
                    setConfig(prev => ({ ...prev, model: models[0].id }));
                }
            } catch (error) {
                console.error('Failed to load models:', error);
                setAvailableModels([]);
            } finally {
                setIsLoadingModels(false);
            }
        };
        loadModels();
    }, [config.provider, config.apiKey]);

    const handleRefreshModels = async () => {
        if (!config.provider) return;
        clearModelCache(config.provider);
        setIsLoadingModels(true);
        try {
            const models = await fetchModels(config.provider, config.apiKey);
            setAvailableModels(models);
            toast({ title: "Models refreshed", description: `Loaded ${models.length} models` });
        } catch (error) {
            toast({ title: "Failed to refresh models", variant: "destructive" });
        } finally {
            setIsLoadingModels(false);
        }
    };

    const handleCustomPromptSubmit = () => {
        if (customPrompt.trim()) {
            onCustomPrompt(customPrompt);
            setCustomPrompt("");
        }
    };

    return (
        <div className="w-80 border-l bg-muted/30 flex flex-col overflow-hidden shrink-0 h-full">
            <div className="p-4 border-b shrink-0 bg-background/50 backdrop-blur-sm">
                <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Assistant
                </h3>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                    {/* AI Verification Warning */}
                    <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertTitle className="text-xs font-bold text-amber-900 ml-1">AI Content Warning</AlertTitle>
                        <AlertDescription className="text-[10px] leading-tight mt-1 text-amber-800/90 hidden">
                            Always verify AI-generated content for medical accuracy before publishing.
                        </AlertDescription>
                        <div className="text-[10px] leading-tight mt-1 text-amber-800/90 pl-6">
                            Always verify AI-generated content for medical accuracy before publishing.
                        </div>
                    </Alert>

                    {/* Additional Content (Strategy etc) */}
                    {additionalContent}

                    {/* AI Configuration */}
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Settings2 className="h-4 w-4" />
                                AI Config
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                            <Select value={config.provider} onValueChange={(v) => setConfig(prev => ({ ...prev, provider: v, model: "" }))}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Select provider..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {aiProviders.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {config.provider && (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">Model</span>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-5 w-5"
                                            onClick={handleRefreshModels}
                                            disabled={isLoadingModels || !config.apiKey}
                                            title="Refresh models"
                                        >
                                            <RefreshCw className={`h-3 w-3 ${isLoadingModels ? 'animate-spin' : ''}`} />
                                        </Button>
                                    </div>
                                    {isLoadingModels ? (
                                        <div className="flex items-center justify-center h-8 bg-muted/50 rounded border text-xs text-muted-foreground">
                                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                                            Loading...
                                        </div>
                                    ) : availableModels.length > 0 ? (
                                        <Select value={config.model} onValueChange={(v) => setConfig(prev => ({ ...prev, model: v }))}>
                                            <SelectTrigger className="h-8 text-xs">
                                                <SelectValue placeholder="Select model..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableModels.map(m => (
                                                    <SelectItem key={m.id} value={m.id} className="text-xs">{m.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex items-center justify-center h-8 bg-muted/30 rounded border border-dashed text-xs text-muted-foreground">
                                            {config.apiKey ? "Click refresh" : "Enter API key"}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Input
                                    type={showApiKey ? "text" : "password"}
                                    value={config.apiKey}
                                    onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                                    placeholder={currentProvider?.apiKeyPlaceholder || "API Key"}
                                    className="h-8 text-xs font-mono"
                                />
                                <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => setShowApiKey(!showApiKey)}>
                                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>

                            <Button size="sm" onClick={async () => {
                                if (!config.provider || !config.apiKey) {
                                    toast({ title: "Provider and API Key are required", variant: "destructive" });
                                    return;
                                }
                                const success = await saveAIConfig(supabase, config);
                                if (success) {
                                    toast({ title: "Settings saved", description: "Your API key has been stored securely." });
                                } else {
                                    toast({ title: "Failed to save settings", variant: "destructive" });
                                }
                            }} className="w-full h-8 text-xs bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                Save Settings
                            </Button>

                            {isAIConfigured && (
                                <Badge variant="default" className="w-full justify-center bg-green-600 hover:bg-green-700 py-0.5">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    AI Ready
                                </Badge>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                {aiActions.map(action => {
                                    const Icon = action.icon;
                                    return (
                                        <Button
                                            key={action.id}
                                            variant="outline"
                                            size="sm"
                                            className="h-auto py-2 px-3 flex flex-col items-start text-left whitespace-normal leading-tight"
                                            onClick={() => onAction(action.id)}
                                            disabled={isProcessing || !isAIConfigured}
                                        >
                                            <div className="flex items-center gap-1.5 mb-0.5 font-medium text-xs">
                                                <Icon className="h-3.5 w-3.5 shrink-0" />
                                                <span>{action.label}</span>
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center">Applies to selection or entire content</p>
                        </CardContent>
                    </Card>

                    {/* Custom Prompt */}
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-sm">Custom Instruction</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 space-y-2">
                            <Input
                                value={customPrompt}
                                onChange={(e) => setCustomPrompt(e.target.value)}
                                placeholder="e.g. 'Make it more persuasive'"
                                className="h-8 text-xs"
                                onKeyDown={(e) => e.key === 'Enter' && handleCustomPromptSubmit()}
                            />
                            <Button
                                size="sm"
                                className="w-full h-8 text-xs"
                                onClick={handleCustomPromptSubmit}
                                disabled={isProcessing || !isAIConfigured || !customPrompt.trim()}
                            >
                                {isProcessing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Sparkles className="h-3 w-3 mr-2" />}
                                Apply Custom Edit
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </ScrollArea>
        </div>
    );
};

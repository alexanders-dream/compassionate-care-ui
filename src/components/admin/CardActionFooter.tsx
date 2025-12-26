import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export interface CardAction {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
    disabled?: boolean;
}

interface CardActionFooterProps {
    actions: CardAction[];
    className?: string;
}

export function CardActionFooter({ actions, className }: CardActionFooterProps) {
    if (!actions || actions.length === 0) return null;

    return (
        <div className={cn("flex items-center p-2 border-t bg-muted/20", className)}>
            {actions.map((action, index) => (
                <div key={action.label} className="flex-1 flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                        }}
                        disabled={action.disabled}
                        className={cn(
                            "flex-1 h-8 text-xs font-medium hover:bg-background/80 hover:shadow-sm transition-all",
                            action.className
                        )}
                    >
                        {action.icon && <action.icon className="h-3.5 w-3.5 mr-2" />}
                        {action.label}
                    </Button>
                    {/* Add divider if not the last item */}
                    {index < actions.length - 1 && (
                        <div className="w-px h-4 bg-border/60 mx-1 shrink-0" />
                    )}
                </div>
            ))}
        </div>
    );
}

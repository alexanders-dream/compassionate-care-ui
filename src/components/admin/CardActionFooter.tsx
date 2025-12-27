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
    showLabel?: boolean;
}

interface CardActionFooterProps {
    actions: CardAction[];
    className?: string;
}

export function CardActionFooter({ actions, className }: CardActionFooterProps) {
    if (!actions || actions.length === 0) return null;

    return (
        <div className={cn("flex items-center justify-end p-2 border-t bg-muted/20", className)}>
            {actions.map((action, index) => (
                <div key={action.label} className={cn("flex items-center", action.showLabel === false ? "flex-none" : "flex-1")}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            action.onClick();
                        }}
                        disabled={action.disabled}
                        className={cn(
                            "h-8 text-xs font-medium hover:bg-background/80 hover:shadow-sm transition-all",
                            action.showLabel === false ? "w-8 px-0" : "flex-1",
                            action.className
                        )}
                        title={action.label}
                    >
                        {action.icon && <action.icon className={cn("h-3.5 w-3.5", action.showLabel !== false && "mr-2")} />}
                        {action.showLabel !== false && action.label}
                        {action.showLabel === false && <span className="sr-only">{action.label}</span>}
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

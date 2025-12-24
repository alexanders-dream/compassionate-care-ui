import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps extends React.ComponentPropsWithoutRef<typeof Button> {
    className?: string;
}

/**
 * Theme Toggle Component
 * Provides a button to toggle between light and dark mode.
 * Persists preference to localStorage and respects system preference on first visit.
 */
export const ThemeToggle = forwardRef<HTMLButtonElement, ThemeToggleProps>(
    ({ className, ...props }, ref) => {
        const [isDark, setIsDark] = useState(false);
        const [mounted, setMounted] = useState(false);

        useEffect(() => {
            setMounted(true);

            // Check for saved preference, then system preference
            const savedTheme = localStorage.getItem("theme");
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

            if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
                document.documentElement.classList.add("dark");
                setIsDark(true);
            } else {
                document.documentElement.classList.remove("dark");
                setIsDark(false);
            }
        }, []);

        const toggleTheme = () => {
            const newIsDark = !isDark;
            setIsDark(newIsDark);

            if (newIsDark) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme", "light");
            }
        };

        // Avoid hydration mismatch by not rendering until mounted
        if (!mounted) {
            return (
                <Button ref={ref} variant="ghost" size="icon" className={cn("w-9 h-9", className)} disabled {...props}>
                    <Sun className="h-4 w-4" />
                </Button>
            );
        }

        return (
            <Button
                ref={ref}
                variant="ghost"
                size="icon"
                className={cn("w-9 h-9", className)}
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                {...props}
                onClick={(e) => {
                    toggleTheme();
                    props.onClick?.(e);
                }}
            >
                {isDark ? (
                    <Sun className="h-4 w-4" />
                ) : (
                    <Moon className="h-4 w-4" />
                )}
            </Button>
        );
    }
);
ThemeToggle.displayName = "ThemeToggle";

export default ThemeToggle;

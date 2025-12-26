import { ClipboardList, CalendarDays, Bell, Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "./AdminSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

const AdminMobileBottomNav = () => {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    const isActive = (path: string) => location.pathname.startsWith(path);

    const getActiveIndex = () => {
        if (open) return 4;
        if (isActive("/admin/notifications")) return 3;
        if (isActive("/admin/appointments")) return 1;
        if (isActive("/admin/submissions")) return 0;
        return activeTab; // Fallback or stick to last known
    };

    const currentIndex = getActiveIndex();

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/90 border-t border-border z-50 pb-safe">
            {/* Sliding Indicator */}
            <div className="absolute top-0 left-0 h-[2px] w-full">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out rounded-full"
                    style={{
                        width: '20%', // 100% / 5 items
                        transform: `translateX(${currentIndex * 100}%)`
                    }}
                />
            </div>

            <div className="flex items-center justify-around h-16">
                {/* 1. Submissions */}
                <Link
                    to="/admin/submissions"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                        isActive("/admin/submissions") ? "text-primary" : "text-muted-foreground hover:text-foreground active:text-primary"
                    )}
                    onClick={() => setOpen(false)}
                >
                    <ClipboardList className={cn("h-5 w-5 transition-all duration-200")} strokeWidth={isActive("/admin/submissions") ? 2.5 : 1.5} />
                    <span className="text-[10px] font-medium">Requests</span>
                </Link>

                {/* 2. Appointments */}
                <Link
                    to="/admin/appointments"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                        isActive("/admin/appointments") ? "text-primary" : "text-muted-foreground hover:text-foreground active:text-primary"
                    )}
                    onClick={() => setOpen(false)}
                >
                    <CalendarDays className={cn("h-5 w-5 transition-all duration-200")} strokeWidth={isActive("/admin/appointments") ? 2.5 : 1.5} />
                    <span className="text-[10px] font-medium">Calendar</span>
                </Link>

                {/* 3. Central FAB (Schedule) */}
                <div className="relative -top-5">
                    <Link to="/admin/appointments?action=schedule" onClick={() => setOpen(false)}>
                        <div className="h-14 w-14 rounded-full bg-blue-600 shadow-lg shadow-blue-600/20 flex items-center justify-center text-white hover:bg-blue-700 active:scale-95 transition-all duration-200 border-4 border-background">
                            <CalendarDays className="h-6 w-6" strokeWidth={2.5} />
                        </div>
                    </Link>
                </div>

                {/* 4. Alerts */}
                <Link
                    to="/admin/notifications"
                    className={cn(
                        "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                        isActive("/admin/notifications") ? "text-primary" : "text-muted-foreground hover:text-foreground active:text-primary"
                    )}
                    onClick={() => setOpen(false)}
                >
                    <Bell className={cn("h-5 w-5 transition-all duration-200", isActive("/admin/notifications") && "fill-current")} strokeWidth={isActive("/admin/notifications") ? 2.5 : 1.5} />
                    <span className="text-[10px] font-medium">Alerts</span>
                </Link>

                {/* 5. More (Menu) */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <button
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                open ? "text-primary" : "text-muted-foreground hover:text-foreground active:text-primary"
                            )}
                        >
                            <Menu className={cn("h-5 w-5 transition-all duration-200")} strokeWidth={open ? 2.5 : 1.5} />
                            <span className="text-[10px] font-medium">Menu</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[80vw] p-0 flex flex-col">
                        <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
                        <div className="p-4 border-b border-border flex items-center justify-between">
                            <span className="font-semibold text-sm text-foreground">Menu</span>
                        </div>
                        <ScrollArea className="flex-1">
                            <SidebarContent onItemClick={() => setOpen(false)} />
                        </ScrollArea>
                        <div className="p-4 border-t border-border flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Theme</span>
                            <ThemeToggle className="text-muted-foreground hover:text-foreground" />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
};

export default AdminMobileBottomNav;

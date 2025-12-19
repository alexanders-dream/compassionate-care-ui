import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background w-full overflow-hidden">
            <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
                <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900/50 md:bg-transparent dark:md:bg-transparent">
                    <div className={cn(
                        "container mx-auto p-6 md:p-8 max-w-7xl animate-in fade-in duration-500",
                        sidebarCollapsed ? "md:max-w-[calc(100vw-5rem)]" : ""
                    )}>
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;

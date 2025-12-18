import {
  ClipboardList, CalendarDays, Settings2, Type, BookOpen,
  FileText, Star, Briefcase, Users, HelpCircle, ChevronLeft, ChevronRight, Menu, LogOut, Home, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type AdminSection =
  | "submissions"
  | "appointments"

  | "site-copy"
  | "resources"
  | "blog"
  | "testimonials"
  | "services"
  | "team"
  | "faqs";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems: { id: AdminSection; label: string; icon: React.ElementType; path: string }[] = [
  { id: "submissions", label: "Submissions", icon: ClipboardList, path: "/admin/submissions" },
  { id: "appointments", label: "Appointments", icon: CalendarDays, path: "/admin/appointments" },

  { id: "site-copy", label: "Site Copy", icon: Type, path: "/admin/site-copy" },
  { id: "resources", label: "Resources", icon: BookOpen, path: "/admin/resources" },
  { id: "blog", label: "Blog", icon: FileText, path: "/admin/blog" },
  { id: "testimonials", label: "Testimonials", icon: Star, path: "/admin/testimonials" },
  { id: "services", label: "Services", icon: Briefcase, path: "/admin/services" },
  { id: "team", label: "Team", icon: Users, path: "/admin/team" },
  { id: "faqs", label: "FAQs", icon: HelpCircle, path: "/admin/faqs" },
];

const SidebarNavItem = ({
  item,
  collapsed,
  onItemClick
}: {
  item: { label: string; icon: React.ElementType; path: string };
  collapsed: boolean;
  onItemClick?: () => void;
}) => {
  const Icon = item.icon;

  const navLink = (
    <NavLink
      to={item.path}
      onClick={onItemClick}
      className={({ isActive }) => cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
        isActive
          ? "bg-blue-100 dark:bg-blue-900/40 text-foreground"
          : "text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {navLink}
        </TooltipTrigger>
        <TooltipContent
          side="right"
          className="bg-slate-900 text-white font-medium px-3 py-1.5 rounded-full shadow-lg border-0"
          sideOffset={8}
        >
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return navLink;
};
const SidebarContent = ({
  collapsed = false,
  onItemClick
}: {
  collapsed?: boolean;
  onItemClick?: () => void;
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
    if (onItemClick) onItemClick();
  };

  return (
    <TooltipProvider>
      <nav className="p-2 space-y-1">
        {menuItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            onItemClick={onItemClick}
          />
        ))}

        <div className="my-2 border-t border-border/50" />

        {/* Exit to Home */}
        <SidebarNavItem
          item={{ label: "Exit to Home", icon: Home, path: "/" }}
          collapsed={collapsed}
          onItemClick={onItemClick}
        />

        <div className="mt-auto pt-4 border-t border-border/50 space-y-1">
          {/* Profile Link */}
          <NavLink
            to="/admin/profile"
            onClick={onItemClick}
            className={({ isActive }) => cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
              isActive
                ? "bg-blue-100 dark:bg-blue-900/40 text-foreground"
                : "text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <User className="h-4 w-4 shrink-0" />
            {!collapsed && <span>My Profile</span>}
          </NavLink>

          {/* Logout */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium justify-center h-auto",
                    "text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground"
                  )}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-slate-900 text-white font-medium px-3 py-1.5 rounded-full shadow-lg border-0"
                sideOffset={8}
              >
                Logout
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium justify-start h-auto",
                "text-muted-foreground hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-foreground"
              )}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Logout</span>
            </Button>
          )}
        </div>

      </nav>
    </TooltipProvider>
  );
};

const AdminSidebar = ({ collapsed, onToggleCollapse }: AdminSidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mobile: Sheet drawer
  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden bg-background border shadow-sm"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <div className="p-4 border-b border-border">
            <span className="font-semibold text-sm text-foreground">Navigation</span>
          </div>
          <ScrollArea className="h-[calc(100vh-60px)]">
            <SidebarContent
              onItemClick={() => setMobileOpen(false)}
            />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  return (
    <aside
      className={cn(
        "bg-slate-100 dark:bg-slate-900 border-r border-border flex flex-col shrink-0 transition-all duration-300 hidden md:flex",
        collapsed ? "w-16" : "w-56"
      )}
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <span className="font-semibold text-sm text-foreground">Navigation</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className={cn("h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-700", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <SidebarContent
          collapsed={collapsed}
        />
      </ScrollArea>

      {!collapsed && (
        <div className="p-3 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Admin Panel
          </p>
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;

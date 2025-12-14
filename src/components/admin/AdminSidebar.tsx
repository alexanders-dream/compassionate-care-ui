import { 
  ClipboardList, CalendarDays, Settings2, Type, BookOpen, 
  FileText, Star, Briefcase, Users, HelpCircle, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export type AdminSection = 
  | "submissions" 
  | "appointments" 
  | "forms" 
  | "site-copy" 
  | "resources" 
  | "blog" 
  | "testimonials" 
  | "services" 
  | "team" 
  | "faqs";

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const menuItems: { id: AdminSection; label: string; icon: React.ElementType }[] = [
  { id: "submissions", label: "Submissions", icon: ClipboardList },
  { id: "appointments", label: "Appointments", icon: CalendarDays },
  { id: "forms", label: "Forms", icon: Settings2 },
  { id: "site-copy", label: "Site Copy", icon: Type },
  { id: "resources", label: "Resources", icon: BookOpen },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "testimonials", label: "Testimonials", icon: Star },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "team", label: "Team", icon: Users },
  { id: "faqs", label: "FAQs", icon: HelpCircle },
];

const AdminSidebar = ({ activeSection, onSectionChange, collapsed, onToggleCollapse }: AdminSidebarProps) => {
  return (
    <aside 
      className={cn(
        "bg-card border-r border-border flex flex-col shrink-0 transition-all duration-300",
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
          className={cn("h-8 w-8", collapsed && "mx-auto")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  "hover:bg-muted",
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "text-muted-foreground",
                  collapsed && "justify-center px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
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

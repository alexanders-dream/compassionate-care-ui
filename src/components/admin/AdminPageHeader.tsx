import { useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminPageHeaderProps {
    title: string;
    description?: React.ReactNode;
}

/**
 * Admin page header component that displays the page title on the left
 * and the logged-in user's profile picture and name on the right.
 */
const AdminPageHeader = ({ title, description }: AdminPageHeaderProps) => {
    const { profile, loading, user } = useUserProfile();
    const navigate = useNavigate();

    // Only show name after profile is loaded to avoid email flash
    const displayName = profile?.full_name || (loading ? "" : user?.email?.split('@')[0]) || "User";
    const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "";

    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
                {description && (
                    <p className="text-muted-foreground">{description}</p>
                )}
            </div>

            {/* User Profile - Desktop Only */}
            <button
                onClick={() => navigate("/admin/profile")}
                className="hidden md:flex items-center gap-3 hover:bg-muted/50 rounded-full pl-3 pr-4 py-1.5 transition-colors shrink-0"
            >
                {loading ? (
                    <>
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                    </>
                ) : (
                    <>
                        <Avatar className="h-9 w-9 border border-border">
                            <AvatarImage src={profile?.avatar_url || ""} alt={displayName} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">{displayName}</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default AdminPageHeader;


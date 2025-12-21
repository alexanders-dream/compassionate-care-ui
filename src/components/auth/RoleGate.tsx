import { ReactNode } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";

interface RoleGateProps {
    /** Roles that are allowed to see the children */
    allowedRoles: UserRole[];
    /** Content to show if user has required role */
    children: ReactNode;
    /** Optional: Content to show if user doesn't have required role (defaults to nothing) */
    fallback?: ReactNode;
}

/**
 * RoleGate - A component for conditional UI rendering based on user roles.
 * 
 * Use this to show/hide features within components based on the user's role.
 * This provides defense-in-depth alongside route-level protection.
 * 
 * @example
 * // Only show delete button for admins
 * <RoleGate allowedRoles={['admin']}>
 *   <Button onClick={handleDelete}>Delete</Button>
 * </RoleGate>
 * 
 * @example
 * // Show different content for different roles
 * <RoleGate allowedRoles={['admin', 'medical_staff']} fallback={<ReadOnlyView />}>
 *   <EditableView />
 * </RoleGate>
 */
const RoleGate = ({ allowedRoles, children, fallback = null }: RoleGateProps) => {
    const { hasRole, user } = useAuth();

    // If not authenticated, don't render anything
    if (!user) {
        return <>{fallback}</>;
    }

    // Check if user has one of the allowed roles
    if (!hasRole(allowedRoles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default RoleGate;

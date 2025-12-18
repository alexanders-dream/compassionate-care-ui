import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Optional: Restrict route to specific roles. If not provided, any authenticated user can access. */
  allowedRoles?: UserRole[];
  /** @deprecated Use allowedRoles instead. Kept for backward compatibility. */
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, allowedRoles, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, userRole, hasRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Determine which roles are allowed
  // Priority: allowedRoles prop > requireAdmin legacy prop > all authenticated users
  let effectiveAllowedRoles: UserRole[] | undefined = allowedRoles;

  if (!effectiveAllowedRoles && requireAdmin) {
    // Legacy backward compatibility
    effectiveAllowedRoles = ["admin"];
  }

  // Check role-based access (defense in depth)
  if (effectiveAllowedRoles && !hasRole(effectiveAllowedRoles)) {
    // Log access denial for security auditing (development only)
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[ProtectedRoute] Access denied for user role "${userRole}" to ${location.pathname}. ` +
        `Required roles: ${effectiveAllowedRoles.join(", ")}`
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this page.
            Your current role ({userRole}) does not have the required permissions.
          </p>
          <div className="space-x-4">
            <a href="/admin" className="text-primary hover:underline">
              Go to Dashboard
            </a>
            <span className="text-muted-foreground">|</span>
            <a href="/" className="text-primary hover:underline">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;


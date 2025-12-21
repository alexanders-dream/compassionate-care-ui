import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Valid roles in the system
export type UserRole = "admin" | "medical_staff" | "front_office" | "user";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: UserRole;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: "user",
  isAdmin: false,
  loading: true,
  signOut: async () => { },
  hasRole: () => false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(true);

  // Derived state for backward compatibility
  const isAdmin = userRole === "admin";

  const fetchUserRole = async (userId: string): Promise<UserRole> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching user role:", error);
        return "user";
      }

      // Validate the role is a known type
      const role = data?.role as UserRole;
      if (role && ["admin", "medical_staff", "front_office", "user"].includes(role)) {
        return role;
      }
      return "user";
    } catch (error) {
      console.error("Error fetching user role:", error);
      return "user";
    }
  };

  // Helper function to check if user has one of the allowed roles
  const hasRole = useCallback((allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(userRole);
  }, [userRole]);

  // Handle user role fetching as a reaction to user changes
  useEffect(() => {
    if (user) {
      fetchUserRole(user.id).then(setUserRole);
    } else {
      setUserRole("user");
    }
  }, [user]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole("user");
  };

  return (
    <AuthContext.Provider value={{ user, session, userRole, isAdmin, loading, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

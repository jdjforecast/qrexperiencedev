"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase";
import { ROUTES } from "@/lib/routes";

// Define public routes based on the ROUTES object
const PUBLIC_ROUTE_VALUES: string[] = [
  ROUTES.HOME,
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.PRODUCTS,
  // Need a way to match dynamic product routes, regex might be better
  // For now, let's assume /products/* is public
];

// Define admin routes based on the ROUTES object
const ADMIN_ROUTE_PREFIX = ROUTES.ADMIN.DASHBOARD; // "/admin"

function isPublicRoute(path: string): boolean {
  if (path.startsWith(ROUTES.PRODUCTS + '/')) return true; // Treat all /products/... as public
  return PUBLIC_ROUTE_VALUES.includes(path);
}

function isAdminRoute(path: string): boolean {
  return path.startsWith(ADMIN_ROUTE_PREFIX);
}

interface ProfileData {
  id: string;
  role: string;
  full_name?: string;
  company_name?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<{ success: boolean; message: string }>;
  refreshUser: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getBrowserClient(), []);
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user session and profile
  const fetchUserAndProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get Supabase session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("AuthProvider: Session error", sessionError);
        setError(sessionError.message);
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      // If no session, clear state
      if (!session) {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        return;
      }
      
      // Set user from session
      setUser(session.user);
      
      // Fetch profile data from Supabase
      if (session.user.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error("AuthProvider: Profile fetch error", profileError);
          // Continue with just the user data
        } else if (profileData) {
          setProfile(profileData);
          setIsAdmin(profileData.role === "admin");
        }
      }
    } catch (err) {
      console.error("AuthProvider: Error fetching user and profile", err);
      setError("Error al cargar la sesión del usuario");
    } finally {
      setIsLoading(false);
    }
  };

  // Load user on initial mount
  useEffect(() => {
    fetchUserAndProfile();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("AuthProvider: Auth state change", event);
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
          await fetchUserAndProfile();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Effect for route protection
  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = !!user;

    if (!isAuthenticated && !isPublicRoute(pathname)) {
      console.log(`AuthProvider: Not authenticated, redirecting from ${pathname} to login`);
      router.push(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAuthenticated && isAdminRoute(pathname) && !isAdmin) {
      console.log(`AuthProvider: Authenticated but not admin, redirecting from ${pathname} to dashboard`);
      router.push(ROUTES.PROFILE);
      return;
    }

    if (isAuthenticated && (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER)) {
      console.log(`AuthProvider: Authenticated, redirecting from ${pathname} to dashboard`);
      router.push(ROUTES.PROFILE);
    }
  }, [user, profile, pathname, isLoading, router, isAdmin]);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("AuthProvider: Sign in error", error);
        return { success: false, message: error.message };
      }
      
      await fetchUserAndProfile();
      
      return { success: true, message: "Inicio de sesión exitoso" };
    } catch (err) {
      console.error("AuthProvider: Sign in error", err);
      return { success: false, message: "Error al iniciar sesión" };
    }
  };

  // Sign out
  const signOut = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("AuthProvider: Sign out error", error);
        return { success: false, message: error.message };
      }
      
      // Clear local state
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      
      return { success: true, message: "Sesión cerrada exitosamente" };
    } catch (err) {
      console.error("AuthProvider: Sign out error", err);
      return { success: false, message: "Error al cerrar sesión" };
    }
  };

  // Function to manually refresh profile
  const refreshUser = async () => {
    if (user) {
      await fetchUserAndProfile();
    } else {
      console.log("AuthProvider: Cannot refresh profile, no user available");
    }
  };

  // Function to refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("AuthProvider: Session refresh error", error);
        setError("Error al actualizar la sesión");
      } else {
        await fetchUserAndProfile();
      }
    } catch (err) {
      console.error("AuthProvider: Error refreshing session", err);
      setError("Error al actualizar la sesión");
    }
  };

  // Memoize the final context value
  const value = useMemo(() => ({
    user,
    profile,
    isLoading,
    isAdmin,
    error,
    isAuthenticated: !!user,
    signIn,
    signOut,
    refreshUser,
    refreshSession
  }), [user, profile, isLoading, isAdmin, error]);
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 
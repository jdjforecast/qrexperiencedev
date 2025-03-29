"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, Session, AuthChangeEvent, SupabaseClient } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase";
import { ROUTES } from "@/lib/routes";
// Import NextAuth functions and hook from our client wrapper
import { 
  signIn as nextAuthSignIn, 
  signOut as nextAuthSignOut, 
  useAuth as useAppAuth 
} from "@/lib/auth/client";
// Import server function to get profile (assuming it uses Supabase admin client internally)
import { getUserProfile } from "@/lib/auth"; 

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
  user: any | null; // Using any to accommodate the combined user data
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

  // Use our custom hook that wraps NextAuth's useSession
  const { session, status: nextAuthStatus, isLoading: nextAuthHookIsLoading } = useAppAuth();
  const nextAuthIsLoading = nextAuthHookIsLoading || nextAuthStatus === 'loading';
  const userId = session?.user?.id; // Assuming NextAuth session.user has the Supabase ID

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  // Combined loading state: true if either NextAuth or profile fetch is loading
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(true);
  const isLoading = nextAuthIsLoading || isProfileLoading;
  const [error, setError] = useState<string | null>(null);

  // Fetch Supabase profile based on NextAuth user ID
  const fetchProfile = async (currentUserId: string): Promise<ProfileData | null> => {
    if (!currentUserId) return null;
    setIsProfileLoading(true);
    setError(null);
    try {
      console.log(`AuthProvider: Fetching Supabase profile for user ID: ${currentUserId}`);
      // Use the server function getUserProfile (needs Supabase Admin client internally)
      const profileData = await getUserProfile(currentUserId);
      console.log("AuthProvider: Fetched profile data:", profileData);
      if (!profileData) {
          console.warn(`AuthProvider: No profile found for user ${currentUserId}`);
          // Optionally create a default profile here if needed, or handle missing profile downstream
      }
      return profileData as ProfileData;
    } catch (err) {
      console.error("AuthProvider: Profile fetch error:", err);
      setError("Error al cargar el perfil del usuario.");
      return null;
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Effect to fetch profile when NextAuth session is available/changes
  useEffect(() => {
    if (userId) {
      fetchProfile(userId).then(fetchedProfile => {
        setProfile(fetchedProfile);
        setIsAdmin(fetchedProfile?.role === "admin");
      });
    } else if (!nextAuthIsLoading) {
      // If NextAuth is not loading and there's no userId, clear profile
      setProfile(null);
      setIsAdmin(false);
      setIsProfileLoading(false); // Ensure loading stops if no user
    }
    // Dependencies: userId derived from NextAuth session, and nextAuthIsLoading status
  }, [userId, nextAuthIsLoading]);

  // Effect for route protection
  useEffect(() => {
    if (isLoading) return; // Wait until both NextAuth and profile loading are done

    const isAuthenticated = !!userId;
    const currentIsAdmin = profile?.role === "admin";

    if (!isAuthenticated && !isPublicRoute(pathname)) {
      console.log(`AuthProvider: Not authenticated, redirecting from ${pathname} to login`);
      router.push(`${ROUTES.LOGIN}?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (isAuthenticated && isAdminRoute(pathname) && !currentIsAdmin) {
      console.log(`AuthProvider: Authenticated but not admin, redirecting from ${pathname} to dashboard`);
      router.push(ROUTES.PROFILE); // Redirect non-admins from admin routes
      return;
    }

    if (isAuthenticated && (pathname === ROUTES.LOGIN || pathname === ROUTES.REGISTER)) {
      console.log(`AuthProvider: Authenticated, redirecting from ${pathname} to dashboard`);
      router.push(ROUTES.PROFILE); // Redirect logged-in users from login/register
    }
  }, [userId, profile, pathname, isLoading, router]); // Depends on combined isLoading

  // SignIn using NextAuth
  const signIn = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    console.log("AuthProvider: Attempting sign in via NextAuth...");
    try {
      const result = await nextAuthSignIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      console.log("AuthProvider: NextAuth signIn result:", result);

      if (result?.ok) {
        return { success: true, message: "Inicio de sesión exitoso" };
      } else {
        return { success: false, message: result?.error || "Error al iniciar sesión" };
      }
    } catch (err) {
      console.error("AuthProvider: NextAuth sign in error:", err);
      return { success: false, message: "Error al iniciar sesión" };
    }
  }

  // SignOut using NextAuth
  const signOut = async (): Promise<{ success: boolean; message: string }> => {
    console.log("AuthProvider: Attempting sign out via NextAuth...");
    try {
      await nextAuthSignOut({ redirect: false });
      // Clear local state immediately
      setProfile(null);
      setIsAdmin(false);
      return { success: true, message: "Sesión cerrada exitosamente" };
    } catch (err) {
      console.error("AuthProvider: NextAuth sign out error:", err);
      return { success: false, message: "Error al cerrar sesión" };
    }
  }

  // Function to manually refresh profile (renamed from refreshProfile to refreshUser)
  const refreshUser = async () => {
    if (userId) {
      const fetchedProfile = await fetchProfile(userId);
      setProfile(fetchedProfile);
      setIsAdmin(fetchedProfile?.role === "admin");
    } else {
      console.log("AuthProvider: Cannot refresh profile, no user ID available.");
    }
  };

  // Function to refresh session
  const refreshSession = async () => {
    try {
      await refreshUser();
    } catch (err) {
      console.error("AuthProvider: Error refreshing session:", err);
      setError("Error al actualizar la sesión");
    }
  };

  // Construct the user object for the context value
  // Combine data from NextAuth session (like email) with Supabase profile
  const contextUser = useMemo(() => {
    if (!profile) return null;
    return {
      ...session?.user, // Include basic session info like email
      ...profile, // Include all profile fields (id, role, full_name, etc.)
      id: profile.id // Ensure Supabase profile ID overrides session ID if different
    };
  }, [session, profile]);

  // Memoize the final context value
  const value = useMemo(() => ({
    user: contextUser,
    profile,
    isLoading,
    isAdmin,
    error,
    isAuthenticated: !!contextUser,
    signIn,
    signOut,
    refreshUser,
    refreshSession
  }), [contextUser, profile, isLoading, isAdmin, error, signIn, signOut, refreshUser, refreshSession]);
  
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
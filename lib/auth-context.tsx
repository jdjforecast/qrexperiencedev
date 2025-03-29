"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { createBrowserClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { signIn, signOut } from "@/lib/auth/client";
import { useToast } from "@/components/ui/use-toast";

// Define profile data type
interface ProfileData {
  id: string;
  role: string;
  full_name?: string;
  company_name?: string;
  [key: string]: any;
}

// Define the auth context shape
interface AuthContextType {
  user: User | null;
  profile: ProfileData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  
  // Function to fetch user profile
  const fetchProfile = async (userId: string) => {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      
      return data as ProfileData;
    } catch (error) {
      console.error("Exception fetching profile:", error);
      return null;
    }
  };
  
  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const supabase = createBrowserClient();
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
        
        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user) {
              setUser(session.user);
              const profileData = await fetchProfile(session.user.id);
              setProfile(profileData);
            } else {
              setUser(null);
              setProfile(null);
            }
            
            // Force router refresh to update UI based on auth state
            router.refresh();
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [router]);
  
  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      
      if (result.success && result.user) {
        const profileData = await fetchProfile(result.user.id);
        setProfile(profileData);
        toast({
          title: "Login successful",
          description: "Welcome back!",
          variant: "default",
        });
      } else {
        toast({
          title: "Login failed",
          description: result.message,
          variant: "destructive",
        });
      }
      
      return result;
    } catch (error) {
      let message = "Unknown error during login";
      if (error instanceof Error) message = error.message;
      
      toast({
        title: "Login error",
        description: message,
        variant: "destructive",
      });
      
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut();
      setUser(null);
      setProfile(null);
      router.push("/");
      router.refresh();
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Logout error:", error);
      
      toast({
        title: "Logout error",
        description: "There was a problem logging out",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };
  
  const isAdmin = profile?.role === "admin";
  const isAuthenticated = !!user;
  
  const value = {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    refreshProfile,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 
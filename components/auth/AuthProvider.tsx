"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createSupabaseClient, PUBLIC_ROUTES, ADMIN_ROUTES } from "@/lib/supabase/index";

// Cliente de Supabase para el navegador
const supabase = createSupabaseClient();

function isPublicRoute(path: string): boolean {
  return PUBLIC_ROUTES.some((route: string) => 
    path === route || path.startsWith(`${route}/`)
  );
}

function isAdminRoute(path: string): boolean {
  return ADMIN_ROUTES.some((route: string) => 
    path === route || path.startsWith(`${route}/`)
  );
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
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Función para obtener los datos del perfil
  const fetchProfile = async (userId: string) => {
    try {
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
      console.error("Profile fetch error:", error);
      return null;
    }
  };

  // Inicializar estado de autenticación
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Obtener sesión inicial
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        }
        
        // Configurar listener para cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
              setUser(session.user);
              const profileData = await fetchProfile(session.user.id);
              setProfile(profileData);
            } else {
              setUser(null);
              setProfile(null);
            }
            
            // Force refresh
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

  // Protección de rutas
  useEffect(() => {
    if (isLoading) return;

    // Si no está autenticado y la ruta no es pública, redirigir a login
    if (!user && !isPublicRoute(pathname)) {
      router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Si es una ruta de admin y no es admin, redirigir a dashboard
    if (user && isAdminRoute(pathname) && profile?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Si está autenticado e intenta acceder a login/register, redirigir a dashboard
    if (user && (pathname === "/login" || pathname === "/register")) {
      router.push("/dashboard");
    }
  }, [user, profile, pathname, isLoading, router]);

  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, message: error.message };
      }

      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
        return { success: true, message: "Inicio de sesión exitoso" };
      } else {
        return { success: false, message: "No se pudo obtener la información del usuario" };
      }
    } catch (error) {
      let message = "Error desconocido al iniciar sesión";
      if (error instanceof Error) message = error.message;
      return { success: false, message };
    }
  };

  // Cerrar sesión
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Refrescar datos del perfil
  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  const isAdmin = profile?.role === "admin";
  
  const value = {
    user,
    profile,
    isLoading,
    isAdmin,
    signIn,
    signOut,
    refreshProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-azul-claro"></div>
            <p className="mt-2 text-lg text-gray-600">Cargando...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Custom hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 
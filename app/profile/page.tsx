import { getCurrentUser, getUserProfile } from "@/lib/auth/server"
import RouteGuard from "@/components/auth/route-guard"
import type { User } from '@supabase/supabase-js'; // Import User type for profile

// Define Profile type inline or import if defined elsewhere
interface ProfileData {
    id: string;
    role: 'customer' | 'admin' | string;
    full_name?: string;
    company_name?: string;
    [key: string]: any;
}

// Make the component async
export default async function ProfilePage() {
  // Fetch data directly on the server
  const user: User | null = await getCurrentUser();
  let profile: ProfileData | null = null;
  let error: string | null = null;

  if (user) {
    try {
      // Fetch profile data (getUserProfile handles potential null profile)
      profile = await getUserProfile(user.id); 
      if (!profile) {
          // Optional: Set an error if profile fetch technically succeeded but returned null unexpectedly
          // error = "No se encontró información de perfil detallada.";
          console.warn(`No profile data returned for user ${user.id}, but user exists.`);
      }
    } catch (err) {
      console.error("Error loading profile server-side:", err);
      error = "No se pudo cargar la información del perfil";
    }
  } else {
     // Handle case where user is not logged in (RouteGuard might handle this too)
     // Depending on RouteGuard behavior, this might be redundant or necessary
     // For now, we let RouteGuard handle the redirect if user is null
     console.log("ProfilePage: User not logged in.");
  }

  // Render based on fetched data
  return (
    <RouteGuard> { /* RouteGuard likely handles the redirect if user is null */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Perfil de Usuario</h1>

        {/* Removed client-side loading state, handled by server render */}
         
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            {/* Revalidate or link to retry? Simple message for now. */}
          </div>
        // Check for user existence before profile check, as profile depends on user
        ) : !user ? (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                <p>Debes iniciar sesión para ver tu perfil.</p> { /* Or rely on RouteGuard */}
            </div>
        ) : !profile ? (
          // This case now means getUserProfile returned null or wasn't called (user null)
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>No se encontró información de perfil detallada.</p>
          </div>
        ) : (
          // Render profile data
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Información Personal</h2>
              <p>
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p>
                <span className="font-medium">Nombre:</span> {profile.full_name || "No especificado"}
              </p>
              <p>
                <span className="font-medium">Empresa:</span> {profile.company_name || "No especificada"}
              </p>
            </div>

            {profile.role === "admin" && (
              <div className="mt-4 p-3 bg-blue-100 rounded-md">
                <p className="text-blue-800 font-medium">Tienes permisos de administrador</p>
              </div>
            )}

            {/* Edit button or other actions could be added here */}
            {/* Example: Link to an edit page */}
            {/* 
            <div className="mt-6">
              <Link href="/profile/edit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Editar Perfil
              </Link>
            </div>
            */}
          </div>
        )}
      </div>
    </RouteGuard>
  )
}


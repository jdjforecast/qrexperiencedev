import { redirect } from "next/navigation"
import { getServerClient } from "@/lib/supabase-client-server"
import { getCurrentUser } from "@/lib/auth-utils"
import RegisterForm from "./register-form"

export default async function RegisterPage() {
  try {
    const supabase = getServerClient()
    const user = await getCurrentUser(supabase)

    // If user is already logged in, redirect to products
    if (user) {
      redirect("/products")
    }

    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
          <RegisterForm />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in register page:", error)

    // Render the register form even if there's an error checking the user
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Create an Account</h1>
          <RegisterForm />
        </div>
      </div>
    )
  }
}


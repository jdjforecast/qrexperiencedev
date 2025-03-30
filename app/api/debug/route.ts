import { NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase-client-server"

export async function GET() {
  // List all exports from the supabase module
  const exports = Object.keys(getServerClient)

  return NextResponse.json({
    message: "Debug information",
    exports,
    moduleExists: !!getServerClient,
  })
}


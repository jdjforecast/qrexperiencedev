import { NextResponse } from "next/server"
import * as supabaseModule from "@/lib/supabase"

export async function GET() {
  // List all exports from the supabase module
  const exports = Object.keys(supabaseModule)

  return NextResponse.json({
    message: "Debug information",
    exports,
    moduleExists: !!supabaseModule,
  })
}


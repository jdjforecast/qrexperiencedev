import { createAdminClient } from "@/lib/supabase"

export interface SchemaAnalysisResult {
  authUsers: number
  profilesCount: number
  orphanedProfiles: number
  usersWithoutProfiles: {
    count: number
    examples: Array<{ id: string; email: string }>
  }
  profilesWithoutAuthUsers: {
    count: number
    examples: Array<{ id: string }>
  }
}

/**
 * Analyzes the relationship between auth.users and profiles tables
 * This function requires admin privileges to access auth schema
 */
export async function analyzeUserProfilesRelationship(): Promise<SchemaAnalysisResult> {
  const supabase = createAdminClient()

  // Get all auth users
  const { data: authUsers, error: authError } = await supabase.from("auth.users").select("id, email")

  if (authError) {
    console.error("Error fetching auth users:", authError)
    throw new Error(`Failed to fetch auth users: ${authError.message}`)
  }

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id")

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
  }

  // Create sets for faster lookups
  const authUserIds = new Set(authUsers?.map((user) => user.id) || [])
  const profileIds = new Set(profiles?.map((profile) => profile.id) || [])

  // Find users without profiles
  const usersWithoutProfiles = (authUsers || []).filter((user) => !profileIds.has(user.id))

  // Find profiles without auth users
  const profilesWithoutAuthUsers = (profiles || []).filter((profile) => !authUserIds.has(profile.id))

  // Prepare result
  return {
    authUsers: authUserIds.size,
    profilesCount: profileIds.size,
    orphanedProfiles: profilesWithoutAuthUsers.length,
    usersWithoutProfiles: {
      count: usersWithoutProfiles.length,
      examples: usersWithoutProfiles.slice(0, 5).map((user) => ({
        id: user.id,
        email: user.email || "unknown",
      })),
    },
    profilesWithoutAuthUsers: {
      count: profilesWithoutAuthUsers.length,
      examples: profilesWithoutAuthUsers.slice(0, 5).map((profile) => ({
        id: profile.id,
      })),
    },
  }
}

/**
 * Creates missing profiles for users that don't have one
 * @returns Number of profiles created
 */
export async function createMissingProfiles(): Promise<number> {
  const supabase = createAdminClient()

  // Get all auth users
  const { data: authUsers, error: authError } = await supabase
    .from("auth.users")
    .select("id, email, raw_user_meta_data")

  if (authError) {
    console.error("Error fetching auth users:", authError)
    throw new Error(`Failed to fetch auth users: ${authError.message}`)
  }

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id")

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
    throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
  }

  // Create set of profile IDs for faster lookup
  const profileIds = new Set(profiles?.map((profile) => profile.id) || [])

  // Find users without profiles
  const usersWithoutProfiles = (authUsers || []).filter((user) => !profileIds.has(user.id))

  console.log(`Found ${usersWithoutProfiles.length} users without profiles. Creating missing profiles...`)

  let createdCount = 0

  // Create profiles for users that don't have one
  for (const user of usersWithoutProfiles) {
    try {
      const userData = (user.raw_user_meta_data as any) || {}

      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name: userData.full_name || null,
        company_name: userData.company_name || null,
        role: "user", // Default role
      })

      if (error) {
        console.error(`Failed to create profile for user ${user.id}:`, error)
      } else {
        createdCount++
      }
    } catch (err) {
      console.error(`Error creating profile for user ${user.id}:`, err)
    }
  }

  console.log(`Created ${createdCount} profiles successfully`)
  return createdCount
}

/**
 * Checks if the profiles table has the correct structure
 * and foreign key constraints
 */
export async function checkProfilesTableStructure(): Promise<{
  hasCorrectColumns: boolean
  hasForeignKeyConstraint: boolean
  missingColumns: string[]
}> {
  const supabase = createAdminClient()

  // Expected columns in profiles table
  const expectedColumns = ["id", "email", "full_name", "company_name", "role", "created_at", "updated_at"]

  // Get table information
  const { data: columns, error: columnsError } = await supabase.rpc("get_table_columns", { table_name: "profiles" })

  if (columnsError) {
    console.error("Error fetching table columns:", columnsError)
    throw new Error(`Failed to fetch table columns: ${columnsError.message}`)
  }

  // Check for foreign key constraint
  const { data: constraints, error: constraintsError } = await supabase.rpc("get_foreign_keys", {
    table_name: "profiles",
  })

  if (constraintsError) {
    console.error("Error fetching foreign keys:", constraintsError)
    throw new Error(`Failed to fetch foreign keys: ${constraintsError.message}`)
  }

  // Check if there's a foreign key to auth.users
  const hasForeignKeyToAuthUsers = (constraints || []).some(
    (constraint) => constraint.foreign_table === "auth.users" && constraint.column_name === "id",
  )

  // Get column names
  const columnNames = (columns || []).map((col) => col.column_name)

  // Find missing columns
  const missingColumns = expectedColumns.filter((col) => !columnNames.includes(col))

  return {
    hasCorrectColumns: missingColumns.length === 0,
    hasForeignKeyConstraint: hasForeignKeyToAuthUsers,
    missingColumns,
  }
}

/**
 * Creates a database function to automatically create profiles
 * when a new user is created in auth.users
 */
export async function createProfilesTriggerFunction(): Promise<boolean> {
  const supabase = createAdminClient()

  // SQL to create the function and trigger
  const sql = `
  -- Function to create a profile when a user is created
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, 'user')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Drop trigger if it exists
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

  -- Create trigger
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `

  const { error } = await supabase.rpc("exec_sql", { sql })

  if (error) {
    console.error("Error creating trigger function:", error)
    return false
  }

  return true
}


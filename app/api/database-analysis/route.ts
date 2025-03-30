import { type NextRequest, NextResponse } from "next/server"
import {
  analyzeUserProfilesRelationship,
  createMissingProfiles,
  checkProfilesTableStructure,
  createProfilesTriggerFunction,
} from "@/lib/database-analysis"

export async function GET(request: NextRequest) {
  try {
    // Check if the request is authorized (you should implement proper auth)
    // This is just a placeholder - in production, use proper authentication
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Run the analysis
    const analysis = await analyzeUserProfilesRelationship()
    const tableStructure = await checkProfilesTableStructure()

    return NextResponse.json({
      analysis,
      tableStructure,
      recommendations: generateRecommendations(analysis, tableStructure),
    })
  } catch (error) {
    console.error("Error in database analysis:", error)
    return NextResponse.json({ error: "Failed to analyze database" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if the request is authorized (you should implement proper auth)
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const action = body.action

    if (action === "createMissingProfiles") {
      const count = await createMissingProfiles()
      return NextResponse.json({ created: count })
    }

    if (action === "createTrigger") {
      const success = await createProfilesTriggerFunction()
      return NextResponse.json({ success })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error in database fix:", error)
    return NextResponse.json({ error: "Failed to fix database" }, { status: 500 })
  }
}

function generateRecommendations(
  analysis: Awaited<ReturnType<typeof analyzeUserProfilesRelationship>>,
  tableStructure: Awaited<ReturnType<typeof checkProfilesTableStructure>>,
) {
  const recommendations = []

  if (analysis.usersWithoutProfiles.count > 0) {
    recommendations.push({
      issue: "Users without profiles",
      description: `Found ${analysis.usersWithoutProfiles.count} users without corresponding profiles.`,
      action: "Run the createMissingProfiles function to create profiles for these users.",
    })
  }

  if (analysis.profilesWithoutAuthUsers.count > 0) {
    recommendations.push({
      issue: "Orphaned profiles",
      description: `Found ${analysis.profilesWithoutAuthUsers.count} profiles without corresponding auth users.`,
      action: "Consider cleaning up these orphaned profiles if they are not needed.",
    })
  }

  if (!tableStructure.hasCorrectColumns) {
    recommendations.push({
      issue: "Missing columns in profiles table",
      description: `The profiles table is missing these columns: ${tableStructure.missingColumns.join(", ")}`,
      action: "Add the missing columns to the profiles table.",
    })
  }

  if (!tableStructure.hasForeignKeyConstraint) {
    recommendations.push({
      issue: "Missing foreign key constraint",
      description: "The profiles table does not have a foreign key constraint to auth.users.",
      action: "Add a foreign key constraint to ensure referential integrity.",
    })
  }

  return recommendations
}


"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DatabaseAnalysisPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [actionResult, setActionResult] = useState<any>(null)

  async function fetchAnalysis() {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/database-analysis", {
        headers: {
          Authorization: "Bearer admin-token", // Replace with proper auth
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const data = await response.json()
      setData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  async function runAction(action: string) {
    setLoading(true)
    setActionResult(null)
    try {
      const response = await fetch("/api/database-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token", // Replace with proper auth
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`)
      }

      const result = await response.json()
      setActionResult(result)

      // Refresh analysis after action
      fetchAnalysis()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalysis()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Database Analysis</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {actionResult && (
        <Alert className="mb-6">
          <AlertTitle>Action Result</AlertTitle>
          <AlertDescription>
            {actionResult.created !== undefined && `Created ${actionResult.created} profiles.`}
            {actionResult.success !== undefined &&
              (actionResult.success ? "Successfully created trigger function." : "Failed to create trigger function.")}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end mb-4">
        <Button onClick={fetchAnalysis} disabled={loading}>
          {loading ? "Loading..." : "Refresh Analysis"}
        </Button>
      </div>

      {data && (
        <Tabs defaultValue="summary">
          <TabsList>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Database Summary</CardTitle>
                <CardDescription>Overview of users and profiles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-medium">Auth Users</h3>
                    <p className="text-3xl font-bold">{data.analysis.authUsers}</p>
                  </div>
                  <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-medium">Profiles</h3>
                    <p className="text-3xl font-bold">{data.analysis.profilesCount}</p>
                  </div>
                  <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-medium">Users Without Profiles</h3>
                    <p className="text-3xl font-bold">{data.analysis.usersWithoutProfiles.count}</p>
                  </div>
                  <div className="border p-4 rounded-md">
                    <h3 className="text-lg font-medium">Orphaned Profiles</h3>
                    <p className="text-3xl font-bold">{data.analysis.orphanedProfiles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
                <CardDescription>Actions to fix database issues</CardDescription>
              </CardHeader>
              <CardContent>
                {data.recommendations.length === 0 ? (
                  <p>No issues found. Your database structure looks good!</p>
                ) : (
                  <div className="space-y-4">
                    {data.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="border p-4 rounded-md">
                        <h3 className="text-lg font-medium">{rec.issue}</h3>
                        <p className="text-gray-600 mb-2">{rec.description}</p>
                        <p className="text-sm font-medium">Recommended action:</p>
                        <p className="text-sm">{rec.action}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => runAction("createMissingProfiles")}
                  disabled={loading || data.analysis.usersWithoutProfiles.count === 0}
                >
                  Create Missing Profiles
                </Button>
                <Button onClick={() => runAction("createTrigger")} disabled={loading}>
                  Create Auto-Profile Trigger
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
                <CardDescription>Raw analysis data</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}


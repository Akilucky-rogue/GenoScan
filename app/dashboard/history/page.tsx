"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FlaskRoundIcon as Flask, ArrowLeft, FileText, ExternalLink } from "lucide-react"
import { getAnalysesByUserId } from "@/lib/db"

export default function HistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [analyses, setAnalyses] = useState<any[]>([])

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem("isAuthenticated") === "true"
      if (!isAuth) {
        router.push("/auth/login")
        return
      }

      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Fetch user's analyses
        const userAnalyses = getAnalysesByUserId(parsedUser.email)
        setAnalyses(userAnalyses)
      }
    }

    checkAuth()
  }, [router])

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Flask className="h-6 w-6 text-primary" />
          <span>GenomeScan</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 py-6 md:py-10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analysis History</h1>
              <p className="text-muted-foreground">View your previous DNA sequence analyses and results.</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Previous Analyses</CardTitle>
                <CardDescription>A list of all your DNA sequence analyses and their results.</CardDescription>
              </CardHeader>
              <CardContent>
                {analyses.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No analyses found</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      You haven't performed any DNA sequence analyses yet.
                    </p>
                    <Link href="/dashboard">
                      <Button>Start New Analysis</Button>
                    </Link>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Results</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analyses.map((analysis) => (
                        <TableRow key={analysis.id}>
                          <TableCell className="font-medium">{analysis.fileName}</TableCell>
                          <TableCell>{new Date(analysis.uploadDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                analysis.status === "completed"
                                  ? "default"
                                  : analysis.status === "processing"
                                    ? "secondary"
                                    : analysis.status === "failed"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {analysis.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {analysis.status === "completed" && analysis.results ? (
                              <div className="text-sm">
                                <p>{analysis.results.variantsDetected} variants</p>
                                <p>{analysis.results.abnormalitiesFound} abnormalities</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {analysis.status === "completed" && (
                              <Link href={`/dashboard/analysis/${analysis.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </Link>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

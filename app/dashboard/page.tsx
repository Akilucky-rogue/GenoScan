"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { FlaskRoundIcon as Flask, AlertCircle, Download, LogOut, User, LayoutDashboard, FileText, Activity } from "lucide-react"
import { DnaVisualizer } from "@/components/dna-visualizer"
import { VariantTable } from "@/components/variant-table"
import { TherapeuticSuggestions } from "@/components/therapeutic-suggestions"
import { createAnalysis } from "@/lib/db"
import { VariantUploader } from "@/components/variant-uploader"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [activeTab, setActiveTab] = useState("upload")
  const [sequenceData, setSequenceData] = useState<any>(null)
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem("isAuthenticated") === "true"
      if (!isAuth) {
        router.push("/auth/login")
        return
      }

      const userData = localStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("user")
    router.push("/auth/login")
  }

  const handleUploadComplete = async (variants: any[], sequence?: string) => {
    if (sequence) {
      // FASTA file
      setSequenceData({ type: "fasta", sequences: [sequence] })
      setAnalysisComplete(true)
      setActiveTab("results")
    } else if (variants) {
      // VCF file - Run inference
      try {
        const inferRes = await fetch("/api/infer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variants }),
        })

        if (!inferRes.ok) {
          throw new Error("Inference failed")
        }

        const inferData = await inferRes.json()
        setSequenceData({ type: "vcf", variants: inferData.results })
        setAnalysisComplete(true)
        setActiveTab("results")

        // Log analysis
        if (user?.email) {
          createAnalysis(user.email, "Uploaded File", 0, "vcf")
        }

      } catch (error) {
        console.error("Inference error:", error)
        // Handle error appropriately - maybe show a toast
      }
    }
  }

  const resetAnalysis = () => {
    setAnalysisComplete(false)
    setActiveTab("upload")
    setSequenceData(null)
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Flask className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading GenomeScan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/10">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Flask className="h-5 w-5 text-primary" />
            </div>
            <span>GenomeScan</span>
          </Link>
          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user.name || user.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8 px-4 md:px-6">
        <div className="flex flex-col space-y-8 max-w-6xl mx-auto">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Manage your DNA sequences and view analysis results.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-[400px] p-1 bg-muted/50">
              <TabsTrigger value="upload" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="results" disabled={!analysisComplete} className="gap-2">
                <Activity className="h-4 w-4" />
                Results
              </TabsTrigger>
              <TabsTrigger value="report" disabled={!analysisComplete} className="gap-2">
                <FileText className="h-4 w-4" />
                Report
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6 focus-visible:ring-0">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                  <Card className="border-none shadow-lg bg-gradient-to-br from-background to-muted/20">
                    <CardHeader>
                      <CardTitle>Start New Analysis</CardTitle>
                      <CardDescription>
                        Upload your sequence data to begin. We support standard FASTA and VCF formats.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VariantUploader onUpload={handleUploadComplete} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground text-center py-8">
                        No recent analyses found. Upload a file to get started.
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                      <CardTitle className="text-primary">Why GenomeScan?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">Advanced Variant Detection</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Our algorithms identify pathogenic variants with high precision using the latest clinical databases.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Flask className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">AI-Powered Insights</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Get therapeutic suggestions tailored to specific genetic profiles, powered by our proprietary ML models.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-6 focus-visible:ring-0">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">Analysis Results</h2>
                  <p className="text-muted-foreground">
                    Found {sequenceData?.variants?.length || 0} variants in your sequence.
                  </p>
                </div>
                <Button variant="outline" onClick={resetAnalysis}>
                  New Analysis
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card className="col-span-2 lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Sequence Visualization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DnaVisualizer sequenceData={sequenceData} />
                  </CardContent>
                </Card>

                <Card className="col-span-2 lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Variant Table</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VariantTable variants={sequenceData?.variants} />
                  </CardContent>
                </Card>

                <Card className="col-span-2">
                  <CardHeader>
                    <CardTitle>Therapeutic Suggestions</CardTitle>
                    <CardDescription>
                      Potential treatments based on identified variants.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TherapeuticSuggestions />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="report" className="focus-visible:ring-0">
              <Card className="max-w-4xl mx-auto">
                <CardHeader className="border-b bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Clinical Analysis Report</CardTitle>
                      <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => window.print()}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Executive Summary</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      The analysis of the provided DNA sequence has identified {sequenceData?.variants?.length || 0} significant variants.
                      Our AI-driven analysis suggests potential therapeutic interventions targeting these specific genetic markers.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Key Findings</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50">
                        <h4 className="font-medium text-red-900 dark:text-red-300 mb-2">Pathogenic Variants</h4>
                        <p className="text-sm text-red-700 dark:text-red-400">
                          Identified {sequenceData?.variants?.filter((v: any) => v.significance === 'Pathogenic').length || 0} variants classified as pathogenic.
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-900/50">
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-300 mb-2">Uncertain Significance</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                          Found {sequenceData?.variants?.filter((v: any) => v.significance === 'Uncertain').length || 0} variants requiring further investigation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">Detailed Recommendations</h3>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">1.</span>
                        <span>Clinical validation of identified pathogenic variants is recommended.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">2.</span>
                        <span>Consider genetic counseling for findings related to hereditary conditions.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-medium text-foreground">3.</span>
                        <span>Review suggested therapeutic options with a qualified healthcare provider.</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t p-6">
                  <p className="text-xs text-muted-foreground text-center w-full">
                    This report is generated by GenomeScan AI for research purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

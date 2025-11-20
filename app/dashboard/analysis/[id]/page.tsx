"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Share2, FileText, Database, ExternalLink } from "lucide-react"
import { EnhancedDnaVisualizer } from "@/components/enhanced-dna-visualizer"
import { VariantViewer } from "@/components/variant-viewer"
import { MolecularViewer } from "@/components/molecular-viewer"
import { TherapeuticSuggestions } from "@/components/therapeutic-suggestions"
import { VariantUploader } from "@/components/variant-uploader"
import { getAnalysisById } from "@/lib/db"
import { blastService, variantService, therapeuticService } from "@/lib/api-services"

export default function AnalysisDetailPage() {
  const router = useRouter()
  const params = useParams()
  const analysisId = params.id as string

  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [blastResults, setBlastResults] = useState<any>(null)
  const [variantResults, setVariantResults] = useState<any>(null)
  const [therapeuticResults, setTherapeuticResults] = useState<any>(null)

  useEffect(() => {
    const fetchAnalysisData = async () => {
      setLoading(true)

      // Get analysis from database
      const analysisData = getAnalysisById(analysisId)

      if (!analysisData) {
        router.push("/dashboard")
        return
      }

      setAnalysis(analysisData)

      // Fetch additional data from APIs
      try {
        // Mock sequence for BLAST search
        const mockSequence = "ATGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAG"
        const blastData = await blastService.searchSequence(mockSequence)
        setBlastResults(blastData)

        // Mock variants for analysis
        const mockVariants = [
          { id: "var1", position: 123, ref: "A", alt: "G" },
          { id: "var2", position: 456, ref: "C", alt: "T" },
          { id: "var3", position: 789, ref: "G", alt: "A" },
        ]
        const variantData = await variantService.analyzeVariants(mockVariants)
        setVariantResults(variantData)

  // Get therapeutic suggestions
  const therapeuticData = await therapeuticService.getSuggestions(variantData)
  setTherapeuticResults(therapeuticData)
      } catch (error) {
        console.error("Error fetching API data:", error)
      }

      setLoading(false)
    }

    fetchAnalysisData()
  }, [analysisId, router])

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading analysis data...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="container py-10">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Analysis not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Analysis Results</h1>
          <Badge variant={analysis.status === "completed" ? "default" : "outline"}>{analysis.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle>{analysis.fileName}</CardTitle>
              <CardDescription>
                Uploaded on {new Date(analysis.uploadDate).toLocaleDateString()} •{analysis.fileType.toUpperCase()} file
                •{(analysis.fileSize / 1024).toFixed(2)} KB
              </CardDescription>
            </div>
            <div className="flex flex-col gap-1 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {analysis.results?.variantsDetected || 0} variants detected
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {analysis.results?.abnormalitiesFound || 0} abnormalities
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {analysis.results?.therapeuticSuggestions || 0} therapeutic suggestions
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="variants"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Variants
              </TabsTrigger>
              <TabsTrigger
                value="structure"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Structure
              </TabsTrigger>
              <TabsTrigger
                value="therapeutics"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Therapeutics
              </TabsTrigger>
              <TabsTrigger
                value="blast"
                className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                BLAST Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="p-4 pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <EnhancedDnaVisualizer sequenceData={analysis.sequenceData} variants={variantResults} />
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Summary</CardTitle>
                    <CardDescription>Overview of the DNA sequence analysis results.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Key Findings</h3>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Identified {variantResults?.length || 0} variants in the DNA sequence</li>
                        <li>
                          {variantResults?.filter((v: any) => v.clinicalSignificance === "Pathogenic").length || 0}{" "}
                          pathogenic variants detected
                        </li>
                        <li>
                          {variantResults?.filter((v: any) => v.clinicalSignificance === "Likely pathogenic").length ||
                            0}{" "}
                          likely pathogenic variants
                        </li>
                        <li>
                          {therapeuticResults?.smallMolecules?.length +
                            therapeuticResults?.biologics?.length +
                            therapeuticResults?.geneTherapies?.length || 0}{" "}
                          potential therapeutic approaches identified
                        </li>
                      </ul>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Recommendations</h3>
                      <p className="text-sm text-muted-foreground">
                        Based on the detected variants, we recommend further investigation of the pathogenic variants
                        and consideration of the suggested therapeutic approaches. Clinical validation is advised before
                        making any treatment decisions.
                      </p>
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Full Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="variants" className="p-4 pt-6">
              <VariantViewer variants={variantResults} />
            </TabsContent>

            <TabsContent value="structure" className="p-4 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <MolecularViewer proteinId={variantResults?.[0]?.gene || "BRCA1"} structureType="wild" />
                <MolecularViewer proteinId={variantResults?.[0]?.gene || "BRCA1"} structureType="mutant" />
              </div>
            </TabsContent>

            <TabsContent value="therapeutics" className="p-4 pt-6">
              <div className="space-y-4">
                <VariantUploader
                  onUpload={async (variants, sequence) => {
                    // If variants parsed, post to suggestions; otherwise update sequence
                    if (variants && variants.length) {
                      setLoading(true)
                      try {
                        const res = await fetch('/api/suggestions', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ variants }),
                        })
                        const data = await res.json()
                        if (data?.ok) {
                          setTherapeuticResults(data.suggestions)
                          setVariantResults(data.suggestions.enrichedVariants)
                        }
                      } catch (err) {
                        console.error(err)
                      } finally {
                        setLoading(false)
                      }
                    }
                    if (sequence) {
                      // update visualizer sequence
                      setAnalysis((a: any) => ({ ...a, sequenceData: sequence }))
                    }
                  }}
                />

                <TherapeuticSuggestions variants={variantResults} />
              </div>

              <div className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Clinical Trials</CardTitle>
                    <CardDescription>Relevant clinical trials for the detected variants.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {therapeuticResults?.clinicalTrials?.map((trial: any, index: number) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{trial.title}</h3>
                              <p className="text-sm text-muted-foreground">ID: {trial.id}</p>
                            </div>
                            <Badge>{trial.phase}</Badge>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Status:</span> {trial.status}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Locations:</span> {trial.locations.join(", ")}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <Button variant="outline" size="sm" asChild>
                              <a href={trial.url} target="_blank" rel="noopener noreferrer">
                                View Trial <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="blast" className="p-4 pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>BLAST Search Results</CardTitle>
                  <CardDescription>Sequence similarity search results from NCBI BLAST.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-2 bg-muted rounded text-sm">
                      <p>
                        <strong>Database:</strong> {blastResults?.statistics?.databaseSize}
                      </p>
                      <p>
                        <strong>Search Time:</strong> {blastResults?.statistics?.searchTime}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Sequence Hits</h3>
                      <div className="space-y-4">
                        {blastResults?.hits?.map((hit: any, index: number) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">{hit.title}</h4>
                                <p className="text-sm text-muted-foreground">ID: {hit.id}</p>
                              </div>
                              <Badge variant="secondary">{hit.organism}</Badge>
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Score:</span> {hit.score}
                              </div>
                              <div>
                                <span className="text-muted-foreground">E-value:</span> {hit.eValue}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Identity:</span> {hit.identity}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Alignment Length:</span> {hit.alignmentLength}
                              </div>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <Button variant="outline" size="sm">
                                <Database className="h-4 w-4 mr-2" />
                                View in NCBI
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

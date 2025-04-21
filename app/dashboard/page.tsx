"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FlaskRoundIcon as Flask, FileUp, AlertCircle, FileText, Download, ArrowLeft } from "lucide-react"
import { DnaVisualizer } from "@/components/dna-visualizer"
import { VariantTable } from "@/components/variant-table"
import { TherapeuticSuggestions } from "@/components/therapeutic-suggestions"

export default function Dashboard() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setUploadedFile(file)
  }

  const startAnalysis = () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    setProgress(0)

    // Simulate analysis progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 10
        if (newProgress >= 100) {
          clearInterval(interval)
          setIsAnalyzing(false)
          setAnalysisComplete(true)
          setActiveTab("results")
          return 100
        }
        return newProgress
      })
    }, 500)
  }

  const resetAnalysis = () => {
    setUploadedFile(null)
    setIsAnalyzing(false)
    setAnalysisComplete(false)
    setProgress(0)
    setActiveTab("upload")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Flask className="h-6 w-6 text-primary" />
          <span>GenomeScan</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1 py-6 md:py-10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col space-y-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">DNA Analysis Dashboard</h1>
              <p className="text-muted-foreground">
                Upload DNA sequences, analyze for abnormalities, and discover potential therapeutic strategies.
              </p>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="results" disabled={!analysisComplete}>
                  Results
                </TabsTrigger>
                <TabsTrigger value="report" disabled={!analysisComplete}>
                  Report
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload DNA Sequence</CardTitle>
                    <CardDescription>
                      Upload your DNA sequence file in FASTA or VCF format for analysis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12">
                        <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop your file here, or click to browse
                        </p>
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          accept=".fasta,.fa,.vcf"
                          onChange={handleFileUpload}
                        />
                        <label htmlFor="file-upload">
                          <Button variant="outline" className="cursor-pointer">
                            Browse Files
                          </Button>
                        </label>
                      </div>
                      {uploadedFile && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-sm font-medium">{uploadedFile.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {(uploadedFile.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                      )}
                      {isAnalyzing && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Analyzing DNA sequence...</span>
                            <span className="text-sm text-muted-foreground">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={resetAnalysis} disabled={!uploadedFile && !analysisComplete}>
                      Reset
                    </Button>
                    <Button onClick={startAnalysis} disabled={!uploadedFile || isAnalyzing}>
                      {isAnalyzing ? "Analyzing..." : "Start Analysis"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="results" className="mt-6 space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Analysis Complete</AlertTitle>
                  <AlertDescription>
                    We've analyzed your DNA sequence and identified potential abnormalities.
                  </AlertDescription>
                </Alert>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>DNA Sequence Visualization</CardTitle>
                      <CardDescription>Visual representation of the analyzed DNA sequence.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <DnaVisualizer />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Detected Variants</CardTitle>
                      <CardDescription>List of genetic variants detected in the sequence.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <VariantTable />
                    </CardContent>
                  </Card>
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Therapeutic Suggestions</CardTitle>
                    <CardDescription>
                      AI-generated suggestions for potential therapeutic approaches based on detected variants.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TherapeuticSuggestions />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="report" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Report</CardTitle>
                    <CardDescription>
                      Comprehensive report of the DNA analysis results and therapeutic suggestions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Summary</h3>
                        <p className="text-sm text-muted-foreground">
                          The analysis of the provided DNA sequence has identified 3 significant variants that may be
                          associated with genetic abnormalities. Based on these findings, we've generated therapeutic
                          suggestions that could potentially address these abnormalities.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Key Findings</h3>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          <li>Identified 3 pathogenic variants associated with known genetic disorders</li>
                          <li>Found 2 variants of uncertain significance that require further investigation</li>
                          <li>Detected 1 novel variant not previously documented in genomic databases</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Therapeutic Approaches</h3>
                        <p className="text-sm text-muted-foreground">
                          Based on the detected variants, our AI system has suggested several potential therapeutic
                          approaches, including gene therapy, small molecule inhibitors, and CRISPR-based gene editing
                          strategies.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Recommendations</h3>
                        <p className="text-sm text-muted-foreground">
                          We recommend further validation of these findings through additional genomic testing and
                          consultation with clinical genetics specialists. The therapeutic suggestions provided should
                          be considered as starting points for further research and development.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download Full Report (PDF)
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

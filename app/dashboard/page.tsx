"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { FlaskRoundIcon as Flask, FileUp, AlertCircle, FileText, Download, LogOut, User } from "lucide-react"
import { DnaVisualizer } from "@/components/dna-visualizer"
import { VariantTable } from "@/components/variant-table"
import { TherapeuticSuggestions } from "@/components/therapeutic-suggestions"
import { validateDnaFile, getFileType, parseFastaContent, parseVcfContent } from "@/lib/file-validation"
import { createAnalysis, processDnaAnalysis, getAnalysisById } from "@/lib/db"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileValidation, setFileValidation] = useState<{ valid: boolean; error?: string }>({ valid: true })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("upload")
  const [sequenceData, setSequenceData] = useState<any>(null)

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (!file) return

    // Validate the file
    const validation = validateDnaFile(file)
    setFileValidation(validation)

    if (validation.valid) {
      setUploadedFile(file)

      // Parse file content based on type
      try {
        const fileType = getFileType(file.name)
        if (fileType === "fasta") {
          const sequences = await parseFastaContent(file)
          setSequenceData({ type: "fasta", sequences })
        } else if (fileType === "vcf") {
          const variants = await parseVcfContent(file)
          setSequenceData({ type: "vcf", variants })
        }
      } catch (error) {
        console.error("Error parsing file:", error)
        setFileValidation({ valid: false, error: "Error parsing file content. Please check the file format." })
      }
    } else {
      setUploadedFile(null)
    }
  }

  const startAnalysis = async () => {
    if (!uploadedFile || !user) return

    setIsAnalyzing(true)
    setProgress(0)

    // Create analysis record in database
    const analysis = createAnalysis(user.email, uploadedFile.name, uploadedFile.size, getFileType(uploadedFile.name))

    setAnalysisId(analysis.id)

    // Start processing the analysis
    processDnaAnalysis(analysis.id)

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval)
          return 100
        }
        return prevProgress + 5
      })
    }, 300)

    // Check analysis status periodically
    const statusCheck = setInterval(() => {
      const currentAnalysis = getAnalysisById(analysis.id)
      if (currentAnalysis?.status === "completed") {
        clearInterval(statusCheck)
        clearInterval(interval)
        setProgress(100)
        setIsAnalyzing(false)
        setAnalysisComplete(true)
        setActiveTab("results")
      }
    }, 1000)
  }

  const resetAnalysis = () => {
    setUploadedFile(null)
    setFileValidation({ valid: true })
    setIsAnalyzing(false)
    setAnalysisComplete(false)
    setAnalysisId(null)
    setProgress(0)
    setActiveTab("upload")
    setSequenceData(null)
  }

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
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{user.name || user.email}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
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
                      Upload your DNA sequence file in FASTA (.fasta, .fa) or VCF (.vcf) format for analysis.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {!fileValidation.valid && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{fileValidation.error}</AlertDescription>
                        </Alert>
                      )}
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
                      {sequenceData && (
                        <div className="p-4 bg-muted rounded">
                          <h3 className="text-sm font-medium mb-2">File Preview</h3>
                          <div className="text-xs font-mono bg-background p-2 rounded max-h-32 overflow-auto">
                            {sequenceData.type === "fasta" ? (
                              <div>
                                <p className="text-muted-foreground mb-1">FASTA Sequence:</p>
                                {sequenceData.sequences.slice(0, 3).map((seq: string, i: number) => (
                                  <p key={i}>{seq.substring(0, 50)}...</p>
                                ))}
                                {sequenceData.sequences.length > 3 && (
                                  <p className="text-muted-foreground mt-1">
                                    ...and {sequenceData.sequences.length - 3} more sequences
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <p className="text-muted-foreground mb-1">VCF Variants:</p>
                                {sequenceData.variants.slice(0, 3).map((variant: any, i: number) => (
                                  <p key={i}>
                                    {variant.chrom}:{variant.pos} {variant.ref}&gt;{variant.alt}
                                  </p>
                                ))}
                                {sequenceData.variants.length > 3 && (
                                  <p className="text-muted-foreground mt-1">
                                    ...and {sequenceData.variants.length - 3} more variants
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
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
                    <Button onClick={startAnalysis} disabled={!uploadedFile || isAnalyzing || !fileValidation.valid}>
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
                      <DnaVisualizer sequenceData={sequenceData} />
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

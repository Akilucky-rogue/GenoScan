import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Database, FileText, FlaskRoundIcon as Flask, Search, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Flask className="h-6 w-6 text-primary" />
          <span>GenomeScan</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
            How It Works
          </Link>
          <Link href="#about" className="text-sm font-medium hover:underline underline-offset-4">
            About
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
            Dashboard
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Advanced DNA Analysis & Therapeutic Insights
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Upload DNA sequences, detect abnormalities, and discover potential therapeutic strategies with our
                    cutting-edge genomic analysis platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-1">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button size="lg" variant="outline">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-secondary/20 to-muted p-8 flex items-center justify-center">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,transparent)]" />
                  <div className="relative flex flex-col items-center text-center">
                    <Flask className="h-16 w-16 text-primary mb-4" />
                    <p className="text-xl font-semibold mb-2">DNA Analysis Platform</p>
                    <p className="text-sm text-muted-foreground max-w-[250px]">
                      Leveraging advanced algorithms to identify genetic variants and suggest therapeutic approaches
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Comprehensive Genomic Analysis
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform combines DNA sequence analysis, variant interpretation, and therapeutic insights in one
                  seamless workflow.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="grid gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">DNA Sequence Upload</h3>
                <p className="text-muted-foreground">
                  Support for FASTA and VCF formats with secure handling of sensitive genetic data.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Abnormality Detection</h3>
                <p className="text-muted-foreground">
                  Advanced algorithms to identify genetic variants and flag potential pathogenic mutations.
                </p>
              </div>
              <div className="grid gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground mx-auto">
                  <Flask className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Therapeutic Insights</h3>
                <p className="text-muted-foreground">
                  AI-driven suggestions for potential treatments and therapeutic strategies based on detected variants.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform streamlines the process from DNA sequence upload to therapeutic insights.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12">
              <div className="grid gap-12">
                <div className="grid md:grid-cols-[1fr_2fr] gap-6 items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
                    <span className="text-2xl font-bold">1</span>
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-xl font-bold">Upload DNA Sequence</h3>
                    <p className="text-muted-foreground">
                      Upload your DNA sequence data in FASTA or VCF format through our secure interface.
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr_2fr] gap-6 items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
                    <span className="text-2xl font-bold">2</span>
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-xl font-bold">Analyze and Detect</h3>
                    <p className="text-muted-foreground">
                      Our algorithms analyze the sequence, identify variants, and flag potential abnormalities using
                      established databases like ClinVar and dbSNP.
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr_2fr] gap-6 items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
                    <span className="text-2xl font-bold">3</span>
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-xl font-bold">Review Results</h3>
                    <p className="text-muted-foreground">
                      Explore interactive visualizations of detected variants and their clinical significance.
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr_2fr] gap-6 items-start">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-primary">
                    <span className="text-2xl font-bold">4</span>
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-xl font-bold">Discover Therapeutic Insights</h3>
                    <p className="text-muted-foreground">
                      Receive AI-generated suggestions for potential therapeutic approaches based on the detected
                      variants.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="about" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">About Our Platform</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    GenomeScan is at the forefront of genomic analysis technology, combining DNA sequence analysis,
                    variant interpretation, and therapeutic insights.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Our Mission</h3>
                  <p className="text-muted-foreground">
                    To democratize access to advanced genomic analysis and accelerate the discovery of therapeutic
                    strategies for genetic disorders.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Technology</h3>
                  <p className="text-muted-foreground">
                    We leverage established bioinformatics tools like BLAST and FASTA, combined with AI models for
                    therapeutic suggestions, all in a secure, user-friendly platform.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-background p-4">
                      <Database className="h-8 w-8 text-primary" />
                      <div className="text-center">
                        <h4 className="text-sm font-medium">Comprehensive Databases</h4>
                        <p className="text-xs text-muted-foreground">ClinVar, dbSNP integration</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-background p-4">
                      <Shield className="h-8 w-8 text-primary" />
                      <div className="text-center">
                        <h4 className="text-sm font-medium">Secure & Compliant</h4>
                        <p className="text-xs text-muted-foreground">HIPAA, GDPR ready</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-2 rounded-lg border bg-background p-4">
                    <div className="text-center">
                      <h4 className="text-sm font-medium">Ready to transform genomic analysis?</h4>
                      <p className="text-xs text-muted-foreground mb-4">
                        Try our platform today and experience the future of DNA analysis.
                      </p>
                      <Link href="/dashboard">
                        <Button>Get Started</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 GenomeScan. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}

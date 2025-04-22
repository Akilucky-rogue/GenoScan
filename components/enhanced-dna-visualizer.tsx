"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, RotateCcw, Download } from "lucide-react"

interface EnhancedDnaVisualizerProps {
  sequenceData?: any
  variants?: any[]
}

export function EnhancedDnaVisualizer({ sequenceData, variants = [] }: EnhancedDnaVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [viewMode, setViewMode] = useState<"linear" | "circular">("linear")

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = 400

    // DNA visualization parameters
    const width = canvas.width
    const height = canvas.height
    const baseColors = {
      A: "#FF5757", // Red
      T: "#4CAF50", // Green
      G: "#2196F3", // Blue
      C: "#FFC107", // Yellow
      abnormal: "#FF00FF", // Magenta for abnormal bases
    }

    // Generate mock DNA sequence with some abnormalities
    const generateMockDNA = (length: number) => {
      const bases = ["A", "T", "G", "C"]
      const sequence = []

      // Use provided variants or generate random abnormal positions
      const abnormalPositions =
        variants.length > 0
          ? variants.map((v) => Math.floor(Math.random() * length))
          : [Math.floor(length * 0.2), Math.floor(length * 0.4), Math.floor(length * 0.6), Math.floor(length * 0.8)]

      for (let i = 0; i < length; i++) {
        const isAbnormal = abnormalPositions.includes(i)
        const base = bases[Math.floor(Math.random() * bases.length)]
        sequence.push({ base, isAbnormal })
      }

      return sequence
    }

    // Process sequence data if available
    const processSequenceData = () => {
      if (!sequenceData) return generateMockDNA(100)

      if (sequenceData.type === "fasta") {
        // Process FASTA sequence
        const sequence = sequenceData.sequences[0] || ""
        return Array.from(sequence.substring(0, 100)).map((base, i) => {
          // Mark positions with variants as abnormal
          const isAbnormal = variants.some((v) => v.position === i)
          return { base, isAbnormal }
        })
      } else if (sequenceData.type === "vcf") {
        // For VCF, we'll create a mock sequence but mark positions with variants as abnormal
        const dnaSequence = generateMockDNA(100)

        // Mark positions with variants as abnormal
        if (variants && variants.length > 0) {
          variants.forEach((variant) => {
            const pos = Math.floor(Math.random() * 100) // Simplified for demo
            if (dnaSequence[pos]) {
              dnaSequence[pos].isAbnormal = true
            }
          })
        }

        return dnaSequence
      }

      return generateMockDNA(100)
    }

    const dnaSequence = processSequenceData()

    // Draw DNA visualization based on view mode
    const drawDNA = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)

      if (viewMode === "linear") {
        drawLinearDNA(dnaSequence)
      } else {
        drawCircularDNA(dnaSequence)
      }
    }

    // Draw linear DNA visualization
    const drawLinearDNA = (sequence: any[]) => {
      if (!ctx) return

      // Apply zoom
      const zoomedWidth = width * zoom
      const baseWidth = zoomedWidth / sequence.length
      const baseHeight = 30 * zoom

      // Center the visualization
      const offsetX = (width - zoomedWidth) / 2

      // Draw backbone
      ctx.beginPath()
      ctx.moveTo(offsetX, height / 2)
      ctx.lineTo(offsetX + zoomedWidth, height / 2)
      ctx.strokeStyle = "#E0E0E0"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw bases
      sequence.forEach((base: any, i: number) => {
        const x = offsetX + i * baseWidth
        const y = height / 2
        const color = base.isAbnormal
          ? baseColors.abnormal
          : baseColors[base.base as keyof typeof baseColors] || "#999999"

        // Draw base
        ctx.fillStyle = color
        ctx.beginPath()

        if (i % 2 === 0) {
          // Draw above the backbone
          ctx.rect(x, y - baseHeight, baseWidth - 1, baseHeight)
        } else {
          // Draw below the backbone
          ctx.rect(x, y, baseWidth - 1, baseHeight)
        }

        ctx.fill()

        // Draw base letter if zoom is sufficient
        if (baseWidth > 10) {
          ctx.fillStyle = "#FFFFFF"
          ctx.font = `${10 * zoom}px Arial`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          if (i % 2 === 0) {
            ctx.fillText(base.base, x + baseWidth / 2, y - baseHeight / 2)
          } else {
            ctx.fillText(base.base, x + baseWidth / 2, y + baseHeight / 2)
          }
        }
      })

      // Highlight abnormal regions
      sequence.forEach((base: any, i: number) => {
        if (base.isAbnormal) {
          const x = offsetX + i * baseWidth
          const y = height / 2

          ctx.strokeStyle = baseColors.abnormal
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x + baseWidth / 2, y, 15 * zoom, 0, Math.PI * 2)
          ctx.stroke()
        }
      })
    }

    // Draw circular DNA visualization
    const drawCircularDNA = (sequence: any[]) => {
      if (!ctx) return

      const centerX = width / 2
      const centerY = height / 2
      const radius = Math.min(width, height) * 0.4 * zoom

      // Draw circular backbone
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
      ctx.strokeStyle = "#E0E0E0"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw bases around the circle
      sequence.forEach((base: any, i: number) => {
        const angle = (i / sequence.length) * Math.PI * 2
        const color = base.isAbnormal
          ? baseColors.abnormal
          : baseColors[base.base as keyof typeof baseColors] || "#999999"

        // Calculate position
        const innerRadius = radius - 15 * zoom
        const outerRadius = radius + 15 * zoom

        const x1 = centerX + innerRadius * Math.cos(angle)
        const y1 = centerY + innerRadius * Math.sin(angle)
        const x2 = centerX + outerRadius * Math.cos(angle)
        const y2 = centerY + outerRadius * Math.sin(angle)

        // Draw base line
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = color
        ctx.lineWidth = 3
        ctx.stroke()

        // Highlight abnormal bases
        if (base.isAbnormal) {
          ctx.beginPath()
          ctx.arc(x2, y2, 5 * zoom, 0, Math.PI * 2)
          ctx.fillStyle = baseColors.abnormal
          ctx.fill()
        }
      })

      // Add labels for cardinal points
      ctx.font = `${12 * zoom}px Arial`
      ctx.fillStyle = "#666666"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      ctx.fillText("0", centerX, centerY - radius - 20 * zoom)
      ctx.fillText("25%", centerX + radius + 20 * zoom, centerY)
      ctx.fillText("50%", centerX, centerY + radius + 20 * zoom)
      ctx.fillText("75%", centerX - radius - 20 * zoom, centerY)
    }

    // Initial draw
    drawDNA()

    // Handle window resize
    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      drawDNA()
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [sequenceData, variants, zoom, viewMode])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoom(1)
    setViewMode("linear")
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Create a temporary link and trigger download
    const link = document.createElement("a")
    link.download = "dna-visualization.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>DNA Sequence Visualization</CardTitle>
        <CardDescription>Interactive visualization of the analyzed DNA sequence.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "linear" | "circular")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linear">Linear View</TabsTrigger>
            <TabsTrigger value="circular">Circular View</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="w-full h-[400px] bg-background rounded-md border relative">
          <canvas ref={canvasRef} className="w-full h-full" />

          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button variant="outline" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-4 left-4 w-32">
            <Slider value={[zoom]} min={0.5} max={3} step={0.1} onValueChange={(values) => setZoom(values[0])} />
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Zoom: {zoom.toFixed(1)}x</p>
          <p>Abnormal regions are highlighted in magenta.</p>
        </div>
      </CardContent>
    </Card>
  )
}

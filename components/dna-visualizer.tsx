"use client"

import { useEffect, useRef } from "react"

interface DnaVisualizerProps {
  sequenceData?: any
}

export function DnaVisualizer({ sequenceData }: DnaVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = 200

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
      const abnormalPositions = [
        Math.floor(length * 0.2),
        Math.floor(length * 0.4),
        Math.floor(length * 0.6),
        Math.floor(length * 0.8),
      ]

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
          // Randomly mark some bases as abnormal for visualization
          const isAbnormal = i % 20 === 0
          return { base, isAbnormal }
        })
      } else if (sequenceData.type === "vcf") {
        // For VCF, we'll create a mock sequence but mark positions with variants as abnormal
        const dnaSequence = generateMockDNA(100)

        // Mark positions with variants as abnormal (simplified for demo)
        if (sequenceData.variants && sequenceData.variants.length > 0) {
          const variantPositions = sequenceData.variants.slice(0, 5).map((_: any, i: number) => i * 15 + 10)
          variantPositions.forEach((pos: number) => {
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

    // Draw DNA visualization
    const drawDNA = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)

      // Draw backbone
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.strokeStyle = "#E0E0E0"
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw bases
      const baseWidth = width / dnaSequence.length
      const baseHeight = 30

      dnaSequence.forEach((base: any, i: number) => {
        const x = i * baseWidth
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

        // Draw base letter
        ctx.fillStyle = "#FFFFFF"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"

        if (i % 2 === 0) {
          ctx.fillText(base.base, x + baseWidth / 2, y - baseHeight / 2)
        } else {
          ctx.fillText(base.base, x + baseWidth / 2, y + baseHeight / 2)
        }
      })

      // Highlight abnormal regions
      dnaSequence.forEach((base: any, i: number) => {
        if (base.isAbnormal) {
          const x = i * baseWidth
          const y = height / 2

          ctx.strokeStyle = baseColors.abnormal
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(x + baseWidth / 2, y, 15, 0, Math.PI * 2)
          ctx.stroke()
        }
      })
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
  }, [sequenceData])

  return (
    <div className="w-full h-[200px] bg-background rounded-md border">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}

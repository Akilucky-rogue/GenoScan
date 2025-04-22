"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RotateCcw, ZoomIn, ZoomOut, Download, Maximize2 } from "lucide-react"

interface MolecularViewerProps {
  proteinId?: string
  structureType?: "wild" | "mutant"
}

export function MolecularViewer({ proteinId = "BRCA1", structureType = "wild" }: MolecularViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [viewMode, setViewMode] = useState<"ribbon" | "surface" | "ball-and-stick">("ribbon")
  const [selectedProtein, setSelectedProtein] = useState(proteinId)
  const [selectedStructure, setSelectedStructure] = useState(structureType)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Available proteins for demo
  const availableProteins = [
    { id: "BRCA1", name: "BRCA1 (Breast cancer type 1 susceptibility protein)" },
    { id: "BRCA2", name: "BRCA2 (Breast cancer type 2 susceptibility protein)" },
    { id: "TP53", name: "TP53 (Cellular tumor antigen p53)" },
    { id: "PTEN", name: "PTEN (Phosphatase and tensin homolog)" },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw protein structure based on selected options
    drawProteinStructure(ctx, canvas.width, canvas.height)

    // Handle window resize
    const handleResize = () => {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      drawProteinStructure(ctx, canvas.width, canvas.height)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [selectedProtein, selectedStructure, viewMode, isFullscreen])

  // Function to draw protein structure (mock visualization)
  const drawProteinStructure = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set background
    ctx.fillStyle = "#f8f9fa"
    ctx.fillRect(0, 0, width, height)

    // Center coordinates
    const centerX = width / 2
    const centerY = height / 2

    // Draw different visualizations based on view mode
    if (viewMode === "ribbon") {
      drawRibbonModel(ctx, centerX, centerY, width, height)
    } else if (viewMode === "surface") {
      drawSurfaceModel(ctx, centerX, centerY, width, height)
    } else if (viewMode === "ball-and-stick") {
      drawBallAndStickModel(ctx, centerX, centerY, width, height)
    }

    // Add protein info
    ctx.fillStyle = "#333"
    ctx.font = "14px Arial"
    ctx.textAlign = "left"
    ctx.fillText(`Protein: ${selectedProtein}`, 10, 20)
    ctx.fillText(`Structure: ${selectedStructure === "wild" ? "Wild Type" : "Mutant"}`, 10, 40)
    ctx.fillText(`View: ${viewMode}`, 10, 60)
  }

  // Draw ribbon model visualization
  const drawRibbonModel = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  ) => {
    const radius = Math.min(width, height) * 0.4

    // Draw alpha helices as spirals
    ctx.strokeStyle = selectedStructure === "wild" ? "#4CAF50" : "#FF5757"
    ctx.lineWidth = 3

    // Draw several helices
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius * 0.7
      const y = centerY + Math.sin(angle) * radius * 0.7

      drawHelix(ctx, x, y, 40, 20, angle)
    }

    // Draw beta sheets as arrows
    ctx.fillStyle = "#2196F3"

    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + Math.PI / 6
      const x = centerX + Math.cos(angle) * radius * 0.3
      const y = centerY + Math.sin(angle) * radius * 0.3

      drawBetaSheet(ctx, x, y, 60, 20, angle)
    }

    // Draw connecting loops
    ctx.strokeStyle = "#999"
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Helper function to draw a helix
  const drawHelix = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    height: number,
    width: number,
    angle: number,
  ) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)

    ctx.beginPath()
    for (let i = 0; i < height; i += 5) {
      const radius = width / 2
      const spiralX = Math.cos(i * 0.5) * radius
      const spiralY = i - height / 2

      if (i === 0) {
        ctx.moveTo(spiralX, spiralY)
      } else {
        ctx.lineTo(spiralX, spiralY)
      }
    }
    ctx.stroke()

    ctx.restore()
  }

  // Helper function to draw a beta sheet
  const drawBetaSheet = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    length: number,
    width: number,
    angle: number,
  ) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)

    // Draw arrow body
    ctx.beginPath()
    ctx.moveTo(-length / 2, -width / 2)
    ctx.lineTo(length / 2 - width, -width / 2)
    ctx.lineTo(length / 2 - width, -width)
    ctx.lineTo(length / 2, 0)
    ctx.lineTo(length / 2 - width, width)
    ctx.lineTo(length / 2 - width, width / 2)
    ctx.lineTo(-length / 2, width / 2)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  // Draw surface model visualization
  const drawSurfaceModel = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  ) => {
    const radius = Math.min(width, height) * 0.4

    // Create gradient for surface
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)

    if (selectedStructure === "wild") {
      gradient.addColorStop(0, "#a5d6a7")
      gradient.addColorStop(0.7, "#4CAF50")
      gradient.addColorStop(1, "#2e7d32")
    } else {
      gradient.addColorStop(0, "#ffcdd2")
      gradient.addColorStop(0.7, "#FF5757")
      gradient.addColorStop(1, "#c62828")
    }

    // Draw main surface
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    // Add some surface details
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)"

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius * 0.7
      const y = centerY + Math.sin(angle) * radius * 0.7
      const blobRadius = radius * 0.2

      ctx.beginPath()
      ctx.arc(x, y, blobRadius, 0, Math.PI * 2)
      ctx.fill()
    }

    // Add highlights
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)"
    ctx.beginPath()
    ctx.arc(centerX - radius * 0.3, centerY - radius * 0.3, radius * 0.1, 0, Math.PI * 2)
    ctx.fill()
  }

  // Draw ball-and-stick model visualization
  const drawBallAndStickModel = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    width: number,
    height: number,
  ) => {
    const radius = Math.min(width, height) * 0.4
    const atomColors = {
      C: "#808080", // Carbon - gray
      N: "#0000FF", // Nitrogen - blue
      O: "#FF0000", // Oxygen - red
      S: "#FFFF00", // Sulfur - yellow
      P: "#FFA500", // Phosphorus - orange
    }

    // Create atoms and bonds
    const atoms = []
    const bonds = []

    // Generate random atoms
    for (let i = 0; i < 20; i++) {
      const angle1 = Math.random() * Math.PI * 2
      const angle2 = Math.random() * Math.PI * 2
      const dist = Math.random() * radius * 0.8

      const x = centerX + Math.cos(angle1) * Math.cos(angle2) * dist
      const y = centerY + Math.sin(angle1) * Math.cos(angle2) * dist

      // Randomly select atom type
      const atomTypes = Object.keys(atomColors)
      const atomType = atomTypes[Math.floor(Math.random() * atomTypes.length)]

      atoms.push({ x, y, type: atomType })
    }

    // Generate bonds between nearby atoms
    for (let i = 0; i < atoms.length; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        const dx = atoms[i].x - atoms[j].x
        const dy = atoms[i].y - atoms[j].y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < radius * 0.3) {
          bonds.push({ from: i, to: j })
        }
      }
    }

    // Draw bonds
    ctx.strokeStyle = "#666"
    ctx.lineWidth = 2

    bonds.forEach((bond) => {
      const fromAtom = atoms[bond.from]
      const toAtom = atoms[bond.to]

      ctx.beginPath()
      ctx.moveTo(fromAtom.x, fromAtom.y)
      ctx.lineTo(toAtom.x, toAtom.y)
      ctx.stroke()
    })

    // Draw atoms
    atoms.forEach((atom) => {
      const atomColor = atomColors[atom.type as keyof typeof atomColors]
      const atomRadius = atom.type === "C" ? 8 : 10

      ctx.fillStyle = atomColor
      ctx.beginPath()
      ctx.arc(atom.x, atom.y, atomRadius, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = "#333"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.arc(atom.x, atom.y, atomRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Label atoms
      ctx.fillStyle = "#fff"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(atom.type, atom.x, atom.y)
    })

    // Highlight mutation site if showing mutant
    if (selectedStructure === "mutant") {
      const mutationSite = atoms[Math.floor(Math.random() * atoms.length)]

      ctx.strokeStyle = "#FF5757"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(mutationSite.x, mutationSite.y, 15, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const toggleFullscreen = () => {
    const container = canvasRef.current?.parentElement
    if (!container) return

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }

    setIsFullscreen(!isFullscreen)
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Molecular Structure Visualization</CardTitle>
        <CardDescription>3D visualization of protein structure with mutation sites.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedProtein} onValueChange={setSelectedProtein}>
              <SelectTrigger>
                <SelectValue placeholder="Select protein" />
              </SelectTrigger>
              <SelectContent>
                {availableProteins.map((protein) => (
                  <SelectItem key={protein.id} value={protein.id}>
                    {protein.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <Select value={selectedStructure} onValueChange={setSelectedStructure as any}>
              <SelectTrigger>
                <SelectValue placeholder="Select structure type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wild">Wild Type</SelectItem>
                <SelectItem value="mutant">Mutant</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={viewMode} onValueChange={setViewMode as any}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ribbon">Ribbon</TabsTrigger>
            <TabsTrigger value="surface">Surface</TabsTrigger>
            <TabsTrigger value="ball-and-stick">Ball & Stick</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full h-[400px] bg-background rounded-md border">
          <canvas ref={canvasRef} className="w-full h-full" />

          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button variant="outline" size="icon">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Note: This is a simplified visualization for demonstration purposes.</p>
          <p>
            In a production environment, this would use a 3D molecular visualization library like NGL Viewer or Mol*.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

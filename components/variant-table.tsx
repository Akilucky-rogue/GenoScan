"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Variant {
  chrom: string
  position: number
  id: string
  ref: string
  alt: string
  gene?: string
  info?: string
  pathogenicityScore?: number
}

interface VariantTableProps {
  variants?: Variant[]
}

export function VariantTable({ variants = [] }: VariantTableProps) {
  if (!variants || variants.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">No variants detected.</div>
  }

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Gene</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Pathogenicity Score</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant, index) => (
            <TableRow key={variant.id || index}>
              <TableCell className="font-medium">{variant.gene || "Unknown"}</TableCell>
              <TableCell>{variant.chrom}:{variant.position}</TableCell>
              <TableCell>{variant.ref} &gt; {variant.alt}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    (variant.pathogenicityScore || 0) > 0.7
                      ? "destructive"
                      : (variant.pathogenicityScore || 0) > 0.4
                        ? "default" // Use default (primary color) for moderate
                        : "outline"
                  }
                >
                  {variant.pathogenicityScore ? variant.pathogenicityScore.toFixed(3) : "N/A"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Details</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="space-y-1 max-w-xs break-words">
                        <p className="text-sm font-semibold">Info</p>
                        <p className="text-xs text-muted-foreground">{variant.info}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

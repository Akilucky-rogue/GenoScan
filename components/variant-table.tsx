"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Mock data for detected variants
const variants = [
  {
    id: "rs28897696",
    gene: "BRCA1",
    position: "chr17:43057051",
    change: "c.5123C>A",
    consequence: "p.Ala1708Glu",
    significance: "Pathogenic",
    phenotype: "Hereditary breast and ovarian cancer",
  },
  {
    id: "rs80357906",
    gene: "BRCA2",
    position: "chr13:32340301",
    change: "c.1832T>G",
    consequence: "p.Leu611*",
    significance: "Pathogenic",
    phenotype: "Hereditary breast and ovarian cancer",
  },
  {
    id: "rs121908755",
    gene: "TP53",
    position: "chr17:7577121",
    change: "c.818G>A",
    consequence: "p.Arg273His",
    significance: "Pathogenic",
    phenotype: "Li-Fraumeni syndrome",
  },
  {
    id: "rs587776767",
    gene: "PTEN",
    position: "chr10:89692905",
    change: "c.388C>T",
    consequence: "p.Arg130*",
    significance: "Likely pathogenic",
    phenotype: "Cowden syndrome",
  },
  {
    id: "rs587781384",
    gene: "MLH1",
    position: "chr3:37038108",
    change: "c.350C>T",
    consequence: "p.Thr117Met",
    significance: "Uncertain significance",
    phenotype: "Lynch syndrome",
  },
]

export function VariantTable() {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Gene</TableHead>
            <TableHead>Variant</TableHead>
            <TableHead>Consequence</TableHead>
            <TableHead>Significance</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell className="font-medium">{variant.gene}</TableCell>
              <TableCell>{variant.change}</TableCell>
              <TableCell>{variant.consequence}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    variant.significance === "Pathogenic"
                      ? "destructive"
                      : variant.significance === "Likely pathogenic"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {variant.significance}
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
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{variant.phenotype}</p>
                        <p className="text-xs text-muted-foreground">Position: {variant.position}</p>
                        <p className="text-xs text-muted-foreground">ID: {variant.id}</p>
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

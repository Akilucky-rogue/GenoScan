"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Info, ExternalLink, Filter } from "lucide-react"

interface VariantViewerProps {
  variants?: any[]
}

export function VariantViewer({ variants }: VariantViewerProps) {
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [filter, setFilter] = useState<string>("all")

  // Use provided variants or mock data
  const variantData = variants || [
    {
      id: "rs28897696",
      gene: "BRCA1",
      position: "chr17:43057051",
      change: "c.5123C>A",
      consequence: "p.Ala1708Glu",
      significance: "Pathogenic",
      phenotype: "Hereditary breast and ovarian cancer",
      frequency: "0.0001",
      conservation: "High",
      impact: "High",
      citations: 24,
      lastUpdated: "2023-05-15",
    },
    {
      id: "rs80357906",
      gene: "BRCA2",
      position: "chr13:32340301",
      change: "c.1832T>G",
      consequence: "p.Leu611*",
      significance: "Pathogenic",
      phenotype: "Hereditary breast and ovarian cancer",
      frequency: "0.0002",
      conservation: "High",
      impact: "High",
      citations: 18,
      lastUpdated: "2023-06-22",
    },
    {
      id: "rs121908755",
      gene: "TP53",
      position: "chr17:7577121",
      change: "c.818G>A",
      consequence: "p.Arg273His",
      significance: "Pathogenic",
      phenotype: "Li-Fraumeni syndrome",
      frequency: "0.0005",
      conservation: "High",
      impact: "High",
      citations: 42,
      lastUpdated: "2023-04-10",
    },
    {
      id: "rs587776767",
      gene: "PTEN",
      position: "chr10:89692905",
      change: "c.388C>T",
      consequence: "p.Arg130*",
      significance: "Likely pathogenic",
      phenotype: "Cowden syndrome",
      frequency: "0.0003",
      conservation: "High",
      impact: "High",
      citations: 12,
      lastUpdated: "2023-07-05",
    },
    {
      id: "rs587781384",
      gene: "MLH1",
      position: "chr3:37038108",
      change: "c.350C>T",
      consequence: "p.Thr117Met",
      significance: "Uncertain significance",
      phenotype: "Lynch syndrome",
      frequency: "0.0008",
      conservation: "Medium",
      impact: "Medium",
      citations: 5,
      lastUpdated: "2023-08-18",
    },
    {
      id: "rs398123548",
      gene: "APC",
      position: "chr5:112175240",
      change: "c.3920T>A",
      consequence: "p.Ile1307Lys",
      significance: "Benign",
      phenotype: "Familial adenomatous polyposis",
      frequency: "0.0060",
      conservation: "Low",
      impact: "Low",
      citations: 8,
      lastUpdated: "2023-03-12",
    },
  ]

  const filteredVariants = filter === "all" ? variantData : variantData.filter((v) => v.significance === filter)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Detected Variants</CardTitle>
            <CardDescription>Detailed analysis of genetic variants detected in the sequence.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select className="text-sm border rounded p-1" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All variants</option>
              <option value="Pathogenic">Pathogenic</option>
              <option value="Likely pathogenic">Likely pathogenic</option>
              <option value="Uncertain significance">Uncertain significance</option>
              <option value="Benign">Benign</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="table">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="details">Detailed View</TabsTrigger>
          </TabsList>
          <TabsContent value="table" className="mt-4">
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
                  {filteredVariants.map((variant) => (
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
                                : variant.significance === "Uncertain significance"
                                  ? "secondary"
                                  : "outline"
                          }
                        >
                          {variant.significance}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedVariant(variant)}>
                              <Info className="h-4 w-4" />
                              <span className="sr-only">Details</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Variant Details: {variant.gene} {variant.change}
                              </DialogTitle>
                              <DialogDescription>Detailed information about this genetic variant</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Gene</p>
                                <p className="text-sm text-muted-foreground">{variant.gene}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Variant ID</p>
                                <p className="text-sm text-muted-foreground">{variant.id}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Position</p>
                                <p className="text-sm text-muted-foreground">{variant.position}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Change</p>
                                <p className="text-sm text-muted-foreground">{variant.change}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Consequence</p>
                                <p className="text-sm text-muted-foreground">{variant.consequence}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Clinical Significance</p>
                                <p className="text-sm text-muted-foreground">{variant.significance}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Phenotype</p>
                                <p className="text-sm text-muted-foreground">{variant.phenotype}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Population Frequency</p>
                                <p className="text-sm text-muted-foreground">{variant.frequency}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Conservation</p>
                                <p className="text-sm text-muted-foreground">{variant.conservation}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Impact</p>
                                <p className="text-sm text-muted-foreground">{variant.impact}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Citations</p>
                                <p className="text-sm text-muted-foreground">{variant.citations} publications</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Last Updated</p>
                                <p className="text-sm text-muted-foreground">{variant.lastUpdated}</p>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button variant="outline" size="sm">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View in ClinVar
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          <TabsContent value="details" className="mt-4">
            <div className="grid gap-4 md:grid-cols-2">
              {filteredVariants.map((variant) => (
                <Card key={variant.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {variant.gene} {variant.change}
                        </CardTitle>
                        <CardDescription>{variant.consequence}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          variant.significance === "Pathogenic"
                            ? "destructive"
                            : variant.significance === "Likely pathogenic"
                              ? "destructive"
                              : variant.significance === "Uncertain significance"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {variant.significance}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Position:</span>
                        <span>{variant.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phenotype:</span>
                        <span>{variant.phenotype}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span>{variant.frequency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Citations:</span>
                        <span>{variant.citations} publications</span>
                      </div>
                      <div className="pt-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Info className="h-4 w-4 mr-2" />
                          View Full Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

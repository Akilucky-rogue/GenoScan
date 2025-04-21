"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"

// Mock data for therapeutic suggestions
const therapeuticSuggestions = [
  {
    id: 1,
    type: "Small Molecule",
    name: "PARP Inhibitors",
    description:
      "PARP inhibitors like Olaparib may be effective for BRCA1/2 mutations by exploiting synthetic lethality in DNA repair pathways.",
    confidence: "High",
    mechanism: "Inhibits poly(ADP-ribose) polymerase enzymes involved in DNA repair",
    targetGenes: ["BRCA1", "BRCA2"],
    references: [
      {
        title: "PARP inhibitors: Synthetic lethality in the clinic",
        url: "https://www.science.org/doi/10.1126/science.1214430",
      },
    ],
  },
  {
    id: 2,
    type: "Biologics",
    name: "Monoclonal Antibodies",
    description:
      "Trastuzumab may be effective for certain TP53 mutations by targeting downstream effectors in the p53 pathway.",
    confidence: "Medium",
    mechanism: "Targets HER2 receptor, which can be overexpressed in certain p53-mutated cancers",
    targetGenes: ["TP53"],
    references: [
      {
        title: "Targeting p53-Deficient Cancers",
        url: "https://www.nature.com/articles/nrc.2018.11",
      },
    ],
  },
  {
    id: 3,
    type: "Gene Therapy",
    name: "CRISPR-Cas9 Gene Editing",
    description:
      "CRISPR-based approaches could potentially correct the identified pathogenic variants in BRCA1, BRCA2, and TP53.",
    confidence: "Experimental",
    mechanism: "Direct correction of pathogenic mutations using CRISPR-Cas9 gene editing technology",
    targetGenes: ["BRCA1", "BRCA2", "TP53", "PTEN", "MLH1"],
    references: [
      {
        title: "CRISPR-Cas9 gene editing for patients with BRCA mutations",
        url: "https://www.nature.com/articles/s41586-020-2766-y",
      },
    ],
  },
]

export function TherapeuticSuggestions() {
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="small-molecule">Small Molecule</TabsTrigger>
        <TabsTrigger value="biologics">Biologics</TabsTrigger>
        <TabsTrigger value="gene-therapy">Gene Therapy</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-4 space-y-4">
        {therapeuticSuggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </TabsContent>
      <TabsContent value="small-molecule" className="mt-4 space-y-4">
        {therapeuticSuggestions
          .filter((s) => s.type === "Small Molecule")
          .map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
      </TabsContent>
      <TabsContent value="biologics" className="mt-4 space-y-4">
        {therapeuticSuggestions
          .filter((s) => s.type === "Biologics")
          .map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
      </TabsContent>
      <TabsContent value="gene-therapy" className="mt-4 space-y-4">
        {therapeuticSuggestions
          .filter((s) => s.type === "Gene Therapy")
          .map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
      </TabsContent>
    </Tabs>
  )
}

function SuggestionCard({ suggestion }: { suggestion: (typeof therapeuticSuggestions)[0] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{suggestion.name}</CardTitle>
            <CardDescription>{suggestion.type}</CardDescription>
          </div>
          <Badge
            variant={
              suggestion.confidence === "High"
                ? "default"
                : suggestion.confidence === "Medium"
                  ? "secondary"
                  : "outline"
            }
          >
            {suggestion.confidence} confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm">{suggestion.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Mechanism of Action</h4>
            <p className="text-sm text-muted-foreground">{suggestion.mechanism}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">Target Genes</h4>
            <div className="flex flex-wrap gap-2">
              {suggestion.targetGenes.map((gene) => (
                <Badge key={gene} variant="secondary">
                  {gene}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-1">References</h4>
            <ul className="space-y-1">
              {suggestion.references.map((ref, index) => (
                <li key={index} className="text-sm">
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    {ref.title}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

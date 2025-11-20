"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"

type Suggestion = {
  id: string | number
  type: string
  name: string
  description: string
  mechanism?: string
  targetGenes?: string[]
  references?: { title: string; url?: string }[]
  confidence?: string
}

export function TherapeuticSuggestions({ variants }: { variants?: any[] }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const body = { variants: variants ?? [] }
        const res = await fetch("/api/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok || !data?.ok) {
          setError(data?.error ?? "Failed to load suggestions")
          setSuggestions([])
        } else {
          // flatten categories into single list for display
          const list: Suggestion[] = []
          ;["smallMolecules", "biologics", "geneTherapies"].forEach((k) => {
            const items = data.suggestions?.[k] ?? []
            items.forEach((it: any) => list.push(it))
          })
          setSuggestions(list)
        }
      } catch (err: any) {
        setError(String(err))
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [variants])

  if (loading) return <div>Loading therapeutic suggestions…</div>
  if (error) return <div className="text-destructive">Error: {error}</div>

  const byType = (t: string) => suggestions.filter((s) => s.type && s.type.toLowerCase().includes(t))

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="small-molecule">Small Molecule</TabsTrigger>
        <TabsTrigger value="biologics">Biologics</TabsTrigger>
        <TabsTrigger value="gene-therapy">Gene Therapy</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-4 space-y-4">
        {suggestions.map((suggestion) => (
          <SuggestionCard key={String(suggestion.id)} suggestion={suggestion} />
        ))}
      </TabsContent>
      <TabsContent value="small-molecule" className="mt-4 space-y-4">
        {byType("small").map((suggestion) => (
          <SuggestionCard key={String(suggestion.id)} suggestion={suggestion} />
        ))}
      </TabsContent>
      <TabsContent value="biologics" className="mt-4 space-y-4">
        {byType("biologic").map((suggestion) => (
          <SuggestionCard key={String(suggestion.id)} suggestion={suggestion} />
        ))}
      </TabsContent>
      <TabsContent value="gene-therapy" className="mt-4 space-y-4">
        {byType("gene").map((suggestion) => (
          <SuggestionCard key={String(suggestion.id)} suggestion={suggestion} />
        ))}
      </TabsContent>
    </Tabs>
  )
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
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
            {suggestion.confidence ?? "N/A"} confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm">{suggestion.description}</p>
          </div>
          {suggestion.mechanism && (
            <div>
              <h4 className="text-sm font-semibold mb-1">Mechanism of Action</h4>
              <p className="text-sm text-muted-foreground">{suggestion.mechanism}</p>
            </div>
          )}
          {suggestion.targetGenes && (
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
          )}
          {suggestion.references && (
            <div>
              <h4 className="text-sm font-semibold mb-1">References</h4>
              <ul className="space-y-1">
                {suggestion.references.map((ref, index) => (
                  <li key={index} className="text-sm">
                    {ref.url ? (
                      <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                        {ref.title}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ) : (
                      <span>{ref.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
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

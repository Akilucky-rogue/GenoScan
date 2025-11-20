// This file contains services for interacting with bioinformatics APIs

// BLAST API service
export const blastService = {
  // Search for similar sequences in the NCBI database
  async searchSequence(sequence: string): Promise<any> {
    // In a real implementation, this would call the NCBI BLAST API
    // For the prototype, we'll simulate the API call
    console.log(`Searching for sequence: ${sequence.substring(0, 20)}...`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Return mock results
    return {
      hits: [
        {
          id: "NM_007294.4",
          title: "Homo sapiens BRCA1 DNA repair associated (BRCA1), transcript variant 1, mRNA",
          score: 1200,
          eValue: "0.0",
          identity: "99%",
          alignmentLength: 5589,
          organism: "Homo sapiens",
          database: "nr",
        },
        {
          id: "NM_000059.4",
          title: "Homo sapiens BRCA2 DNA repair associated (BRCA2), mRNA",
          score: 980,
          eValue: "1e-150",
          identity: "92%",
          alignmentLength: 10257,
          organism: "Homo sapiens",
          database: "nr",
        },
        {
          id: "XM_011542531.3",
          title: "PREDICTED: Pan troglodytes BRCA1 DNA repair associated (BRCA1), transcript variant X4, mRNA",
          score: 950,
          eValue: "1e-145",
          identity: "90%",
          alignmentLength: 5502,
          organism: "Pan troglodytes",
          database: "nr",
        },
      ],
      statistics: {
        databaseSize: "214,785,182,139",
        searchTime: "1.2 seconds",
        filteringEnabled: true,
      },
    }
  },
}

// Variant analysis service
export const variantService = {
  // Analyze variants for clinical significance
  async analyzeVariants(variants: any[]): Promise<any> {
    // In a real implementation, this would call ClinVar or similar API
    console.log(`Analyzing ${variants.length} variants`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Return mock results with clinical significance
    return variants.map((variant) => ({
      ...variant,
      clinicalSignificance:
        Math.random() > 0.7
          ? "Pathogenic"
          : Math.random() > 0.5
            ? "Likely pathogenic"
            : Math.random() > 0.3
              ? "Uncertain significance"
              : "Benign",
      citations: Math.floor(Math.random() * 15),
      lastUpdated: new Date().toISOString(),
    }))
  },
}

// Therapeutic suggestion service
export const therapeuticService = {
  // Get therapeutic suggestions based on variants
  async getSuggestions(variants: any[]): Promise<any> {
    // Attempt to enrich variants with ML predictions (pathogenicityScore) using local model.
    console.log(`Getting therapeutic suggestions for ${variants.length} variants`)

    // Try dynamic import of the simple ML wrapper so this file still works if ML not present.
    let enriched = variants
    try {
      // Dynamic import works with ESM and CJS test runners. If the module isn't
      // present or fails to load, fall back to heuristics below.
      const mlModule = await import("./ml")
      const ml = (mlModule as any)
      if (ml && typeof ml.predictVariants === "function") {
        enriched = await ml.predictVariants(variants)
      }
    } catch (err) {
      // if ML missing, fall back to heuristics
      // log at debug level to avoid noisy errors in test output
      // console.debug("ML predict not available, using heuristics", err)
    }

  // Simulate API delay (short)
  await new Promise((resolve) => setTimeout(resolve, 400))

    // Base mock suggestions
    const base = {
      smallMolecules: [
        {
          id: "SM001",
          name: "Olaparib",
          targetGenes: ["BRCA1", "BRCA2"],
          mechanism: "PARP inhibition",
          clinicalPhase: "Approved",
          indications: ["Breast cancer", "Ovarian cancer"],
          references: [
            { pmid: "24567426", title: "Olaparib in patients with recurrent high-grade serous ovarian carcinoma" },
          ],
          confidenceScore: 0.6,
        },
        {
          id: "SM002",
          name: "Talazoparib",
          targetGenes: ["BRCA1", "BRCA2"],
          mechanism: "PARP inhibition",
          clinicalPhase: "Approved",
          indications: ["Breast cancer"],
          references: [
            {
              pmid: "29863979",
              title: "Talazoparib in Patients with Advanced Breast Cancer and a Germline BRCA Mutation",
            },
          ],
          confidenceScore: 0.55,
        },
      ],
      biologics: [
        {
          id: "BIO001",
          name: "Trastuzumab",
          targetGenes: ["ERBB2"],
          mechanism: "HER2 inhibition",
          clinicalPhase: "Approved",
          indications: ["Breast cancer", "Gastric cancer"],
          references: [{ pmid: "11248153", title: "Use of chemotherapy plus a monoclonal antibody against HER2" }],
          confidenceScore: 0.35,
        },
      ],
      geneTherapies: [
        {
          id: "GT001",
          name: "CRISPR-Cas9 gene editing",
          targetGenes: ["BRCA1", "BRCA2", "TP53"],
          mechanism: "Gene correction",
          clinicalPhase: "Phase I",
          indications: ["Various cancers"],
          references: [{ pmid: "31802835", title: "CRISPR-Cas9 gene editing for cancer therapeutics" }],
          confidenceScore: 0.25,
        },
      ],
      clinicalTrials: [
        {
          id: "NCT03367689",
          title: "A Study of Rucaparib in Patients With Various Solid Tumors With BRCA1, BRCA2, or PALB2 Mutations",
          phase: "Phase II",
          status: "Recruiting",
          locations: ["United States", "Canada", "United Kingdom"],
          url: "https://clinicaltrials.gov/ct2/show/NCT03367689",
        },
        {
          id: "NCT04171700",
          title: "A Study of Olaparib Plus Pembrolizumab in Participants With Advanced Cancer",
          phase: "Phase I/II",
          status: "Recruiting",
          locations: ["United States", "Spain", "Korea"],
          url: "https://clinicaltrials.gov/ct2/show/NCT04171700",
        },
      ],
    }

    // Adjust suggestion confidence using enriched variant pathogenicity scores when available
    function adjust(list: any[]) {
      return list.map((item) => {
        try {
          const genes = item.targetGenes ?? []
          // compute average pathogenicity for variants matching target genes
          const matched = enriched.filter((v: any) => (v.gene && genes.includes(v.gene)) || (v.gene && genes.includes(String(v.gene).toUpperCase())))
          const avg = matched.length ? matched.reduce((s: number, v: any) => s + (v.pathogenicityScore ?? 0), 0) / matched.length : 0
          // boost base confidence by avg*0.5
          const newScore = Math.min(0.99, (item.confidenceScore ?? 0.4) + avg * 0.5)
          const confidence = newScore > 0.7 ? "High" : newScore > 0.45 ? "Medium" : "Low"
          return { ...item, confidenceScore: newScore, confidence }
        } catch (err) {
          return { ...item, confidence: "Unknown" }
        }
      })
    }

    const result = {
      smallMolecules: adjust(base.smallMolecules),
      biologics: adjust(base.biologics),
      geneTherapies: adjust(base.geneTherapies),
      clinicalTrials: base.clinicalTrials,
      enrichedVariants: enriched,
    }

    return result
  },
}

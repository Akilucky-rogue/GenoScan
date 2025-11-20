# ML/AI Contract — GenomeScan PoC

This document defines a small, clear contract for the lightweight ML proof-of-concept included in the repository.

Purpose
- Provide a minimal, reproducible interface for scoring variant pathogenicity used to adjust therapeutic suggestion confidence.

Model type
- Binary classifier (logistic regression) producing a continuous pathogenicity score in [0,1].

Inputs
- An array of variant objects. Each variant may include fields like:
  - `gene` (string)
  - `impact` (string, e.g., 'HIGH', 'MODERATE', 'LOW')
  - `af` (number: allele frequency 0-1)
  - `clinicalSignificance` (string)
  - `conservation` (number 0-1)

Outputs
- For each input variant the model returns the same object with an added field:
  - `pathogenicityScore`: number in [0,1] (higher = more likely pathogenic)

Error modes
- If input validation fails, the API returns 400 with a message describing invalid fields.
- If the model file is missing, `predictVariants` falls back to a deterministic heuristic score and remains operational.

Success criteria
- Model returns a score for each valid variant within 200ms for small batches (prototype target).
- Frontend demonstrates the scores affecting therapeutic suggestion confidence.

Notes & path to production
- For production, replace the PoC model with a model trained on curated clinical datasets (ClinVar, gnomAD, etc.).
- Consider more advanced model I/O: feature pipelines, calibration, uncertainty estimates, and explainability (SHAP).

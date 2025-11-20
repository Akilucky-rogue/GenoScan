
async function main() {
    console.log("Verifying Suggestions API by importing handler...");

    try {
        // Mock variants data
        const variants = [
            {
                gene: "BRCA1",
                pathogenicityScore: 0.85, // High pathogenicity
                chrom: "chr17",
                pos: 43057051,
                ref: "C",
                alt: "A"
            },
            {
                gene: "TP53",
                pathogenicityScore: 0.95,
                chrom: "chr17",
                pos: 7673802,
                ref: "C",
                alt: "T"
            }
        ];

        // Import the handler
        const { POST } = await import('../app/api/suggestions/route');

        // Create a mock request
        const request = new Request('http://localhost:3000/api/suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ variants })
        });

        const response = await POST(request);

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Suggestions Response:", JSON.stringify(data, null, 2));

        if (!data.ok || !data.suggestions) {
            throw new Error("Invalid response format");
        }

        const { smallMolecules, biologics, geneTherapies } = data.suggestions;

        if (!smallMolecules || !biologics || !geneTherapies) {
            throw new Error("Missing suggestion categories");
        }

        console.log(`Received ${smallMolecules.length} small molecules, ${biologics.length} biologics, ${geneTherapies.length} gene therapies.`);

        // Check if confidence was adjusted
        const highConfidence = smallMolecules.find((s: any) => s.confidence === "High");
        if (highConfidence) {
            console.log("Found high confidence suggestion:", highConfidence.name);
        } else {
            console.log("No high confidence suggestions found (check pathogenicity scoring logic).");
        }

        console.log("Verification SUCCESS!");

    } catch (error) {
        console.error("Verification FAILED:", error);
        process.exit(1);
    }
}

main();

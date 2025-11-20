
import fs from 'fs';
import path from 'path';

async function main() {
    const baseUrl = 'http://localhost:3000';

    // We can't easily test against localhost:3000 if the server isn't running.
    // But we can import the route handlers directly if we want to unit test, 
    // OR we can assume the user will run this against a running server.
    // Given the environment, I'll try to import the logic or just mock the request if I can't reach the server.
    // Actually, the best way in this environment is to use the Next.js test utils or just run the logic directly.

    // However, I can't easily spin up the Next.js server in background and run tests against it in this environment reliably without blocking.
    // So I will verify by importing the route handlers and calling them with mock requests.

    console.log("Verifying API logic by importing handlers...");

    try {
        // 1. Test Upload Logic (Mocking the request)
        const { POST: uploadPost } = await import('../app/api/upload/route');

        const vcfContent = `#CHROM POS ID REF ALT QUAL FILTER INFO
chr1 100 . A T . . GENE=BRCA1;
chr2 200 . G C . . GENE=TP53;`;

        const formData = new FormData();
        const file = new Blob([vcfContent], { type: 'text/plain' });
        formData.append('file', file, 'test.vcf');

        const uploadReq = new Request('http://localhost/api/upload', {
            method: 'POST',
            body: formData as any
        });

        const uploadRes = await uploadPost(uploadReq);
        const uploadData = await uploadRes.json();

        console.log('Upload Response:', JSON.stringify(uploadData, null, 2));
        if (!uploadData.variants || uploadData.variants.length !== 2) {
            throw new Error('Upload failed to parse variants correctly');
        }

        // 2. Test Inference Logic
        const { POST: inferPost } = await import('../app/api/infer/route');

        const inferReq = new Request('http://localhost/api/infer', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ variants: uploadData.variants })
        });

        const inferRes = await inferPost(inferReq);
        const inferData = await inferRes.json();

        console.log('Inference Response:', JSON.stringify(inferData, null, 2));

        if (!inferData.ok || !inferData.results) {
            throw new Error('Inference failed');
        }

        const firstResult = inferData.results[0];
        if (typeof firstResult.pathogenicityScore !== 'number') {
            throw new Error('Inference did not return pathogenicityScore');
        }

        console.log('Verification SUCCESS!');

    } catch (error) {
        console.error('Verification FAILED:', error);
        process.exit(1);
    }
}

main();

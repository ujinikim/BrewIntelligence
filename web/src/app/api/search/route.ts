import { NextResponse } from 'next/server';
import { getCoffeeData } from '@/utils/data';
import { pipeline } from '@xenova/transformers';
import path from 'path';
import fs from 'fs';

// Force dynamic since we use search params
export const dynamic = 'force-dynamic';

// Singleton for the model to avoid reloading on every request (in dev it might reload)
let extractor: any = null;

// Cosine Similarity Utility
function cosineSimilarity(a: number[], b: number[]) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  const data = await getCoffeeData();

  // 1. Initial State / Empty Query
  const flavors = searchParams.get('flavors');
  
  if (!query && !flavors) {
    return NextResponse.json({ 
      status: 'ok', 
      message: 'BrewIntelligence Semantic Search is Ready. Send ?q=query',
      total_beans: data.length 
    });
  }

  try {
    // 2. Load Embeddings (Server Side)
    // In production, this file should be read once or cached.
    // For Vercel, process.cwd() is usually the root.
    const uniqueId = process.env.VERCEL ? 'embeddings.json' : 'web/src/app/api/search/embeddings.json';
    const filePath = path.join(process.cwd(), 'src/app/api/search/embeddings.json');
    // For local dev, we might need adjustments based on cwd.
    // Let's rely on absolute check or relative to CWD.
    // If running from root 'BrewIntelligence':
    let realPath = path.resolve('web/src/app/api/search/embeddings.json');
    if (!fs.existsSync(realPath)) {
        // Fallback for Next.js internal server execution context
        realPath = path.resolve(process.cwd(), 'src/app/api/search/embeddings.json');
    }
    
    // Safety check
    if (!fs.existsSync(realPath)) {
        console.warn("Embeddings file not found at", realPath, "falling back to keyword search.");
        throw new Error("Embeddings not found");
    }

    const embeddingsRaw = fs.readFileSync(realPath, 'utf-8');
    const embeddingMap: { id: number; name: string; vector: number[] }[] = JSON.parse(embeddingsRaw);

    // 3. Generate Embedding for Query (Text or Weighted Mix)
    if (!extractor) {
      // Using quantization to keep it fast/light
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    let queryVector: number[] = [];
    
    const flavors = searchParams.get('flavors')?.split(',') || [];

    // Prioritize or blend query
    if (query || flavors.length > 0) {
        let hybridPrompt = query || "Coffee";
        if (flavors.length > 0) {
            hybridPrompt += ` with strong notes of ${flavors.join(', ')}`;
        }

        // console.log("Hybrid Prompt:", hybridPrompt);

        const output = await extractor(hybridPrompt, { pooling: 'mean', normalize: true });
        queryVector = Array.from(output.data) as number[];
    }
    else {
         // Fallback if nothing
         return NextResponse.json({ 
            status: 'ok', 
            message: 'BrewIntelligence Semantic Search is Ready. Send ?q=query or ?flavors=fruity',
            total_beans: data.length 
          });
    }

    // 4. Perform Vector Search (Cosine Similarity)
    const scoredResults = embeddingMap.map((item) => {
      const score = cosineSimilarity(queryVector, item.vector);
      // Find original bean data
      const bean = data[item.id]; 
      return { ...bean, similarity: score };
    });
    
    // 5. Sort by Similarity
    // Filter out low relevance matches (< 0.1 is usually noise)
    const topResults = scoredResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    return NextResponse.json({
      query,
      type: 'semantic',
      count: topResults.length,
      results: topResults
    });

  } catch (error) {
    console.error("Semantic search failed:", error);
    
    // Fallback to Keyword Search
    if (query) {
        const lowerQuery = query.toLowerCase();
        const results = data.filter(bean => {
            const text = (bean.review || '' + bean.name).toLowerCase();
            return text.includes(lowerQuery);
        });

        return NextResponse.json({
            query,
            type: 'keyword_fallback',
            count: results.length,
            results: results.slice(0, 5)
        });
    }

    // If no query (e.g. EQ mode failed), return empty or error
    return NextResponse.json({
        type: 'error',
        message: 'Search failed and no text query provided for fallback.',
        results: []
    }, { status: 500 });
  }
}

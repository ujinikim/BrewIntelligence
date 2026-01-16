import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { pipeline } from '@xenova/transformers';

// Force dynamic since we use search params
export const dynamic = 'force-dynamic';

// Singleton for the model
// Note: In serverless (Vercel), this might be re-initialized, but it caches the model files.
let extractor: any = null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const flavors = searchParams.get('flavors');

  // If nothing provided, return ready state
  if (!query && !flavors) {
    return NextResponse.json({ 
      status: 'ok', 
      message: 'BrewIntelligence Live Search Ready.' 
    });
  }

  try {
    // 1. Initialize Transformer (if needed)
    if (!extractor) {
      extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    }

    // 2. Construct Prompt
    let hybridPrompt = query || "";
    if (flavors) {
        // Boost the prompt with flavor keywords
        hybridPrompt += ` ${flavors.split(',').join(' ')}`;
    }

    // 3. Generate Embedding
    const output = await extractor(hybridPrompt, { pooling: 'mean', normalize: true });
    const queryVector = Array.from(output.data);

    // 4. Call Supabase RPC
    const { data: matchResults, error: rpcError } = await supabase.rpc('match_reviews', {
      query_embedding: queryVector,
      match_threshold: 0.1, 
      match_count: 20
    });

    if (rpcError) throw rpcError;
    if (!matchResults || matchResults.length === 0) {
        return NextResponse.json({ query: hybridPrompt, results: [] });
    }

    const ids = matchResults.map((r: any) => r.id);
    const { data: hydratedResults, error: hydrationError } = await supabase
        .from('reviews')
        .select('*')
        .in('id', ids);

    if (hydrationError) throw hydrationError;

    const finalResults = matchResults.map((match: any) => {
        const fullData = hydratedResults?.find((h: any) => h.id === match.id);
        return { ...fullData, similarity: match.similarity };
    }).sort((a: any, b: any) => b.similarity - a.similarity);

    return NextResponse.json({
      query: hybridPrompt,
      type: 'semantic_live_hydrated',
      count: finalResults.length,
      results: finalResults
    });

  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ 
        type: 'error', 
        message: 'Internal Search Error',
        error: String(error)
    }, { status: 500 });
  }
}

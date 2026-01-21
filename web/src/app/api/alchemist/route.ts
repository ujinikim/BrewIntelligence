import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import concepts from './concepts.json';

export const dynamic = 'force-dynamic';

interface FormulaStep {
  id: string;
  type: 'add' | 'sub';
  weight: number;
}

export async function POST(request: Request) {
  try {
    const { formula }: { formula: FormulaStep[] } = await request.json();

    if (!formula || formula.length === 0) {
      return NextResponse.json({ error: "Empty formula" }, { status: 400 });
    }

    // 1. Initialize with Zero Vector (384 dimensions)
    let resultVector = new Array(384).fill(0);

    // 2. Perform Vector Arithmetic
    formula.forEach(step => {
      const conceptVec = (concepts as any)[step.id];
      if (conceptVec) {
        for (let i = 0; i < 384; i++) {
          if (step.type === 'add') {
            resultVector[i] += conceptVec[i] * (step.weight || 1);
          } else {
            resultVector[i] -= conceptVec[i] * (step.weight || 1);
          }
        }
      }
    });

    // 3. Normalize resulting vector (optional but recommended for cosine similarity)
    const magnitude = Math.sqrt(resultVector.reduce((acc, val) => acc + val * val, 0));
    if (magnitude > 0) {
      resultVector = resultVector.map(v => v / magnitude);
    }

    // 4. Match against Database
    const { data: matchResults, error: rpcError } = await supabase.rpc('match_reviews', {
      query_embedding: resultVector,
      match_threshold: 0.1, // Lower threshold for "Alchemist" experiments
      match_count: 5
    });

    if (rpcError) throw rpcError;

    // 5. Hydrate
    if (matchResults && matchResults.length > 0) {
        const ids = matchResults.map((r: any) => r.id);
        const { data: hydrated } = await supabase.from('reviews').select('*').in('id', ids);
        
        const final = matchResults.map((m: any) => ({
            ...hydrated?.find(h => h.id === m.id),
            similarity: m.similarity
        })).sort((a: any, b: any) => b.similarity - a.similarity);

        return NextResponse.json({ results: final });
    }

    return NextResponse.json({ results: [] });

  } catch (error) {
    console.error("Alchemist API Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

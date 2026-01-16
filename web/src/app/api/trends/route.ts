import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Force dynamic behavior
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch latest high-scoring reviews (> 85 is 'Specialty', but for demo we take > 70)
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .order('id', { ascending: false }) // Get latest
      .limit(50);

    if (error) throw error;

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({ message: "No data available" });
    }

    // 2. Analyze Trends (Simple Frequency Analysis on 'blind_assessment')
    // In a real AI app, we would cluster the vectors. 
    // Here we will use a quick keyword count on the descriptions.
    const keywords: Record<string, number> = {};
    const skipWords = ['and', 'with', 'the', 'a', 'in', 'of', 'cup', 'notes', 'finish', 'mouthfeel', 'acidity', 'structure', 'coffee', 'bean', 'roast', 'flavor', 'aroma', 'brewed', 'review'];

    reviews.forEach(r => {
        const text = (r.review || '').toLowerCase();
        const words = text.replace(/[.,]/g, '').split(/\s+/);
        
        words.forEach(w => {
            if (w.length > 3 && !skipWords.includes(w)) {
                keywords[w] = (keywords[w] || 0) + 1;
            }
        });
    });

    // Sort keywords
    const sortedTrends = Object.entries(keywords)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([word]) => word);

    const topTrend = sortedTrends[0] || "Coffee";

    // 3. Find the "Champion" of this trend
    const trendChampion = reviews.find(r => 
        (r.review || '').toLowerCase().includes(topTrend)
    );

    return NextResponse.json({
      date: new Date().toISOString(),
      trending_flavor: topTrend.charAt(0).toUpperCase() + topTrend.slice(1),
      related_keywords: sortedTrends,
      champion_bean: trendChampion,
      total_analyzed: reviews.length
    });

  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Award, Loader2, Sparkles, Zap } from 'lucide-react';

interface TrendData {
  trending_flavor: string;
  related_keywords: string[];
  total_analyzed: number;
  champion_bean?: {
    title: string;
    rating: number;
    roaster: string;
  };
}

export function TrendCard() {
  const [data, setData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trends')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 rounded-[2.5rem] bg-stone-900 shadow-xl flex flex-col items-center justify-center h-[350px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent animate-pulse" />
        <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-4" />
        <p className="text-stone-500 text-[10px] font-bold uppercase tracking-[0.3em]">Analyzing Trends</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="group relative overflow-hidden p-10 rounded-[2.5rem] bg-stone-900 text-white shadow-2xl h-[350px] flex flex-col justify-between transition-all duration-500 hover:-translate-y-1">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-white/5 rounded-2xl group-hover:rotate-12 transition-transform duration-500">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-[10px] font-bold text-amber-500/70 uppercase tracking-[0.3em]">Intelligence</span>
            </div>
            <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-amber-500/50 animate-pulse delay-75" />
                <div className="w-1 h-1 rounded-full bg-amber-500/30 animate-pulse delay-150" />
            </div>
        </div>

        <h3 className="text-5xl font-serif font-bold mb-2 tracking-tight group-hover:text-amber-500 transition-colors">
          {data.trending_flavor}
        </h3>
        <p className="text-stone-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Zap size={12} /> Market Leader in {data.total_analyzed} Beans
        </p>
      </div>

      <div className="relative z-10 mt-6">
        {data.champion_bean && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group/card">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0 group-hover/card:scale-110 transition-transform">
                <Award size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[8px] text-stone-500 font-bold uppercase tracking-widest mb-1">Top Recommendation</p>
                <p className="font-bold leading-tight text-white truncate text-sm">{data.champion_bean.title}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-mono font-bold bg-amber-500 text-stone-900 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                        {data.champion_bean.rating}
                    </span>
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest truncate">{data.champion_bean.roaster}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { Search, List, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function DashboardHero() {
  return (
    <div className="bg-[#1F1815] text-[#FDFBF7] p-8 rounded-lg mb-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="relative z-10">
            <h2 className="text-2xl font-serif font-bold mb-2">Find your perfect coffee.</h2>
            <p className="text-[#FDFBF7]/80 max-w-md">
                Use our AI-powered tools to discover beans by flavor, math, or roaster vibe.
            </p>
        </div>
        <div className="flex flex-wrap gap-4 relative z-10">
            <Link 
                href="/reviews" 
                className="bg-white/5 text-white border border-white/10 px-6 py-3 rounded-md font-bold hover:bg-white/10 transition-colors flex items-center gap-2 shrink-0"
            >
                <List size={20} />
                Browse Database
            </Link>
            <Link 
                href="/alchemist" 
                className="bg-amber-500 text-[#1F1815] px-6 py-3 rounded-md font-bold hover:bg-amber-400 transition-colors flex items-center gap-2 shrink-0"
            >
                <Sparkles size={20} />
                Alchemist Lab
            </Link>
            <Link 
                href="/explorer" 
                className="bg-white text-[#1F1815] px-6 py-3 rounded-md font-bold hover:bg-stone-200 transition-colors flex items-center gap-2 shrink-0"
            >
                <Search size={20} />
                Flavor Explorer
            </Link>
        </div>
    </div>
  );
}

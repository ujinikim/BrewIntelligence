import { getReviews } from '@/utils/supabase-data';
import { ReviewsGrid } from '@/components/reviews-grid';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Home, Database, Sparkles } from 'lucide-react';
import { DashboardShell } from '@/components/dashboard-shell';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page) || 1;
  const limit = 12;
  const { data, count } = await getReviews(page, limit);
  
  const totalPages = Math.ceil(count / limit);

  return (
    <DashboardShell>
      <div className="pb-20">
        {/* Hero Header */}
        <div className="relative mb-16 pt-12">
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="max-w-2xl">
                    <div className="flex items-center gap-2 mb-6 text-stone-400 text-xs font-bold uppercase tracking-[0.3em]">
                        <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                            <Home size={12} /> Home
                        </Link>
                        <span className="opacity-30">/</span>
                        <span className="text-stone-900">Archive</span>
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                            <Database size={24} />
                        </div>
                        <h1 className="text-6xl font-serif font-bold text-stone-900 tracking-tight">The Library</h1>
                    </div>
                    <p className="text-stone-500 text-xl font-light leading-relaxed">
                        Access our curated collection of <span className="text-stone-900 font-medium">{count} expert evaluations</span>. Each bean is scientifically scored across five dimensions of flavor.
                    </p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-stone-200/50 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Catalog Status</p>
                        <p className="text-sm font-bold text-stone-900">Live Database Sync</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center text-green-600 relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping [animation-duration:3s]" />
                        <Sparkles size={20} />
                    </div>
                </div>
            </div>
        </div>

        <div className="mt-12">
            <ReviewsGrid data={data} />

            {/* Premium Pagination */}
            <div className="flex justify-center items-center gap-8 mt-24">
                {page > 1 ? (
                    <Link 
                        href={`/reviews?page=${page - 1}`}
                        className="group flex items-center gap-3 px-8 py-4 bg-white border border-stone-200 rounded-2xl font-bold uppercase tracking-widest text-xs hover:border-primary hover:text-primary hover:shadow-xl transition-all active:scale-95"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                        Previous
                    </Link>
                ) : (
                    <button disabled className="flex items-center gap-3 px-8 py-4 bg-stone-50 text-stone-300 border border-transparent rounded-2xl font-bold uppercase tracking-widest text-xs cursor-not-allowed">
                        <ChevronLeft size={16} /> Previous
                    </button>
                )}

                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">Vault Page</span>
                    <span className="font-serif text-2xl font-bold text-stone-900">
                        {page} <span className="text-stone-300 font-light mx-1">/</span> {totalPages}
                    </span>
                </div>

                {page < totalPages ? (
                    <Link 
                        href={`/reviews?page=${page + 1}`}
                        className="group flex items-center gap-3 px-8 py-4 bg-stone-900 text-white border border-stone-900 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-stone-800 hover:shadow-xl transition-all active:scale-95"
                    >
                        Next 
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                ) : (
                    <button disabled className="flex items-center gap-3 px-8 py-4 bg-stone-50 text-stone-300 border border-transparent rounded-2xl font-bold uppercase tracking-widest text-xs cursor-not-allowed">
                         Next <ChevronRight size={16} />
                    </button>
                )}
            </div>
        </div>
      </div>
    </DashboardShell>
  );
}

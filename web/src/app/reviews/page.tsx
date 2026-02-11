import { getReviews, getFilterMeta } from '@/utils/supabase-data';
import { ReviewsGrid } from '@/components/reviews/reviews-grid';
import { PaginationControls } from '@/components/reviews/pagination-controls';
import { FilterSidebar } from '@/components/reviews/filter-sidebar';
import Link from 'next/link';
import { Home, Database, Sparkles } from 'lucide-react';
import { DashboardShell } from '@/components/shared/dashboard-shell';

export const dynamic = 'force-dynamic';

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ 
    page?: string; 
    limit?: string;
    search?: string;
    minRating?: string;
    country?: string;
    roast?: string;
    year?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 12;
  
  // Fetch data and metadata in parallel
  const [reviewsData, filterMeta] = await Promise.all([
    getReviews({
      page,
      limit,
      search: params.search,
      minRating: params.minRating ? Number(params.minRating) : undefined,
      country: params.country,
      roast: params.roast,
      year: params.year ? Number(params.year) : undefined,
    }),
    getFilterMeta()
  ]);

  const { data, count } = reviewsData;
  
  return (
    <DashboardShell>
      <div className="pb-20">
        {/* Hero Header */}
        <div className="relative mb-12 pt-12">
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
                        Access our curated collection of <span className="text-stone-900 font-medium">{count.toLocaleString()} expert evaluations</span>. Each bean is scientifically scored across five dimensions of flavor.
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

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 mt-12">
            {/* Sidebar Filters */}
            <aside>
                <FilterSidebar 
                    countries={filterMeta.countries} 
                    years={filterMeta.years} 
                />
            </aside>

            {/* Results */}
            <div className="flex-grow min-w-0 space-y-12">
                <ReviewsGrid data={data} />
                <PaginationControls count={count} />
            </div>
        </div>
      </div>
    </DashboardShell>
  );
}

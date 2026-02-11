'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  count: number;
}

export function PaginationControls({ count }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 12;
  const totalPages = Math.ceil(count / limit);

  // Local state for the input box
  const [pageInput, setPageInput] = useState(page.toString());

  // Sync input with valid page from URL
  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  const createPageURL = (pageNumber: number | string, newLimit?: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    if (newLimit) {
      params.set('limit', newLimit.toString());
    }
    return `${pathname}?${params.toString()}`;
  };

  const handlePageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage = Math.max(1, Math.min(totalPages, parseInt(pageInput) || 1));
    router.push(createPageURL(newPage));
  };

  const handleLimitChange = (newLimit: string) => {
    // When changing limit, reset to page 1 to avoid out of bounds
    router.push(createPageURL(1, newLimit));
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-12 bg-white p-4 rounded-2xl border border-stone-200/60 shadow-sm">
      {/* Left: Items per page */}
      <div className="flex items-center gap-3 text-sm">
        <span className="text-stone-500 font-medium">Show</span>
        <select
          value={limit}
          onChange={(e) => handleLimitChange(e.target.value)}
          className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-stone-900 font-bold focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer text-xs"
        >
          <option value="12">12</option>
          <option value="24">24</option>
          <option value="48">48</option>
          <option value="96">96</option>
        </select>
        <span className="text-stone-400 text-xs">rows</span>
      </div>

      {/* Center: Page Navigation */}
      <div className="flex items-center gap-2">
        <Link 
          href={createPageURL(Math.max(1, page - 1))}
          className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
            page > 1 
              ? 'bg-white border-stone-200 text-stone-600 hover:border-primary hover:text-primary hover:shadow-sm' 
              : 'bg-stone-50 border-stone-100 text-stone-300 pointer-events-none'
          }`}
          aria-disabled={page <= 1}
        >
          <ChevronLeft size={16} />
        </Link>

        <div className="flex items-center gap-1">
          {page > 3 && (
            <>
              <Link 
                href={createPageURL(1)}
                className="w-9 h-9 flex items-center justify-center text-xs font-bold text-stone-500 hover:text-primary hover:bg-stone-50 rounded-lg transition-all"
              >
                1
              </Link>
              {page > 4 && <span className="text-stone-300 px-1 text-xs">...</span>}
            </>
          )}

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = page - 2 + i;
            }
            
            if (pageNum < 1 || pageNum > totalPages) return null;
            if (page > 3 && pageNum === 1) return null;
            if (page < totalPages - 2 && pageNum === totalPages) return null;

            return (
              <Link
                key={pageNum}
                href={createPageURL(pageNum)}
                className={`w-9 h-9 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
                  pageNum === page
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'text-stone-500 hover:text-primary hover:bg-stone-50'
                }`}
              >
                {pageNum}
              </Link>
            );
          })}

          {page < totalPages - 2 && (
            <>
              {page < totalPages - 3 && <span className="text-stone-300 px-1 text-xs">...</span>}
              <Link 
                href={createPageURL(totalPages)}
                className="w-9 h-9 flex items-center justify-center text-xs font-bold text-stone-500 hover:text-primary hover:bg-stone-50 rounded-lg transition-all"
              >
                {totalPages}
              </Link>
            </>
          )}
        </div>

        <Link 
          href={createPageURL(Math.min(totalPages, page + 1))}
          className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
            page < totalPages
              ? 'bg-white border-stone-200 text-stone-600 hover:border-primary hover:text-primary hover:shadow-sm' 
              : 'bg-stone-50 border-stone-100 text-stone-300 pointer-events-none'
          }`}
          aria-disabled={page >= totalPages}
        >
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Right: Go to page */}
      <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
        <span className="text-xs font-medium text-stone-500">Go to</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          className="w-14 px-2 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-center text-xs font-bold text-stone-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
        />
        <span className="text-xs text-stone-400">/ {totalPages}</span>
        <button
          type="submit"
          className="ml-1 px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-200 hover:text-stone-900 transition-all"
        >
          Go
        </button>
      </form>
    </div>
  );
}

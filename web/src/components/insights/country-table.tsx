'use client';

import { useState } from 'react';
import { CountryStat } from '@/utils/insights-data';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';

type SortKey = 'country' | 'count' | 'avgRating' | 'avgPrice' | 'topScore';
type SortDir = 'asc' | 'desc';

export function CountryTable({ data }: { data: CountryStat[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('count');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showAll, setShowAll] = useState(false);

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const displayed = showAll ? sorted : sorted.slice(0, 10);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <ArrowUpDown size={12} className="text-stone-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-primary" />
      : <ChevronDown size={12} className="text-primary" />;
  };

  const columns: { key: SortKey; label: string; align: string }[] = [
    { key: 'country', label: 'Country', align: 'text-left' },
    { key: 'count', label: 'Reviews', align: 'text-right' },
    { key: 'avgRating', label: 'Avg Rating', align: 'text-right' },
    { key: 'avgPrice', label: 'Avg $/oz', align: 'text-right' },
    { key: 'topScore', label: 'Top Score', align: 'text-right' },
  ];

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500/30 via-transparent to-cyan-500/30" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
            🌍 Country Deep Dive
          </h3>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
            {data.length} origins with 3+ reviews — click headers to sort
          </p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-stone-200">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={cn(
                    "py-3 px-4 text-[10px] font-black uppercase tracking-[0.15em] text-stone-400 cursor-pointer select-none hover:text-stone-600 transition-colors",
                    col.align
                  )}
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    <SortIcon k={col.key} />
                  </span>
                </th>
              ))}
              <th className="py-3 px-4 text-[10px] font-black uppercase tracking-[0.15em] text-stone-400 text-center">
                Top Roast
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((row, i) => (
              <tr
                key={row.country}
                className={cn(
                  "border-b border-stone-100 transition-colors hover:bg-stone-50/80",
                  i < 3 && sortKey === 'count' && 'bg-amber-50/30'
                )}
              >
                <td className="py-3.5 px-4">
                  <span className="font-bold text-sm text-stone-800">{row.country}</span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-sm font-bold text-stone-600">{row.count.toLocaleString()}</span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className={cn(
                    "text-sm font-bold",
                    row.avgRating >= 90 ? "text-amber-600" : "text-stone-600"
                  )}>
                    {row.avgRating}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-sm text-stone-500">
                    {row.avgPrice ? `$${row.avgPrice.toFixed(2)}` : '—'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className={cn(
                    "text-sm font-bold",
                    row.topScore >= 95 ? "text-amber-600" : "text-stone-600"
                  )}>
                    {row.topScore}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                    row.topRoast === 'Light' && "bg-amber-100 text-amber-700",
                    row.topRoast === 'Medium' && "bg-orange-100 text-orange-700",
                    row.topRoast === 'Dark' && "bg-stone-200 text-stone-700",
                    !['Light', 'Medium', 'Dark'].includes(row.topRoast) && "bg-stone-100 text-stone-500"
                  )}>
                    {row.topRoast}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > 10 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-bold text-primary hover:underline transition-colors"
          >
            {showAll ? `Show Top 10` : `Show All ${data.length} Countries`}
          </button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          <span className="font-bold text-amber-600">{data[0]?.country}</span> dominates the
          database with {data[0]?.count.toLocaleString()} reviews, while origins like{' '}
          {[...data].sort((a, b) => b.avgRating - a.avgRating)[0]?.country} achieve the highest average scores.
        </p>
      </div>
    </div >
  );
}

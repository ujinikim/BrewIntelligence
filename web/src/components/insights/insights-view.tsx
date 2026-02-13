'use client';

import { InsightsData } from '@/utils/insights-data';
import { RatingDistribution } from './rating-distribution';
import { RatingsTimeline } from './ratings-timeline';
import { TopRoasters } from './top-roasters';
import { FlavorRadar } from './flavor-radar';
import { RoastComparison } from './roast-comparison';
import { CountryTable } from './country-table';
import { PriceTiers } from './price-tiers';
import { TrendingUp, Award, Lightbulb, DollarSign, Home, Telescope } from 'lucide-react';

export function InsightsView({ data }: { data: InsightsData }) {
  const { highlights } = data;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="relative mb-12 pt-12">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-6 text-stone-400 text-xs font-bold uppercase tracking-[0.3em]">
            <a href="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Home size={12} /> Home
            </a>
            <span className="opacity-30">/</span>
            <span className="text-stone-900">Insights</span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <Telescope size={24} />
            </div>
            <h1 className="text-5xl font-serif font-bold text-[#1F1815] tracking-tight">
              Coffee Insights
            </h1>
          </div>
          <p className="text-stone-500 text-lg font-light leading-relaxed">
            Data-driven stories from{' '}
            <span className="font-bold text-amber-600">
              {data.totalReviews.toLocaleString()}
            </span>{' '}
            expert coffee reviews.
          </p>
        </div>
      </div>

      {/* Highlight Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.highestRatedBean && (
          <HighlightCard
            icon={<Award size={20} />}
            label="Highest Rated"
            value={`${highlights.highestRatedBean.rating}`}
            detail={highlights.highestRatedBean.title}
            subDetail={highlights.highestRatedBean.roaster}
            accentColor="text-amber-500"
          />
        )}
        {highlights.mostReviewedCountry && (
          <HighlightCard
            icon={<TrendingUp size={20} />}
            label="Most Reviewed Origin"
            value={highlights.mostReviewedCountry.country}
            detail={`${highlights.mostReviewedCountry.count.toLocaleString()} reviews`}
            accentColor="text-emerald-500"
          />
        )}
        {highlights.mostExpensiveAvgCountry && (
          <HighlightCard
            icon={<DollarSign size={20} />}
            label="Priciest Origin"
            value={highlights.mostExpensiveAvgCountry.country}
            detail={`$${highlights.mostExpensiveAvgCountry.avgPrice}/oz avg`}
            accentColor="text-violet-500"
          />
        )}
        {highlights.cheapestHighQuality && (
          <HighlightCard
            icon={<Lightbulb size={20} />}
            label="Best Value (90+)"
            value={`${highlights.cheapestHighQuality.rating}`}
            detail={highlights.cheapestHighQuality.title}
            subDetail={highlights.cheapestHighQuality.price}
            accentColor="text-cyan-500"
          />
        )}
      </section>

      {/* Charts Grid */}
      <section className="space-y-8">
        {/* Row 1: Rating Distribution + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RatingDistribution data={data.ratingDistribution} />
          <RatingsTimeline data={data.yearlyTrends} />
        </div>

        {/* Row 2: Flavor Radar + Roast Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FlavorRadar data={data.flavorProfiles} />
          <RoastComparison data={data.roastComparison} />
        </div>

        {/* Row 3: Top Roasters (full width) */}
        <TopRoasters data={data.topRoasters} />

        {/* Row 4: Price Tiers (full width) */}
        <PriceTiers data={data.priceTiers} />

        {/* Row 5: Country Table (full width) */}
        <CountryTable data={data.countryStats} />
      </section>

      {/* Attribution */}
      <section className="text-center py-8 border-t border-stone-200/50">
        <p className="text-xs text-stone-400 uppercase font-bold tracking-widest">
          Analysis powered by data from{' '}
          <a href="https://www.coffeereview.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary transition-colors">
            CoffeeReview.com
          </a>
        </p>
      </section>
    </div>
  );
}

// ─── Highlight Card ─────────────────────────────────────────────────────────
function HighlightCard({
  icon,
  label,
  value,
  detail,
  subDetail,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  subDetail?: string;
  accentColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/50 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center gap-2 mb-3">
        <span className={`${accentColor} transition-colors`}>{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-stone-400">{label}</span>
      </div>
      <p className="text-2xl font-serif font-bold text-stone-900 tracking-tight group-hover:text-primary transition-colors">
        {value}
      </p>
      <p className="text-sm text-stone-500 mt-1 line-clamp-1">{detail}</p>
      {subDetail && (
        <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{subDetail}</p>
      )}
    </div>
  );
}

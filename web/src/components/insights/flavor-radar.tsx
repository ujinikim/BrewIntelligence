'use client';

import { FlavorProfile } from '@/utils/insights-data';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend
} from 'recharts';

const COLORS: Record<string, string> = {
  Overall: '#1c1917',
  Light: '#f59e0b',
  Medium: '#d97706',
  Dark: '#78350f',
};

export function FlavorRadar({ data }: { data: FlavorProfile[] }) {
  // Transform for Recharts radar format
  const dimensions = ['aroma', 'acidity', 'body', 'flavor', 'aftertaste'] as const;
  const chartData = dimensions.map(dim => {
    const point: Record<string, string | number> = {
      dimension: dim.charAt(0).toUpperCase() + dim.slice(1),
    };
    data.forEach(profile => {
      point[profile.label] = profile[dim];
    });
    return point;
  });

  return (
    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-stone-200/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500/30 via-transparent to-rose-500/30" />

      <div className="mb-8">
        <h3 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
          Flavor Profile Radar
        </h3>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
          Average cupping scores by roast level
        </p>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e7e5e4" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 13, fill: '#44403c', fontWeight: '700' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[6, 10]}
              tick={{ fontSize: 10, fill: '#a8a29e' }}
              tickCount={5}
            />
            {data.map((profile) => (
              <Radar
                key={profile.label}
                name={profile.label}
                dataKey={profile.label}
                stroke={COLORS[profile.label] || '#a8a29e'}
                fill={COLORS[profile.label] || '#a8a29e'}
                fillOpacity={profile.label === 'Overall' ? 0.1 : 0.05}
                strokeWidth={profile.label === 'Overall' ? 3 : 2}
                strokeDasharray={profile.label === 'Overall' ? '' : '4 4'}
              />
            ))}
            <Legend
              wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-500">
          Across all roast levels, <span className="font-bold text-amber-600">Aroma</span> consistently
          scores highest while <span className="font-bold">Body</span> shows the most variation between
          light and dark roasts.
        </p>
      </div>
    </div>
  );
}

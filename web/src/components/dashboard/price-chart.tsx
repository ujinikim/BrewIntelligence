'use client';

import { CoffeeReview } from '@/utils/supabase-data';
import { parsePrice, getValueScore } from '@/utils/analytics';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export function PriceChart({ data }: { data: CoffeeReview[] }) {
  const chartData = data
    .map(d => {
      const p = parsePrice(d.price);
      return {
        x: p,
        y: d.rating || 0,
        title: d.title,
        origin: d.origin || d.roaster_location,
        value_score: getValueScore(d)
      };
    })
    .filter(d => d.x > 0 && d.x < 300 && d.y > 0);

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary/20 via-transparent to-primary/20" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
            <h3 className="text-2xl font-serif font-bold text-[#1F1815] tracking-tight">Price vs. Quality Matrix</h3>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest mt-1">
              {chartData.length} beans with listed pricing analyzed
            </p>
        </div>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-stone-400">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span> High Value</span>
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-stone-900"></span> Standard</span>
        </div>
      </div>
      
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#f1f1f1" vertical={false} />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Price" 
              unit="$" 
              tick={{ fontSize: 10, fill: '#a8a29e', fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Market Price', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 'bold', fill: '#d1d5db' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Rating" 
              domain={[70, 100]} 
              tick={{ fontSize: 10, fill: '#a8a29e', fontWeight: 'bold' }}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Expert Score', angle: -90, position: 'insideLeft', offset: 10, fontSize: 10, fontWeight: 'bold', fill: '#d1d5db' }}
            />
            <Tooltip 
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-stone-900 text-white p-5 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md z-50 min-w-[200px] animate-in zoom-in-95 duration-200">
                      <p className="font-serif font-bold text-lg mb-1 leading-tight">{data.title}</p>
                      <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-4">{data.origin}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex flex-col">
                            <span className="text-[8px] uppercase text-stone-500 font-bold">Price</span>
                            <span className="font-bold">${data.x}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] uppercase text-stone-500 font-bold">Score</span>
                            <span className="text-amber-500 font-bold text-lg leading-none">{data.y}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Coffee" data={chartData}>
              {chartData.map((entry, index) => (
                <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value_score > 5 ? '#d97706' : '#1F1815'}
                    className="cursor-pointer"
                    strokeWidth={entry.value_score > 5 ? 2 : 0}
                    stroke="rgba(245,158,11,0.3)"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

'use client';

import { Coffee } from '@/utils/data';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ReferenceArea
} from 'recharts';

export function PriceChart({ data }: { data: Coffee[] }) {
  // Filter outliers for better visualization (e.g. price < $50)
  const chartData = data
    .filter(d => d['100g_USD'] < 60 && d['100g_USD'] > 0)
    .map(d => ({
      x: d['100g_USD'],
      y: d.rating,
      name: d.name,
      origin: d.origin,
      value_score: d.value_score // Pass value score for coloring
    }));

  return (
    <div className="bg-white p-8 rounded-lg border border-[#e5e5e5] shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-serif font-bold text-[#1F1815]">Price vs. Quality Analysis</h3>
        {/* Legend */}
        <div className="flex flex-col items-end gap-2">
            <div className="flex gap-4 text-xs font-medium text-[#1F1815]/70">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#d97706]"></span> Good Value</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1F1815]"></span> Average</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#78716c]"></span> Overpriced</span>
            </div>
            <div className="flex gap-4 text-[10px] text-[#1F1815]/50 uppercase tracking-wider">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#dcfce7]"></span> Budget (&lt;$6)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#fef3c7]"></span> Specialist ($6-15)</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-[#f3e8ff]"></span> Luxury (&gt;$15)</span>
            </div>
        </div>
      </div>
      
      <div className="h-[550px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            
            {/* Price Zones Backgrounds - Increased opacity for better visibility */}
            {/* Budget: $0 - $6 (Light Green) */}
            <ReferenceArea x1={0} x2={6} y1={0} y2={200} ifOverflow="hidden" fill="#dcfce7" fillOpacity={0.4} strokeOpacity={0} />
            {/* Specialist: $6 - $15 (Warm Cream/Amber) */}
            <ReferenceArea x1={6} x2={15} y1={0} y2={200} ifOverflow="hidden" fill="#fef3c7" fillOpacity={0.4} strokeOpacity={0} />
            {/* Luxury: $15+ (Soft Purple) */}
            <ReferenceArea x1={15} x2={1000} y1={0} y2={200} ifOverflow="hidden" fill="#f3e8ff" fillOpacity={0.5} strokeOpacity={0} />

            <XAxis 
                type="number" 
                dataKey="x" 
                name="Price (USD/100g)" 
                unit="$" 
                domain={[0, 'auto']} // Start at 0 to show full zones
                stroke="#a8a29e"
                tick={{fill: '#1F1815', fontSize: 12}}
                tickLine={false}
                axisLine={false}
            />
            <YAxis 
                type="number" 
                dataKey="y" 
                name="Rating" 
                domain={[80, 100]} 
                stroke="#a8a29e"
                tick={{fill: '#1F1815', fontSize: 12}}
                tickLine={false}
                axisLine={false}
            />
            <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                        const data = payload[0].payload as any;
                        const score = data.value_score || 0;
                        
                        // Determine Zone Label - Client side only check to be safe
                        let zone = "Specialist";
                        if (data.x < 6) zone = "Daily Driver (Budget)";
                        else if (data.x > 15) zone = "Luxury";

                        return (
                            <div className="bg-[#1F1815] p-4 shadow-xl text-white rounded-md text-sm">
                                <p className="font-serif font-bold text-lg mb-1">{data.name}</p>
                                <p className="text-white/80 border-b border-white/20 pb-2 mb-2">{data.origin}</p>
                                <div className="flex justify-between gap-6">
                                    <span className="font-medium">${data.x.toFixed(2)}</span>
                                    <span className="font-medium text-amber-200">{data.y} Rating</span>
                                </div>
                                <div className="mt-2 text-xs opacity-80 flex flex-col gap-1">
                                    <span>Zone: {zone}</span>
                                    <span>Value Score: {score > 0 ? '+' : ''}{score}</span>
                                </div>
                            </div>
                        );
                    }
                    return null;
                }}
            />
            {/* 
              Performance Optimization: 
              Instead of rendering thousands of <Cell> components (which kills React performance),
              we split the data into 3 distinct series. This allows Recharts to optimize rendering.
            */}
            <Scatter 
                name="Overpriced" 
                data={chartData.filter(d => d.value_score < -2.0)} 
                fill="#78716c" 
                fillOpacity={0.7} 
            />
            <Scatter 
                name="Average" 
                data={chartData.filter(d => d.value_score >= -2.0 && d.value_score <= 2.0)} 
                fill="#1F1815" 
                fillOpacity={0.7} 
            />
            <Scatter 
                name="Good Value" 
                data={chartData.filter(d => d.value_score > 2.0)} 
                fill="#d97706" 
                fillOpacity={0.7} 
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

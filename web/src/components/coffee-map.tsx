'use client';

import React, { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { scaleQuantize } from 'd3-scale';
import { Coffee } from '@/utils/data';
import { Tooltip as ReactTooltip } from 'react-tooltip';

const GEO_URL = "/world-110m.json";

// Mapping of common coffee countries to Map Names / ISO codes
// We use simple string matching against the bean Name and Origin text.
const COUNTRY_MAPPINGS: Record<string, string[]> = {
  "Ethiopia": ["Ethiopia"],
  "Colombia": ["Colombia"],
  "Kenya": ["Kenya"],
  "Guatemala": ["Guatemala"],
  "Brazil": ["Brazil"],
  "Costa Rica": ["Costa Rica"],
  "Panama": ["Panama"],
  "Indonesia": ["Indonesia", "Sumatra", "Java", "Sulawesi"],
  "Honduras": ["Honduras"],
  "Mexico": ["Mexico"],
  "Peru": ["Peru"],
  "Rwanda": ["Rwanda"],
  "Burundi": ["Burundi"],
  "Vietnam": ["Vietnam"],
  "El Salvador": ["El Salvador"],
  "Nicaragua": ["Nicaragua"],
  "Ecuador": ["Ecuador"],
  "Tanzania": ["Tanzania"],
  "Uganda": ["Uganda"],
  "Yemen": ["Yemen"],
  "Jamaica": ["Jamaica"],
  "Bolivia": ["Bolivia"],
  "Papua New Guinea": ["Papua New Guinea"],
  "United States": ["Hawaii", "Kona"], // Only if specifically coffee origin
};

export function CoffeeMap({ data }: { data: Coffee[] }) {
  const [content, setContent] = useState("");

  const countryStats = useMemo(() => {
    const stats: Record<string, { count: number; totalRating: number; name: string }> = {};

    data.forEach(bean => {
      // Determine Origin Country
      let detectedCountry: string | null = null;
      const searchText = `${bean.name} ${bean.origin}`.toLowerCase();

      for (const [country, keywords] of Object.entries(COUNTRY_MAPPINGS)) {
        if (keywords.some(k => searchText.includes(k.toLowerCase()))) {
          detectedCountry = country;
          break; 
        }
      }

      if (detectedCountry) {
        if (!stats[detectedCountry]) {
          stats[detectedCountry] = { count: 0, totalRating: 0, name: detectedCountry };
        }
        stats[detectedCountry].count += 1;
        stats[detectedCountry].totalRating += bean.rating;
      }
    });

    return stats;
  }, [data]);

  const colorScale = scaleQuantize<string>()
    .domain([0, 50]) // Cap at 50 beans for color intensity
    .range([
      "#ffedd5",
      "#fed7aa",
      "#fdba74",
      "#fb923c",
      "#f97316",
      "#ea580c",
    ]);

  return (
    <div className="bg-white p-6 rounded-lg border border-[#e5e5e5] shadow-sm mt-8">
      <div className="mb-4">
         <h3 className="text-xl font-serif font-bold text-[#1F1815]">Origin Map</h3>
         <p className="text-sm text-[#1F1815]/60">Where the best beans are grown. Darker orange = More beans analyzed.</p>
      </div>
      
      <div className="w-full h-[500px] lg:h-[700px] border border-[#f0f0f0] rounded-md overflow-hidden bg-[#F6F5F340]">
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 150 }}>
          <ZoomableGroup center={[0, 0]}>
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  // Handle name mismatches if necessary (e.g. Map says "United Republic of Tanzania")
                  // For now, we rely on partial matches or standard names if they align.
                  // React-Simple-Maps world-110m uses standard names.
                  
                  // Try direct match or aliases
                  let stat = countryStats[countryName];
                  if (!stat) {
                      // Fallback: Check if any key in stats is part of the geo name
                      // e.g. "Tanzania" in "United Republic of Tanzania"
                      const key = Object.keys(countryStats).find(k => geo.properties.name.includes(k));
                      if (key) stat = countryStats[key];
                  }

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={stat ? colorScale(stat.count) : "#EEE"}
                      stroke="#FFF"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: stat ? "#1F1815" : "#EEE", outline: "none", cursor: stat ? "pointer" : "default" },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={() => {
                        if (stat) {
                            const avg = (stat.totalRating / stat.count).toFixed(1);
                            setContent(`<strong>${stat.name}</strong><br/>${stat.count} Beans<br/>Avg Rating: ${avg}`);
                        } else {
                            setContent(`${countryName}`);
                        }
                      }}
                      onMouseLeave={() => {
                        setContent("");
                      }}
                      data-tooltip-id="my-tooltip"
                      data-tooltip-html={content}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        <ReactTooltip id="my-tooltip" style={{ backgroundColor: "#1F1815", color: "#FFF", borderRadius: "8px" }} />
      </div>
    </div>
  );
}

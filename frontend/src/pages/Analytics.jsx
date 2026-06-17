import React, { useState, useMemo } from "react";
import { MOCK_HEATMAP, MOCK_HOTSPOTS } from "../data/mockData";
import { Download, MapPin, AlertTriangle, Map, ChevronDown, Terminal } from "lucide-react";

export const Analytics = () => {
  const [selectedArea, setSelectedArea] = useState("Entire Bangalore");

  const areas = [
    "Entire Bangalore",
    "Silk Board",
    "Koramangala",
    "Outer Ring Road",
    "MG Road",
    "Indiranagar",
    "Whitefield"
  ];

  const areaMultipliers = {
    "Entire Bangalore": 1.0,
    "Silk Board": 0.5,
    "Koramangala": 0.4,
    "Outer Ring Road": 0.45,
    "MG Road": 0.25,
    "Indiranagar": 0.2,
    "Whitefield": 0.3
  };

  const mapMarkers = [
    { id: "silk", name: "Silk Board", cx: 220, cy: 100, count: 245, color: "#ef4444" },
    { id: "kora", name: "Koramangala", cx: 220, cy: 160, count: 182, color: "#f59e0b" },
    { id: "orr", name: "Outer Ring Road", cx: 40, cy: 100, count: 168, color: "#f59e0b" },
    { id: "mg", name: "MG Road", cx: 40, cy: 160, count: 94, color: "#3b82f6" },
    { id: "indira", name: "Indiranagar", cx: 120, cy: 60, count: 88, color: "#3b82f6" },
    { id: "white", name: "Whitefield", cx: 320, cy: 60, count: 75, color: "#10b981" }
  ];

  // Dynamic Heatmap based on area selection
  const filteredHeatmap = useMemo(() => {
    const mult = areaMultipliers[selectedArea] || 1.0;
    if (mult === 1.0) return MOCK_HEATMAP;

    return MOCK_HEATMAP.map((item) => ({
      day: item.day,
      "00-04": Math.round(item["00-04"] * mult),
      "04-08": Math.round(item["04-08"] * mult),
      "08-12": Math.round(item["08-12"] * mult),
      "12-16": Math.round(item["12-16"] * mult),
      "16-20": Math.round(item["16-20"] * mult),
      "20-24": Math.round(item["20-24"] * mult)
    }));
  }, [selectedArea]);

  // Dynamic Hotspot list based on area selection
  const filteredHotspots = useMemo(() => {
    if (selectedArea === "Entire Bangalore") return MOCK_HOTSPOTS;
    return MOCK_HOTSPOTS.filter(
      (hot) =>
        hot.name.toLowerCase().includes(selectedArea.toLowerCase()) ||
        (selectedArea === "Outer Ring Road" && hot.name.includes("ORR"))
    );
  }, [selectedArea]);

  // Heatmap helper to map intensity to color codes
  const getHeatmapColor = (val) => {
    if (val > 80) return "bg-[#ef4444] text-white";
    if (val > 60) return "bg-[#ef4444]/60 text-white";
    if (val > 40) return "bg-[#f59e0b] text-[#0B1220]";
    if (val > 20) return "bg-[#f59e0b]/40 text-[#F9FAFB]";
    return "bg-[#1F2937]/50 text-[#9CA3AF]";
  };

  const handleExport = (format) => {
    alert(`Generating audit logs for ${selectedArea} in ${format.toUpperCase()} format.`);
  };

  return (
    <div className="space-y-3 font-mono">
      
      {/* Top Banner Actions & Area Selector */}
      <div className="panel p-3 border-[#1F2937] flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">REPORTS & AUDIT EXPORTS</h3>
          <p className="text-[10px] text-[#9CA3AF]">Generate CSV/PDF incident logs for submission archives</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Area Selector Dropdown */}
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-1.5 bg-[#0B1220] border border-[#1F2937] rounded-[6px] text-xs font-bold focus:outline-none cursor-pointer text-[#F9FAFB]"
            >
              {areas.map((a) => (
                <option key={a} value={a}>
                  REGION: {a.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-2 text-[#9CA3AF] pointer-events-none" />
          </div>

          <button
            onClick={() => handleExport("csv")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[6px] bg-[#1F2937] hover:bg-[#1F2937]/80 text-[#D1D5DB] border border-[#2A374A] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            CSV LOG
          </button>
          
          <button
            onClick={() => handleExport("pdf")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[6px] bg-[#3b82f6] hover:bg-[#3b82f6]/80 text-white transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            PDF REPORT
          </button>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="panel p-3 border-[#1F2937] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">
              INCIDENT HEATMAP MATRIX ({selectedArea.toUpperCase()})
            </h3>
            <p className="text-[10px] text-[#9CA3AF]">Cross-reference of hourly volume indices against weekday schedules</p>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20 rounded-[4px] font-bold">
            MULTIPLIER: {areaMultipliers[selectedArea]}x
          </span>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pt-1">
          <div className="min-w-[600px] space-y-1">
            <div className="grid grid-cols-7 text-center text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
              <span className="col-span-1 text-left pl-2">DAY</span>
              <span>00:00-04:00</span>
              <span>04:00-08:00</span>
              <span>08:00-12:00</span>
              <span>12:00-16:00</span>
              <span>16:00-20:00</span>
              <span>20:00-24:00</span>
            </div>
            
            {filteredHeatmap.map((item) => (
              <div key={item.day} className="grid grid-cols-7 items-center text-center text-xs font-mono">
                <span className="col-span-1 text-left font-sans font-bold text-[#9CA3AF] pl-2 uppercase">
                  {item.day}
                </span>
                <span className={`py-1.5 rounded-[4px] mx-0.5 font-bold transition-colors ${getHeatmapColor(item["00-04"])}`}>
                  {item["00-04"]}
                </span>
                <span className={`py-1.5 rounded-[4px] mx-0.5 font-bold transition-colors ${getHeatmapColor(item["04-08"])}`}>
                  {item["04-08"]}
                </span>
                <span className={`py-1.5 rounded-[4px] mx-0.5 font-bold transition-colors ${getHeatmapColor(item["08-12"])}`}>
                  {item["08-12"]}
                </span>
                <span className={`py-1.5 rounded-[4px] mx-0.5 font-bold transition-colors ${getHeatmapColor(item["12-16"])}`}>
                  {item["12-16"]}
                </span>
                <span className={`py-1.5 rounded-[4px] mx-0.5 font-bold transition-colors ${getHeatmapColor(item["16-20"])}`}>
                  {item["16-20"]}
                </span>
                <span className={`py-1.5 rounded-[4px] mx-0.5 font-bold transition-colors ${getHeatmapColor(item["20-24"])}`}>
                  {item["20-24"]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-end items-center gap-3 text-[9px] text-[#9CA3AF] pt-1 font-bold uppercase">
          <span>LEGEND:</span>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#1F2937] border border-[#2A374A]"></span>
            <span>LOW (&lt;20)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#f59e0b]/40"></span>
            <span>MODERATE (20-40)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#f59e0b]"></span>
            <span>HIGH (40-60)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-[2px] bg-[#ef4444]"></span>
            <span>CRITICAL (&gt;60)</span>
          </div>
        </div>
      </div>

      {/* Map Hotspots and offending areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        
        {/* Hotspot Visual Table */}
        <div className="panel p-3 border-[#1F2937] space-y-3">
          <div>
            <h3 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">OFFENDING SECTORS CLASSIFICATION</h3>
            <p className="text-[10px] text-[#9CA3AF]">Intersections registry grouped by density indices</p>
          </div>

          <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
            {filteredHotspots.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#9CA3AF]">
                NO DETECTED HOTSPOTS IN SELECTED AREA
              </div>
            ) : (
              filteredHotspots.map((hot) => (
                <div
                  key={hot.id}
                  className="p-2 bg-[#0B1220] border border-[#1F2937] rounded-[6px] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#1F2937] text-[#9CA3AF] rounded-[4px] border border-[#2D3A4F]">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{hot.name.toUpperCase()}</h4>
                      <p className="text-[9px] text-[#9CA3AF] mt-0.5">PRIMARY: {hot.mainViolation.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-1">
                    <span className="text-xs font-bold text-white">{hot.violationsCount} counts</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-[3px] border ${
                      hot.rating === "Critical" ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20" :
                      hot.rating === "High" ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20" :
                      "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20"
                    }`}>
                      {hot.rating.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Hotspot Map Panel */}
        <div className="panel p-3 border-[#1F2937] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">GEOGRAPHIC GRID DENSITY OVERLAY</h3>
            <p className="text-[10px] text-[#9CA3AF]">Crosshairs coordinate system of registry nodes</p>
          </div>

          {/* SVG Map Grid */}
          <div className="aspect-video w-full rounded-[4px] bg-[#0B1220] border border-[#1F2937] relative overflow-hidden flex items-center justify-center mt-2.5">
            <svg viewBox="0 0 400 220" className="w-full h-full opacity-80">
              <defs>
                <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1F2937" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />

              {/* Road vectors representing intersections */}
              <path d="M 40 0 L 40 220" stroke="#1f2937" strokeWidth="6" />
              <path d="M 220 0 L 220 220" stroke="#1f2937" strokeWidth="8" />
              <path d="M 0 100 L 400 100" stroke="#1f2937" strokeWidth="8" />
              <path d="M 0 160 L 400 160" stroke="#1f2937" strokeWidth="6" />

              {/* Radar nodes */}
              {mapMarkers.map((marker) => {
                const isSelected = selectedArea === "Entire Bangalore" || selectedArea === marker.name;
                const opacity = isSelected ? 1.0 : 0.2;
                const showPing = isSelected && selectedArea !== "Entire Bangalore";

                return (
                  <g key={marker.id} opacity={opacity} className="transition-all duration-150">
                    {showPing && (
                      <circle cx={marker.cx} cy={marker.cy} r={8} fill={marker.color} fillOpacity="0.3" className="animate-ping" />
                    )}
                    <circle cx={marker.cx} cy={marker.cy} r={3} fill={marker.color} />
                    <text
                      x={marker.cx + 6}
                      y={marker.cy - 3}
                      fill="#F9FAFB"
                      fontSize="6.5"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {marker.name.toUpperCase()} ({marker.count})
                    </text>
                  </g>
                );
              })}
            </svg>

            <div className="absolute top-2 left-2 text-[8px] bg-[#0B1220]/90 border border-[#1F2937] text-white px-1.5 py-0.2 rounded font-mono flex items-center gap-1">
              <Map className="w-3 h-3 text-[#3b82f6]" />
              <span>COORDS: GIS_UTM_REF // {selectedArea.toUpperCase()}</span>
            </div>
          </div>

          <div className="p-2 bg-[#1C2533]/40 text-[#3b82f6] border border-[#3b82f6]/20 rounded-[4px] flex items-center gap-2 text-[10px] mt-2.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>GIS records update pipeline synced. Coords grid locked.</span>
          </div>
        </div>

      </div>

    </div>
  );
};

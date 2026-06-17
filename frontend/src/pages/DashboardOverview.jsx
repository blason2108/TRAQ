import React, { useMemo, useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import { 
  ShieldAlert, Activity, AlertOctagon, Cpu, Eye, CheckCircle2, 
  XCircle, AlertTriangle, Play, HelpCircle, RefreshCw, Search,
  Compass, Map, Heart, Wifi, Clock, ArrowRight, ExternalLink
} from "lucide-react";
import { MOCK_KPIS, MOCK_TRENDS, MOCK_BREAKDOWN, MOCK_HOTSPOTS } from "../data/mockData";

export const DashboardOverview = ({ 
  violations, 
  onViewViolation, 
  onNavigateToViolations, 
  onUpdateStatus,
  searchQuery,
  setSearchQuery 
}) => {
  const [systemClock, setSystemClock] = useState(new Date().toISOString());

  // Keep an active system clock for SOC realism
  useEffect(() => {
    const timer = setInterval(() => {
      setSystemClock(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter violation types and counts
  const { totalToday, activeAlertsCount, accuracyRate } = useMemo(() => {
    const total = violations.length + 1240; // Historical base + dynamic stream counts
    const pendingCount = violations.filter(v => v.status === "Pending Review").length + 2;
    const accuracy = MOCK_KPIS.accuracy;
    return {
      totalToday: total,
      activeAlertsCount: pendingCount,
      accuracyRate: accuracy
    };
  }, [violations]);

  // Handle vehicle number plate filtering
  const filteredViolations = useMemo(() => {
    return violations
      .filter((v) => {
        if (!searchQuery) return true;
        return (
          v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.violationType.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .slice(0, 7); // keep it extremely dense and compact
  }, [violations, searchQuery]);

  // Find the first few pending violations to feed the "Review Queue" workspace
  const pendingQueue = useMemo(() => {
    return violations.filter(v => v.status === "Pending Review").slice(0, 2);
  }, [violations]);

  // Camera health records
  const camerasRegistry = [
    { id: "CAM-01", intersection: "Silk Board Jnc - North", status: "Online", fps: 30, latency: "12ms", network: "100%", lastActive: "Just now" },
    { id: "CAM-02", intersection: "Silk Board Jnc - East", status: "Online", fps: 30, latency: "15ms", network: "100%", lastActive: "3s ago" },
    { id: "CAM-04", intersection: "Koramangala 80ft Rd", status: "Online", fps: 30, latency: "18ms", network: "98%", lastActive: "1s ago" },
    { id: "CAM-07", intersection: "Whitefield Main Rd", status: "Online", fps: 25, latency: "42ms", network: "85%", lastActive: "5s ago" },
    { id: "CAM-09", intersection: "Indiranagar 100ft Rd", status: "Online", fps: 30, latency: "14ms", network: "100%", lastActive: "Just now" },
    { id: "CAM-12", intersection: "Outer Ring Road - Cam 12", status: "Online", fps: 30, latency: "22ms", network: "95%", lastActive: "2s ago" },
    { id: "CAM-18", intersection: "Electronic City Expwy", status: "Offline", fps: 0, latency: "---", network: "0%", lastActive: "2m ago" }
  ];

  // SVG Geographic Intersections Coordinate Map
  const mapCoordinates = {
    "Koramangala 80ft Rd": { x: 140, y: 120 },
    "Outer Ring Road": { x: 110, y: 80 },
    "Silk Board Junction": { x: 200, y: 150 },
    "Indiranagar 100ft Rd": { x: 260, y: 70 },
    "Whitefield Main Road": { x: 320, y: 100 },
    "MG Road Crossing": { x: 80, y: 50 }
  };

  // Find where the newest alert is and flash it on the map
  const activePingCoord = useMemo(() => {
    if (violations.length === 0) return null;
    const latest = violations[0];
    // Match location name substring
    const matchKey = Object.keys(mapCoordinates).find(k => latest.location.includes(k));
    return matchKey ? mapCoordinates[matchKey] : null;
  }, [violations]);

  // Color mapping helper for violations types in badges
  const getViolationBadgeStyle = (type) => {
    switch (type) {
      case "No Helmet": return "text-[#ef4444] border-[#ef4444]/30 bg-[#ef4444]/5";
      case "Speeding": return "text-[#f59e0b] border-[#f59e0b]/30 bg-[#f59e0b]/5";
      case "No Seatbelt": return "text-[#3b82f6] border-[#3b82f6]/30 bg-[#3b82f6]/5";
      case "Running Red Light": return "text-[#ef4444] border-[#ef4444]/40 bg-[#ef4444]/10";
      case "Triple Riding": return "text-[#a855f7] border-[#a855f7]/30 bg-[#a855f7]/5";
      case "Phone Usage": return "text-[#06b6d4] border-[#06b6d4]/30 bg-[#06b6d4]/5";
      default: return "text-[#9CA3AF] border-[#1F2937] bg-[#1F2937]/30";
    }
  };

  return (
    <div className="space-y-4">
      
      {/* 1. Top Section: Command Status Row */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
        {/* System Health */}
        <div className="panel p-2.5 flex flex-col justify-center border-[#1F2937]">
          <span className="text-[9px] font-mono text-[#9CA3AF] uppercase tracking-wider">CORE SYSTEM STATUS</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-[#10b981] tracking-tight">OPERATIONAL</span>
          </div>
        </div>

        {/* Cameras status */}
        <div className="panel p-2.5 flex flex-col justify-center border-[#1F2937]">
          <span className="text-[9px] font-mono text-[#9CA3AF] uppercase tracking-wider">CAMERA REGISTRY</span>
          <span className="text-xs font-mono font-bold text-[#F9FAFB] mt-1">
            <span className="text-[#10b981]">6 ONLINE</span> / <span className="text-[#ef4444]">1 OFFLINE</span>
          </span>
        </div>

        {/* Active Alerts */}
        <div className="panel p-2.5 flex flex-col justify-center border-[#1F2937]">
          <span className="text-[9px] font-mono text-[#9CA3AF] uppercase tracking-wider">DISPATCH QUEUE</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping"></span>
            <span className="text-xs font-mono font-bold text-[#ef4444]">{activeAlertsCount} ACTIONS REQ</span>
          </div>
        </div>

        {/* Today's Violations Count */}
        <div className="panel p-2.5 flex flex-col justify-center border-[#1F2937]">
          <span className="text-[9px] font-mono text-[#9CA3AF] uppercase tracking-wider">VOL TODAY (LOG)</span>
          <span className="text-xs font-mono font-bold text-[#f59e0b] mt-1">{totalToday.toLocaleString()} CASES</span>
        </div>

        {/* Detection Accuracy */}
        <div className="panel p-2.5 flex flex-col justify-center border-[#1F2937]">
          <span className="text-[9px] font-mono text-[#9CA3AF] uppercase tracking-wider">INFERENCE ACCURACY</span>
          <span className="text-xs font-mono font-bold text-[#3b82f6] mt-1">{accuracyRate}% mAP</span>
        </div>

        {/* Last Sync clock */}
        <div className="panel p-2.5 flex flex-col justify-center border-[#1F2937] md:col-span-1">
          <span className="text-[9px] font-mono text-[#9CA3AF] uppercase tracking-wider">UTC CONTROLLER TIME</span>
          <span className="text-[10px] font-mono font-bold text-[#D1D5DB] mt-1 truncate">
            {systemClock.split("T")[1].slice(0, 8)}
          </span>
        </div>

        {/* Live Plate Search */}
        <div className="panel p-2.5 flex items-center justify-between border-[#1F2937] md:col-span-1 bg-[#1F2937]/25">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 pl-1.5 flex items-center text-[#9CA3AF]">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="SEARCH PLATE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-6 pr-1 py-0.5 bg-[#0B1220] border border-[#1F2937] text-[11px] font-mono text-white rounded-[4px] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
        </div>
      </div>

      {/* 2. Main Workstation: 12-Column Layout Grid */}
      <div className="grid grid-cols-12 gap-3">
        
        {/* LEFT COLUMN SPLIT: Live Feed (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-3">
          
          {/* Live Violation Dispatch Feed Panel */}
          <div className="panel p-3 border-[#1F2937]">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse"></span>
                <h3 className="text-xs font-bold font-mono text-[#F9FAFB] uppercase tracking-wider">
                  LIVE AI STREAM DISPATCH FEED
                </h3>
              </div>
              <button
                onClick={onNavigateToViolations}
                className="text-[11px] font-mono text-[#3b82f6] hover:underline flex items-center gap-1"
              >
                EXPAND FEED LIST
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-[#1F2937]">
                    <th>TIME</th>
                    <th>CAMERA ID</th>
                    <th>PLATE ID</th>
                    <th>VIOLATION</th>
                    <th>CONF</th>
                    <th>LOCATION</th>
                    <th>STATUS</th>
                    <th className="text-center">INSPECT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredViolations.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-6 text-center text-[#9CA3AF]">
                        NO MATCHING RECORDS LOGGED
                      </td>
                    </tr>
                  ) : (
                    filteredViolations.map((viol) => (
                      <tr key={viol.id} className="hover:bg-[#1C2533]/50 transition-colors">
                        <td className="text-[11px] text-[#9CA3AF]">
                          {new Date(viol.timestamp).toISOString().split("T")[1].slice(0, 8)}
                        </td>
                        <td className="text-[11px] font-bold text-white">
                          {viol.id.split("-")[2] ? `CAM-${viol.id.split("-")[2]}` : "CAM-04"}
                        </td>
                        <td>
                          <span className="bg-[#1F2937] px-1.5 py-0.5 rounded border border-[#2D3A4F] text-[#F9FAFB] font-extrabold text-[12px]">
                            {viol.licensePlate}
                          </span>
                        </td>
                        <td>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-[4px] ${getViolationBadgeStyle(viol.violationType)}`}>
                            {viol.violationType.toUpperCase()}
                          </span>
                        </td>
                        <td className="font-bold text-[11px]">
                          {(viol.confidence * 100).toFixed(0)}%
                        </td>
                        <td className="text-[11px] text-[#D1D5DB] max-w-[120px] truncate">
                          {viol.location.split(" - ")[0]}
                        </td>
                        <td>
                          <span className={`text-[10px] font-bold ${
                            viol.status === "Confirmed" ? "text-[#10b981]" :
                            viol.status === "Rejected" ? "text-[#ef4444]" :
                            "text-[#f59e0b] animate-pulse"
                          }`}>
                            {viol.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            onClick={() => onViewViolation(viol)}
                            className="p-1 text-[#3b82f6] hover:bg-[#1F2937] rounded-[4px] border border-[#1F2937] transition-all"
                            title="Inspect Evidence Frame"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Review Queue Workspace Panel */}
          <div className="panel p-3 border-[#1F2937]">
            <div className="flex justify-between items-center mb-2.5">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="text-xs font-bold font-mono text-[#F9FAFB] uppercase tracking-wider">
                  ACTIVE OPERATOR REVIEW WORKSPACE
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#9CA3AF] bg-[#1F2937] px-2 py-0.5 rounded-[4px]">
                PENDING ACTION COUNTER: {pendingQueue.length}
              </span>
            </div>

            {pendingQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#9CA3AF] font-mono border border-dashed border-[#1F2937] rounded-[6px]">
                ALL RECORDED INCIDENTS PROCESSED. PENDING DISPATCH IS CLEAR.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingQueue.map((viol) => (
                  <div key={viol.id} className="bg-[#1C2533]/30 border border-[#1F2937] p-2.5 rounded-[6px] flex flex-col justify-between">
                    <div>
                      {/* Case details header */}
                      <div className="flex justify-between items-start border-b border-[#1F2937] pb-1.5 mb-2 font-mono">
                        <div>
                          <p className="text-[10px] font-bold text-[#3b82f6] leading-none">{viol.id}</p>
                          <p className="text-[9px] text-[#9CA3AF] mt-0.5">{viol.location.split(" - ")[0]}</p>
                        </div>
                        <span className="text-[11px] font-extrabold text-[#F9FAFB] bg-[#1F2937] px-1.5 py-0.5 rounded border border-[#2D3A4F]">
                          {viol.licensePlate}
                        </span>
                      </div>

                      {/* Mock vehicle SVG thumbnail crop */}
                      <div className="aspect-video w-full rounded-[4px] bg-[#0B1220] border border-[#1F2937] flex items-center justify-center relative overflow-hidden mb-2">
                        <svg viewBox="0 0 100 60" className="w-full h-full opacity-60">
                          <rect width="100%" height="100%" fill={viol.vehicleType === "Motorcycle" ? "#1A233D" : "#1A2D3D"} />
                          <circle cx="50" cy="30" r="10" fill="#334155" />
                        </svg>
                        <div className="absolute top-1 left-1 bg-[#0B1220]/90 text-[8px] font-mono text-[#ef4444] px-1 py-0.2 rounded border border-[#ef4444]/30">
                          {viol.violationType.toUpperCase()}
                        </div>
                        <div className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-400 bg-slate-900/90 px-1 py-0.2 rounded">
                          CONF: {(viol.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>

                    {/* Operational action triggers */}
                    <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#1F2937] font-mono">
                      <button
                        onClick={() => onUpdateStatus(viol.id, "Confirmed")}
                        className="py-1 px-1 bg-[#10b981]/10 border border-[#10b981]/30 hover:bg-[#10b981]/20 text-[#10b981] font-bold text-[10px] rounded-[4px] transition-colors"
                      >
                        APPROVE
                      </button>
                      <button
                        onClick={() => onUpdateStatus(viol.id, "Rejected")}
                        className="py-1 px-1 bg-[#ef4444]/10 border border-[#ef4444]/30 hover:bg-[#ef4444]/20 text-[#ef4444] font-bold text-[10px] rounded-[4px] transition-colors"
                      >
                        REJECT
                      </button>
                      <button
                        onClick={() => alert(`Escalating case ${viol.id} for secondary supervisor audit.`)}
                        className="py-1 px-1 bg-[#f59e0b]/10 border border-[#f59e0b]/30 hover:bg-[#f59e0b]/20 text-[#f59e0b] font-bold text-[10px] rounded-[4px] transition-colors"
                      >
                        ESCALATE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN SPLIT: GIS Map & Camera Statuses (4 cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-3">
          
          {/* Geographic GIS Map Panel */}
          <div className="panel p-3 border-[#1F2937] flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Map className="w-4 h-4 text-[#3b82f6]" />
                  <h3 className="text-xs font-bold font-mono text-[#F9FAFB] uppercase tracking-wider">
                    GIS INTERSECTION MONITORING
                  </h3>
                </div>
                <span className="text-[8px] font-mono text-[#9CA3AF] bg-[#1F2937] px-1 py-0.2 rounded">UTM-43Q</span>
              </div>

              {/* Vector SVG Grid HUD map representation */}
              <div className="aspect-video w-full rounded-[4px] bg-[#0B1220] border border-[#1F2937] relative overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 400 220" className="w-full h-full opacity-80 select-none">
                  <defs>
                    <pattern id="socGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1F2937" strokeWidth="0.5" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#socGrid)" />

                  {/* Intersecting roadways */}
                  <path d="M 50 0 L 50 220" stroke="#1F2937" strokeWidth="8" />
                  <path d="M 200 0 L 200 220" stroke="#1F2937" strokeWidth="12" />
                  <path d="M 0 100 L 400 100" stroke="#1F2937" strokeWidth="12" />
                  <path d="M 0 160 L 400 160" stroke="#1F2937" strokeWidth="8" />

                  {/* Static GIS camera nodes */}
                  {/* Silk Board */}
                  <circle cx="200" cy="150" r="5" fill="#10b981" />
                  <circle cx="200" cy="150" r="12" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="2 1" />
                  
                  {/* Koramangala */}
                  <circle cx="140" cy="120" r="5" fill="#10b981" />

                  {/* ORR */}
                  <circle cx="110" cy="80" r="5" fill="#10b981" />

                  {/* Indiranagar */}
                  <circle cx="260" cy="70" r="5" fill="#10b981" />

                  {/* Whitefield */}
                  <circle cx="320" cy="100" r="5" fill="#10b981" />

                  {/* MG Road */}
                  <circle cx="80" cy="50" r="5" fill="#10b981" />

                  {/* Electronic City (Offline Node) */}
                  <line x1="335" y1="175" x2="345" y2="185" stroke="#ef4444" strokeWidth="2" />
                  <line x1="345" y1="175" x2="335" y2="185" stroke="#ef4444" strokeWidth="2" />
                  <text x="315" y="195" fill="#ef4444" fontSize="7" fontWeight="bold" fontFamily="monospace">CAM-18 OFFLINE</text>

                  {/* Dynamic Ping overlay from violations feed */}
                  {activePingCoord && (
                    <g>
                      <circle cx={activePingCoord.x} cy={activePingCoord.y} r={14} fill="none" stroke="#ef4444" strokeWidth="1.5" className="animate-ping" />
                      <circle cx={activePingCoord.x} cy={activePingCoord.y} r={7} fill="#ef4444" fillOpacity="0.4" />
                      <circle cx={activePingCoord.x} cy={activePingCoord.y} r={3} fill="#ef4444" />
                    </g>
                  )}
                </svg>

                {/* Map HUD floating data */}
                <div className="absolute top-1.5 left-1.5 text-[8px] font-mono text-[#10b981] bg-[#0B1220]/90 px-1 py-0.2 rounded border border-[#1F2937]">
                  GPS STREAM LOCK // 6 FEEDS STABLE
                </div>
              </div>
            </div>

            <div className="mt-2.5 p-2 bg-[#1C2533]/30 border border-[#1F2937] rounded-[4px] font-mono">
              <p className="text-[10px] text-[#9CA3AF] uppercase">LATEST GIS HIT INDEX</p>
              {violations.length > 0 ? (
                <div className="flex justify-between items-center text-[11px] mt-1 text-[#F9FAFB]">
                  <span className="font-bold">{violations[0].location.split(" - ")[0]}</span>
                  <span className="text-[#ef4444] font-bold">{violations[0].violationType.toUpperCase()}</span>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 mt-1">NO GIS HITS RECORDED</p>
              )}
            </div>
          </div>

          {/* Camera Health Panel */}
          <div className="panel p-3 border-[#1F2937]">
            <div className="flex items-center gap-1.5 mb-2">
              <Wifi className="w-4 h-4 text-[#10b981]" />
              <h3 className="text-xs font-bold font-mono text-[#F9FAFB] uppercase tracking-wider">
                EDGE NODE TELEMETRY SUMMARY
              </h3>
            </div>

            <div className="max-h-[175px] overflow-y-auto pr-1">
              <table className="w-full text-left font-mono">
                <thead>
                  <tr className="border-b border-[#1F2937] text-[10px]">
                    <th>CAM ID</th>
                    <th>STATUS</th>
                    <th>FPS</th>
                    <th>DELAY</th>
                    <th>LINK</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {camerasRegistry.map((cam) => (
                    <tr key={cam.id} className="hover:bg-[#1C2533]/40 border-b border-[#1F2937]/50">
                      <td className="font-bold text-white py-1">{cam.id}</td>
                      <td>
                        <span className={`font-bold ${cam.status === "Online" ? "text-[#10b981]" : "text-[#ef4444]"}`}>
                          {cam.status.toUpperCase()}
                        </span>
                      </td>
                      <td>{cam.fps}</td>
                      <td className={cam.status === "Online" ? "text-slate-300" : "text-slate-600"}>
                        {cam.latency}
                      </td>
                      <td className="text-[10px]">
                        <span className={cam.status === "Online" ? "text-[#10b981]" : "text-slate-600"}>
                          {cam.network}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Analytics Area (12 Columns, full width) */}
      <div className="panel p-3 border-[#1F2937]">
        <div className="flex items-center gap-2 mb-3 border-b border-[#1F2937] pb-2">
          <Activity className="w-4 h-4 text-[#3b82f6]" />
          <h3 className="text-xs font-bold font-mono text-[#F9FAFB] uppercase tracking-wider">
            ANALYTICAL OPERATIONS TELEMETRY
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Chart 1: Hourly Violation Volume */}
          <div className="bg-[#0B1220] p-2.5 rounded-[4px] border border-[#1F2937] flex flex-col justify-between">
            <div className="mb-2 font-mono">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">INTRADAY INCIDENT DENSITY</p>
              <p className="text-[9px] text-[#5A6D85]">Hourly violation aggregation index</p>
            </div>
            
            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_TRENDS} margin={{ top: 0, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" stroke="#9CA3AF" tickLine={false} />
                  <YAxis stroke="#9CA3AF" tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937" }} />
                  <Area type="monotone" dataKey="violations" stroke="#3b82f6" strokeWidth={1.5} fill="#3b82f6" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Top Violation Categories */}
          <div className="bg-[#0B1220] p-2.5 rounded-[4px] border border-[#1F2937] flex flex-col justify-between">
            <div className="mb-2 font-mono">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">INFRACTION SEGMENTATION</p>
              <p className="text-[9px] text-[#5A6D85]">Breakdown classified by detection nodes</p>
            </div>
            
            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_BREAKDOWN} layout="vertical" margin={{ top: 0, right: 5, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#9CA3AF" tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" tickLine={false} width={75} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937" }} />
                  <Bar dataKey="value" fill="#3b82f6" barSize={8}>
                    {MOCK_BREAKDOWN.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Top Offending Regions Grid */}
          <div className="bg-[#0B1220] p-2.5 rounded-[4px] border border-[#1F2937] flex flex-col justify-between font-mono">
            <div className="mb-2">
              <p className="text-[10px] font-bold text-[#9CA3AF] uppercase">REGIONAL INCIDENT RATINGS</p>
              <p className="text-[9px] text-[#5A6D85]">Hotspot intersections classification registry</p>
            </div>

            <div className="space-y-1.5 overflow-y-auto max-h-[170px] pr-1">
              {MOCK_HOTSPOTS.map((hot) => (
                <div key={hot.id} className="flex justify-between items-center text-[11px] py-1 border-b border-[#1F2937]/50">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1 h-3 rounded-[1px] ${
                      hot.rating === "Critical" ? "bg-[#ef4444]" :
                      hot.rating === "High" ? "bg-[#f59e0b]" :
                      "bg-[#3b82f6]"
                    }`}></span>
                    <span className="font-bold text-[#F9FAFB]">{hot.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{hot.violationsCount} counts</span>
                    <span className={`text-[9px] font-bold tracking-tight px-1.5 py-0.2 rounded-[3px] border ${
                      hot.rating === "Critical" ? "text-[#ef4444] border-[#ef4444]/20 bg-[#ef4444]/5" :
                      hot.rating === "High" ? "text-[#f59e0b] border-[#f59e0b]/20 bg-[#f59e0b]/5" :
                      "text-[#3b82f6] border-[#3b82f6]/20 bg-[#3b82f6]/5"
                    }`}>
                      {hot.rating.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { ThemeToggle } from "../components/ThemeToggle";
import logo from "../assets/logo.png";
import {
  ArrowRight,
  ShieldAlert,
  Gauge,
  UserX,
  Users,
  TrafficCone,
  Smartphone,
  Cpu,
  Activity,
  Video,
  Terminal,
  Grid,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export function LandingPage({ onEnterDashboard }) {
  const { theme, toggleTheme } = useTheme();

  // Simulated live OCR feed state
  const [ocrFeed, setOcrFeed] = useState([
    { id: 1, plate: "PB02BS2316", location: "KORAMANGALA", confidence: "98%", time: "JUST NOW", status: "VERIFIED" },
    { id: 2, plate: "MH12GP7731", location: "OUTER RING RD", confidence: "95%", time: "1 MIN AGO", status: "VERIFIED" },
    { id: 3, plate: "DL4CAF8821", location: "SILK BOARD", confidence: "92%", time: "3 MIN AGO", status: "PENDING" },
    { id: 4, plate: "KA51MB2020", location: "INDIRANAGAR", confidence: "99%", time: "5 MIN AGO", status: "FLAGGED" },
    { id: 5, plate: "UP16CT4004", location: "MG ROAD", confidence: "88%", time: "8 MIN AGO", status: "REJECTED" }
  ]);

  // Live telemetry counters
  const [telemetry, setTelemetry] = useState({
    fps: 88,
    latency: 38,
    activeCameras: 43,
    processedCount: 84920
  });

  // Pulse effect simulation for data feed
  useEffect(() => {
    const ocrInterval = setInterval(() => {
      const prefixes = ["KA", "MH", "DL", "HR", "UP", "KA"];
      const locations = ["SILK BOARD", "KORAMANGALA", "OUTER RING RD", "INDIRANAGAR", "WHITEFIELD", "MG ROAD"];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const randomPlate = `${randomPrefix}${Math.floor(10 + Math.random() * 90)}EX${Math.floor(1000 + Math.random() * 9000)}`;
      const randomConf = `${Math.floor(85 + Math.random() * 14)}%`;
      const statuses = ["VERIFIED", "PENDING", "FLAGGED"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const newEntry = {
        id: Date.now(),
        plate: randomPlate,
        location: randomLoc,
        confidence: randomConf,
        time: "JUST NOW",
        status: randomStatus
      };

      setOcrFeed((prev) => {
        const updated = [newEntry, ...prev.map(item => ({
          ...item,
          time: item.time === "JUST NOW" ? "1 MIN AGO" : item.time.includes("MIN") ? `${parseInt(item.time) + 1} MIN AGO` : item.time
        }))];
        return updated.slice(0, 5);
      });

      // Update counters slightly to show live updates
      setTelemetry((prev) => ({
        ...prev,
        processedCount: prev.processedCount + 1,
        fps: Math.floor(85 + Math.random() * 6),
        latency: Math.floor(35 + Math.random() * 8)
      }));
    }, 4000);

    return () => clearInterval(ocrInterval);
  }, []);

  const coreViolations = [
    { name: "NO HELMET", icon: ShieldAlert, severity: "CRITICAL", count: "512 CASES", desc: "AI detects riders without helmets using high-precision head vector mapping." },
    { name: "SPEEDING", icon: Gauge, severity: "CRITICAL", count: "342 CASES", desc: "Live velocity auditing via calibrated speed camera frames." },
    { name: "NO SEATBELT", icon: UserX, severity: "WARNING", count: "198 CASES", desc: "Interior cabin inspection model identifying seatbelt non-compliance." },
    { name: "RUNNING RED LIGHT", icon: TrafficCone, severity: "CRITICAL", count: "112 CASES", desc: "Automated traffic signal sequence violation identification." },
    { name: "TRIPLE RIDING", icon: Users, severity: "WARNING", count: "58 CASES", desc: "Rider counting logic flagging dangerous overloading on motorcycles." },
    { name: "PHONE USAGE", icon: Smartphone, severity: "WARNING", count: "26 CASES", desc: "Driver device usage recognition via body keypoint estimation." }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground swiss-grid-pattern swiss-noise font-sans flex flex-col relative select-none">
      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .radar-sweep-indicator {
          animation: radar-sweep 6s linear infinite;
          transform-origin: 125px 125px;
        }
        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>

      {/* Header bar */}
      <header className="h-16 border-b-2 border-border bg-background flex items-center justify-between px-6 md:px-12 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
            <img src={logo} alt="TRAQ Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest leading-none font-display">TRAQ</h1>
            <p className="text-[9px] text-muted-foreground font-mono font-bold tracking-tight">TRAFFIC RISK ANALYSIS & QUALIFICATION</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <button
            onClick={onEnterDashboard}
            className="px-4 py-1.5 border-2 border-border text-[11px] font-mono font-bold hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors flex items-center gap-2"
          >
            COMMAND CENTER <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero / HUD Row */}
      <main className="flex-1 px-6 md:px-12 py-10 flex flex-col gap-10">
        
        {/* Title and HUD section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-2 border-border pb-10">
          
          {/* Main Title branding */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tighter leading-none mb-6">
                TRAFFIC RISK ANALYSIS & <br className="hidden sm:inline" />
                QUALIFICATION
              </h2>
              <p className="text-xs sm:text-sm font-mono font-bold text-muted-foreground uppercase leading-relaxed max-w-2xl">
                A high-frequency AI-driven road compliance system implementing real-time computer vision networks, automatic license plate recognition (LPR), helmet verification, and violation dispatch tracking.
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onEnterDashboard}
                className="px-6 py-3 border-2 border-accent bg-accent text-accent-foreground font-mono font-black text-xs hover:bg-background hover:text-accent hover:border-accent transition-colors flex items-center justify-between group"
              >
                ENTER COMMAND CENTER 
                <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#how-it-works"
                className="px-6 py-3 border-2 border-border hover:bg-card text-center font-mono font-bold text-xs transition-colors"
              >
                DOCUMENTATION INDEX
              </a>
            </div>
          </div>

          {/* Telemetry HUD display */}
          <div className="lg:col-span-5 border-2 border-border bg-background p-5 font-mono flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                <span className="text-[10px] font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-accent animate-pulse-slow" /> SYSTEM TELEMETRY HUD
                </span>
                <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 border border-accent/20">LIVE</span>
              </div>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ENGINE MODEL:</span>
                  <span className="font-bold">YOLOv9-CUSTOM-MAPPED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">LATENCY RATE:</span>
                  <span className="font-bold text-accent">{telemetry.latency} MS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">PROCESSING TELEMETRY:</span>
                  <span className="font-bold text-accent">{telemetry.fps} FPS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">VEHICLES LOGGED:</span>
                  <span className="font-bold">{telemetry.processedCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CAMERA INDEX:</span>
                  <span className="font-bold">{telemetry.activeCameras} CHANNELS ONLINE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">UPTIME FRACTION:</span>
                  <span className="font-bold text-emerald-500">99.982%</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-[9px] text-muted-foreground">
              <span>REFRESH TICK: 4.0s</span>
              <span>NODE: BRUTALIST_S4</span>
            </div>
          </div>
        </div>

        {/* Section 01: Core Detections */}
        <div id="how-it-works" className="border-b-2 border-border pb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black tracking-widest uppercase font-mono">01 // AI DETECTOR MATRIX</h3>
            <span className="text-[10px] font-mono text-muted-foreground">6 DETECTORS REGISTERED</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coreViolations.map((v) => {
              const IconComp = v.icon;
              return (
                <div
                  key={v.name}
                  className="border-2 border-border p-5 flex flex-col justify-between transition-colors bg-background duration-150 hover:bg-accent hover:text-accent-foreground hover:border-accent group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 border-2 border-border group-hover:border-accent-foreground bg-card group-hover:bg-accent-foreground/10">
                        <IconComp className="w-5 h-5 text-accent group-hover:text-accent-foreground" />
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 border font-mono font-bold ${
                        v.severity === "CRITICAL"
                          ? "border-accent group-hover:border-accent-foreground text-accent group-hover:text-accent-foreground"
                          : "border-border text-muted-foreground group-hover:text-accent-foreground/75 group-hover:border-accent-foreground/50"
                      }`}>
                        {v.severity}
                      </span>
                    </div>
                    
                    <h4 className="text-base font-black tracking-tight font-display mb-1 uppercase">
                      {v.name}
                    </h4>
                    <p className="text-[11px] leading-normal text-muted-foreground group-hover:text-accent-foreground/80 font-mono mb-4 uppercase">
                      {v.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border/40 group-hover:border-accent-foreground/25 flex justify-between items-center text-[10px] font-mono font-black">
                    <span>SECTOR STATUS</span>
                    <span>{v.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 02: GIS radar mesh & Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-b-2 border-border pb-10">
          
          {/* GIS Mesh Vector Representation */}
          <div className="lg:col-span-7 border-2 border-border p-5 bg-background">
            <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
              <span className="text-[10px] font-mono font-black uppercase flex items-center gap-1">
                <Grid className="w-3.5 h-3.5 text-accent" /> 02 // GIS MESH SCANNER
              </span>
              <span className="text-[9px] font-mono text-muted-foreground">REF: UTR-43Q COORDINATE PLAN</span>
            </div>

            {/* Visual vector grid representing GIS roads and camera points */}
            <div className="aspect-[16/9] border border-border relative overflow-hidden bg-black flex items-center justify-center">
              
              {/* Radar sweep SVG */}
              <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 250 250">
                {/* Background grid */}
                <defs>
                  <pattern id="gisGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#gisGrid)" />

                {/* Radar sweeping lines */}
                <circle cx="125" cy="125" r="100" fill="none" stroke="var(--border)" strokeWidth="1" opacity="0.4" />
                <circle cx="125" cy="125" r="70" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
                <circle cx="125" cy="125" r="40" fill="none" stroke="var(--border)" strokeWidth="0.5" opacity="0.2" />
                
                {/* Concentric rings */}
                <line x1="25" y1="125" x2="225" y2="125" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />
                <line x1="125" y1="25" x2="125" y2="225" stroke="var(--border)" strokeWidth="0.5" opacity="0.3" />

                {/* Radar sweeping line */}
                <g className="radar-sweep-indicator">
                  <line x1="125" y1="125" x2="125" y2="25" stroke="var(--accent)" strokeWidth="1.5" opacity="0.8" />
                  <polygon points="125,125 125,25 105,28" fill="var(--accent)" opacity="0.1" />
                </g>

                {/* Roads lines */}
                <path d="M 10 90 Q 120 120 240 180" fill="none" stroke="var(--border)" strokeWidth="3" opacity="0.75" />
                <path d="M 30 230 L 220 20" fill="none" stroke="var(--border)" strokeWidth="2" opacity="0.6" />
                <path d="M 180 230 C 120 180 90 60 40 10" fill="none" stroke="var(--border)" strokeWidth="1.5" opacity="0.5" />

                {/* Camera Markers */}
                <g>
                  {/* Koramangala Cam */}
                  <circle cx="100" cy="100" r="3" fill="var(--accent)" className="animate-pulse-slow" />
                  <text x="106" y="98" fill="var(--foreground)" fontSize="5" fontWeight="bold" fontFamily="monospace">CAM-04 (KORAMANGALA)</text>
                  
                  {/* Silk Board Cam */}
                  <circle cx="138" cy="128" r="3.5" fill="red" />
                  <text x="145" y="132" fill="var(--foreground)" fontSize="5" fontWeight="bold" fontFamily="monospace">CAM-02 (SILK BOARD) [ALERT]</text>

                  {/* ORR Cam */}
                  <circle cx="185" cy="155" r="3" fill="var(--accent)" />
                  <text x="191" y="153" fill="var(--foreground)" fontSize="5" fontWeight="bold" fontFamily="monospace">CAM-12 (ORR)</text>

                  {/* Indiranagar Cam */}
                  <circle cx="85" cy="50" r="3" fill="var(--accent)" />
                  <text x="91" y="48" fill="var(--foreground)" fontSize="5" fontWeight="bold" fontFamily="monospace">CAM-09 (INDIRANAGAR)</text>
                </g>
              </svg>

              {/* Coordinates HUD overlay */}
              <div className="absolute top-3 left-3 bg-black/80 border border-border px-2 py-1 font-mono text-[8px] text-accent flex flex-col gap-0.5">
                <span>RADAR STATUS: ROTATING</span>
                <span>RANGE: 5000M</span>
                <span>RESOLUTION: 10M/GRID</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-black/80 border border-border px-2 py-1 font-mono text-[8px] text-muted-foreground flex flex-col gap-0.5 text-right">
                <span>LAT: 12.9716° N</span>
                <span>LON: 77.5946° E</span>
                <span>SYS MESH: OK</span>
              </div>
            </div>
          </div>

          {/* Core Telemetry List */}
          <div className="lg:col-span-5 border-2 border-border p-5 bg-background font-mono flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-border pb-2 mb-4">
                <span className="text-[10px] font-black uppercase flex items-center gap-1">
                  <Video className="w-3.5 h-3.5 text-accent" /> CAMERA TELEMETRY STREAM
                </span>
                <span className="text-[9px] text-muted-foreground">LIVE STATUS</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <div>
                    <p className="font-bold text-foreground">KORAMANGALA - CAM 04</p>
                    <p className="text-[9px] text-muted-foreground">MODEL: HIKVISION PTZ // 30 FPS</p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 font-bold uppercase">ONLINE</span>
                </div>

                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <div>
                    <p className="font-bold text-foreground">SILK BOARD - CAM 02</p>
                    <p className="text-[9px] text-muted-foreground">MODEL: HIKVISION PTZ // 29 FPS</p>
                  </div>
                  <span className="text-[9px] bg-accent/15 text-accent border border-accent/20 px-1.5 py-0.5 font-bold uppercase">DISPATCHING</span>
                </div>

                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <div>
                    <p className="font-bold text-foreground">OUTER RING RD - CAM 12</p>
                    <p className="text-[9px] text-muted-foreground">MODEL: AXIS DOME // 25 FPS</p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 font-bold uppercase">ONLINE</span>
                </div>

                <div className="flex justify-between items-center border-b border-border/30 pb-2">
                  <div>
                    <p className="font-bold text-foreground">INDIRANAGAR - CAM 09</p>
                    <p className="text-[9px] text-muted-foreground">MODEL: TRUVELO CAM // 60 FPS</p>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 font-bold uppercase">ONLINE</span>
                </div>

                <div className="flex justify-between items-center pb-2">
                  <div>
                    <p className="font-bold text-foreground">MG ROAD - CAM 01</p>
                    <p className="text-[9px] text-muted-foreground">MODEL: AXIS DOME // 0 FPS</p>
                  </div>
                  <span className="text-[9px] bg-red-500/10 text-red-500 border border-red-500/20 px-1.5 py-0.5 font-bold uppercase">OFFLINE</span>
                </div>
              </div>
            </div>

            <div className="mt-5 text-[9px] text-muted-foreground uppercase pt-2 border-t border-border flex justify-between">
              <span>ACTIVE STREAMS: 4/5 ONLINE</span>
              <span>PING: 14MS</span>
            </div>
          </div>
        </div>




      </main>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-border p-6 bg-card text-muted-foreground font-mono text-[10px] flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center">
          <span>TRAQ™ // HIGH-SPEED HIGHWAY PATROL CORE</span>
          <span className="hidden sm:inline">|</span>
          <span>FLIPKART GRID SAFETY INITIATIVE</span>
        </div>
        <div className="flex gap-4 items-center">
          <span className="text-accent">VERSION 2.4.1-RC3 [PRODUCTION]</span>
          <span>© 2026 ROAD-SAFETY ENFORCEMENT</span>
        </div>
      </footer>
    </div>
  );
}

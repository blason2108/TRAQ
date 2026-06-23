import React, { useState, useMemo, useEffect } from "react";
import { MOCK_MODEL_METRICS } from "../data/mockData";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import { Cpu, Server, Sliders, ShieldCheck, Activity, HardDrive, ShieldAlert } from "lucide-react";

export const Settings = () => {
  const [vehicleThreshold, setVehicleThreshold] = useState(0.75);
  const [violationThreshold, setViolationThreshold] = useState(0.8);
  const [ocrThreshold, setOcrThreshold] = useState(0.85);
  const [streamFPS, setStreamFPS] = useState(30);

  // Load config from backend on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/config");
        if (res.ok) {
          const data = await res.json();
          if (data.vehicleThreshold !== undefined) setVehicleThreshold(data.vehicleThreshold);
          if (data.violationThreshold !== undefined) setViolationThreshold(data.violationThreshold);
          if (data.ocrThreshold !== undefined) setOcrThreshold(data.ocrThreshold);
          if (data.streamFPS !== undefined) setStreamFPS(data.streamFPS);
          if (data.signalConfigs !== undefined) setSignalConfigs(data.signalConfigs);
        }
      } catch (err) {
        console.error("Failed to load config from backend:", err);
      }
    };
    fetchConfig();
  }, []);

  // Signal specific enforcement states
  const [selectedCam, setSelectedCam] = useState("CAM-01");
  const [signalConfigs, setSignalConfigs] = useState({
    "CAM-01": { name: "Silk Board Jnc - North", mode: "Strict", speedLimit: 60, redLight: true, safetyGear: true, tripleRiding: true },
    "CAM-02": { name: "Silk Board Jnc - East", mode: "Standard", speedLimit: 60, redLight: true, safetyGear: true, tripleRiding: true },
    "CAM-04": { name: "Koramangala 80ft Rd", mode: "Standard", speedLimit: 50, redLight: false, safetyGear: true, tripleRiding: true },
    "CAM-07": { name: "Whitefield Main Rd", mode: "Lenient", speedLimit: 60, redLight: true, safetyGear: true, tripleRiding: false },
    "CAM-09": { name: "Indiranagar 100ft Rd", mode: "Strict", speedLimit: 50, redLight: true, safetyGear: true, tripleRiding: true },
    "CAM-12": { name: "Outer Ring Road - Cam 12", mode: "Strict", speedLimit: 80, redLight: false, safetyGear: true, tripleRiding: false },
    "CAM-18": { name: "Electronic City Expwy", mode: "Standard", speedLimit: 80, redLight: false, safetyGear: true, tripleRiding: false },
  });

  const handleUpdateSignalConfig = (field, value) => {
    setSignalConfigs((prev) => ({
      ...prev,
      [selectedCam]: {
        ...prev[selectedCam],
        [field]: value,
      },
    }));
  };

  // Radial bar chart metrics in dynamic colors matching light/dark modes
  const radialData = useMemo(() => [
    { name: "mAP", value: MOCK_MODEL_METRICS.mAP, fill: "var(--accent)" },
    { name: "Recall", value: MOCK_MODEL_METRICS.recall, fill: "var(--foreground)" },
    { name: "Precision", value: MOCK_MODEL_METRICS.precision, fill: "var(--card)" },
    { name: "Accuracy", value: MOCK_MODEL_METRICS.accuracy, fill: "var(--foreground)" }
  ], []);

  const saveConfigToBackend = async (updatedConfig) => {
    try {
      const res = await fetch("http://localhost:8000/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      });
      if (res.ok) {
        return true;
      }
    } catch (err) {
      console.error("Failed to save config to backend:", err);
    }
    return false;
  };

  const handleSaveConfig = async () => {
    const success = await saveConfigToBackend({
      vehicleThreshold,
      violationThreshold,
      ocrThreshold,
      streamFPS,
      signalConfigs,
    });
    if (success) {
      alert("Model thresholds and pipeline parameters synced to edge inference nodes successfully.");
    } else {
      alert("Failed to sync config to backend.");
    }
  };

  const handleSaveSignalConfig = async () => {
    const success = await saveConfigToBackend({
      vehicleThreshold,
      violationThreshold,
      ocrThreshold,
      streamFPS,
      signalConfigs,
    });
    if (success) {
      alert(`Enforcement profile for ${selectedCam} (${signalConfigs[selectedCam].name}) pushed to local edge controller.`);
    } else {
      alert("Failed to sync config to backend.");
    }
  };

  return (
    <div className="space-y-4 font-display text-xs bg-background text-foreground">

      {/* Model version block */}
      <div className="panel p-3 border-2 border-border bg-background flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3 select-none">
          <div className="p-2 bg-foreground text-background rounded-none border border-border">
            <Server className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">ACTIVE CLASSIFIER DISPATCH CORE</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">MODEL ID: <span className="font-mono font-bold text-foreground">{MOCK_MODEL_METRICS.version}</span></p>
          </div>
        </div>
        <div className="text-[11px] font-black px-2.5 py-1.5 bg-card border-2 border-border text-foreground rounded-none font-mono uppercase tracking-wider">
          ENGINE: {MOCK_MODEL_METRICS.framework}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Radial Gauges for evaluation */}
        <div className="panel p-3 border-2 border-border bg-background flex flex-col justify-between lg:col-span-2">
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest">CLASSIFIER EVALUATION STATISTICS</h3>
            <p className="text-[10px] text-muted-foreground">Validation metrics recorded on test split datasets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            {/* Recharts Radial Chart */}
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="95%" barSize={6} data={radialData}>
                  <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={0} />
                  <Tooltip contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)", borderRadius: "0px" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center select-none font-mono">
                <p className="text-[9px] uppercase font-black text-foreground tracking-widest">OVERALL mAP</p>
                <p className="text-lg font-bold text-foreground">{MOCK_MODEL_METRICS.mAP}%</p>
              </div>
            </div>

            {/* Custom visual progress rings */}
            <div className="space-y-2 font-mono">
              {radialData.map((m) => (
                <div key={m.name} className="flex justify-between items-center text-xs border-b border-border/20 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-none border border-border" style={{ backgroundColor: m.fill }}></span>
                    <span className="font-bold text-foreground uppercase">{m.name}</span>
                  </div>
                  <span className="font-bold text-foreground">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <div className="panel p-3 border-2 border-border bg-background flex flex-col justify-between swiss-diagonal">
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest">EDGE COMPUTING TELEMETRY</h3>
            <p className="text-[10px] text-muted-foreground">Resource metrics for inference GPUs</p>
          </div>

          <div className="space-y-3 my-2 font-mono">
            {/* Uptime */}
            <div className="flex justify-between items-center text-xs border-b border-border pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5"><Activity className="w-4 h-4 text-foreground" /> CORE PIPELINE</span>
              <span className="font-bold text-foreground">{MOCK_MODEL_METRICS.systemHealth.uptime.toUpperCase()}</span>
            </div>

            {/* Latency */}
            <div className="flex justify-between items-center text-xs border-b border-border pb-2">
              <span className="text-muted-foreground flex items-center gap-1.5"><Cpu className="w-4 h-4 text-foreground" /> GPU DELAY</span>
              <span className="font-bold text-foreground">{MOCK_MODEL_METRICS.systemHealth.latency}</span>
            </div>

            {/* GPU Usage progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-accent" /> GPU UTILS</span>
                <span className="text-foreground font-bold">{MOCK_MODEL_METRICS.systemHealth.gpuUsage}%</span>
              </div>
              <div className="w-full h-2 bg-card border border-border rounded-none overflow-hidden">
                <div className="h-full bg-foreground" style={{ width: `${MOCK_MODEL_METRICS.systemHealth.gpuUsage}%` }}></div>
              </div>
            </div>

            {/* CPU usage progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground flex items-center gap-1.5"><Cpu className="w-4 h-4 text-foreground" /> CPU LOAD</span>
                <span className="text-foreground font-bold">{MOCK_MODEL_METRICS.systemHealth.cpuUsage}%</span>
              </div>
              <div className="w-full h-2 bg-card border border-border rounded-none overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${MOCK_MODEL_METRICS.systemHealth.cpuUsage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="p-2 bg-foreground text-background border border-border rounded-none flex items-center gap-2 text-[9px] uppercase font-black tracking-widest select-none">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span>CORE REGISTRY: SECURE</span>
          </div>
        </div>

      </div>

      {/* Threshold Config Sliders */}
      <div className="panel p-3 border-2 border-border bg-background space-y-4">
        <div className="flex items-center gap-2 select-none">
          <Sliders className="w-4.5 h-4.5 text-foreground" />
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest">16 // GLOBAL DETECTION LIMITS</h3>
            <p className="text-[10px] text-muted-foreground">Configure thresholds for bounding box and label assignments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs select-none">
              <span className="font-bold text-foreground uppercase">VEHICLE CLASSIFIER CONFIDENCE</span>
              <span className="font-mono font-bold text-background bg-foreground border border-border px-1.5 py-0.2 rounded-none">
                {vehicleThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={vehicleThreshold}
              onChange={(e) => setVehicleThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-foreground border-2 border-border rounded-none appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* Helmet/Seatbelt Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs select-none">
              <span className="font-bold text-foreground uppercase">SAFETY GEAR CLASSIFIER CONFIDENCE</span>
              <span className="font-mono font-bold text-background bg-foreground border border-border px-1.5 py-0.2 rounded-none">
                {violationThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={violationThreshold}
              onChange={(e) => setViolationThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-foreground border-2 border-border rounded-none appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* OCR Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs select-none">
              <span className="font-bold text-foreground uppercase">OCR CHARACTER CONFIDENCE</span>
              <span className="font-mono font-bold text-background bg-foreground border border-border px-1.5 py-0.2 rounded-none">
                {ocrThreshold.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={ocrThreshold}
              onChange={(e) => setOcrThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-foreground border-2 border-border rounded-none appearance-none cursor-pointer accent-accent"
            />
          </div>

          {/* FPS Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs select-none">
              <span className="font-bold text-foreground uppercase">TARGET PIPELINE FRAMERATE CAP</span>
              <span className="font-mono font-bold text-background bg-foreground border border-border px-1.5 py-0.2 rounded-none">
                {streamFPS} FPS
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={streamFPS}
              onChange={(e) => setStreamFPS(parseInt(e.target.value))}
              className="w-full h-1.5 bg-foreground border-2 border-border rounded-none appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t-2 border-border">
          <button
            onClick={handleSaveConfig}
            className="px-4 py-1.5 bg-accent hover:bg-foreground text-accent-foreground hover:text-background dark:hover:bg-accent dark:hover:text-accent-foreground font-bold rounded-none text-xs transition-colors border-2 border-border dark:hover:border-accent cursor-pointer uppercase tracking-wider"
          >
            SYNC EDGE PARAMETERS
          </button>
        </div>
      </div>

      {/* Signal-Specific Rule Enforcement Panel */}
      <div className="panel p-3 border-2 border-border bg-background space-y-4">
        <div className="flex items-center gap-2 select-none">
          <ShieldAlert className="w-4.5 h-4.5 text-foreground" />
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest">17 // SIGNAL-SPECIFIC RULE RIGOR</h3>
            <p className="text-[10px] text-muted-foreground">Configure infraction sensitivity levels and rule toggles at specific intersections</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">

          {/* Signal selector & Config Form */}
          <div className="lg:col-span-5 bg-background p-3 border-2 border-border rounded-none space-y-3.5 swiss-dots">
            {/* Selector */}
            <div className="space-y-1">
              <label className="text-[9px] text-foreground uppercase font-black tracking-widest">SELECT ACTIVE EDGE FEEDS</label>
              <select
                value={selectedCam}
                onChange={(e) => setSelectedCam(e.target.value)}
                className="w-full bg-background border-2 border-border text-foreground text-xs p-1.5 rounded-none font-mono focus:outline-none uppercase"
              >
                {Object.keys(signalConfigs).map((id) => (
                  <option key={id} value={id} className="bg-background text-foreground">
                    {id} // {signalConfigs[id].name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Enforcement Mode radio buttons */}
            <div className="space-y-1.5">
              <label className="text-[9px] text-foreground uppercase font-black tracking-widest">ENFORCEMENT RIGOR MODE</label>
              <div className="grid grid-cols-3 gap-1.5 font-sans font-black text-[9px] tracking-widest uppercase">
                {["Strict", "Standard", "Lenient"].map((mode) => {
                  const isActive = signalConfigs[selectedCam].mode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => handleUpdateSignalConfig("mode", mode)}
                      className={`py-1 rounded-none border-2 transition-all cursor-pointer ${
                        isActive
                          ? "bg-accent text-accent-foreground border-border dark:border-accent"
                          : "bg-card border-transparent text-foreground hover:bg-foreground hover:text-background dark:hover:bg-accent dark:hover:text-accent-foreground"
                      }`}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] font-bold text-muted-foreground leading-snug">
                {signalConfigs[selectedCam].mode === "Strict" && "STRICT: Aggressive logging. Reduced velocity tolerances (-3km/h) and minimum confidence margins."}
                {signalConfigs[selectedCam].mode === "Standard" && "STANDARD: Default enforcement guidelines. System filters minor inference outliers."}
                {signalConfigs[selectedCam].mode === "Lenient" && "LENIENT: Generous margins. Warns rather than dispatches for low-severity cases."}
              </p>
            </div>

            {/* Speed Limit */}
            <div className="space-y-1">
              <label className="text-[9px] text-foreground uppercase font-black tracking-widest">SPEED LIMIT (KM/H)</label>
              <input
                type="number"
                value={signalConfigs[selectedCam].speedLimit}
                onChange={(e) => handleUpdateSignalConfig("speedLimit", parseInt(e.target.value) || 0)}
                className="w-full bg-background border-2 border-border text-foreground text-xs p-1.5 rounded-none font-mono focus:outline-none"
              />
            </div>

            {/* Rule Toggles */}
            <div className="space-y-2 pt-2 border-t-2 border-border font-sans">
              <label className="text-[9px] text-foreground uppercase font-black tracking-widest block">ACTIVE ENFORCEMENT RULES</label>

              {/* Red light */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">RED LIGHT DISPATCH INCIDENTS</span>
                <input
                  type="checkbox"
                  checked={signalConfigs[selectedCam].redLight}
                  onChange={(e) => handleUpdateSignalConfig("redLight", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-accent"
                />
              </div>

              {/* Safety gear */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">SAFETY GEAR CLASSIFIERS (HELMET/SEATBELT)</span>
                <input
                  type="checkbox"
                  checked={signalConfigs[selectedCam].safetyGear}
                  onChange={(e) => handleUpdateSignalConfig("safetyGear", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-accent"
                />
              </div>

              {/* Triple Riding */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-foreground">MOTORCYCLE TRIPLE-RIDER CHECKS</span>
                <input
                  type="checkbox"
                  checked={signalConfigs[selectedCam].tripleRiding}
                  onChange={(e) => handleUpdateSignalConfig("tripleRiding", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-accent"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSignalConfig}
              className="w-full mt-1.5 py-1.5 bg-foreground hover:bg-accent text-background hover:text-accent-foreground border-2 border-border dark:hover:border-accent font-black text-xs rounded-none transition-colors cursor-pointer"
            >
              SYNC SIGNAL CONTROLLER
            </button>
          </div>

          {/* Active Registry table overview */}
          <div className="lg:col-span-7 bg-background rounded-none border-2 border-border p-3 overflow-x-auto">
            <h4 className="text-[10px] font-sans font-black text-foreground uppercase tracking-widest mb-2 select-none">ACTIVE SIGNAL STATUS REGISTRY</h4>
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-table-header-bg text-table-header-text text-[10px] uppercase font-black tracking-wider border-b-2 border-border">
                  <th className="py-1 px-2">SIGNAL</th>
                  <th>INTERSECTION</th>
                  <th>ENFORCE</th>
                  <th>SPEED LIMIT</th>
                  <th>RULES ACTIVE</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(signalConfigs).map((id) => {
                  const conf = signalConfigs[id];
                  return (
                    <tr key={id} className="border-b border-border/20 hover:bg-card font-bold">
                      <td className="font-mono font-black text-foreground py-2.5 px-2">{id}</td>
                      <td className="text-foreground uppercase truncate max-w-[130px]">{conf.name}</td>
                      <td>
                        <span className={`font-black uppercase text-[10px] ${
                          conf.mode === "Strict" ? "text-accent" : "text-foreground"
                        }`}>
                          {conf.mode}
                        </span>
                      </td>
                      <td className="font-mono text-foreground">{conf.speedLimit} KM/H</td>
                      <td className="text-[9px] text-muted-foreground font-mono">
                        {conf.redLight && "RED_LIGHT "}
                        {conf.safetyGear && "GEAR "}
                        {conf.tripleRiding && "TRIPLE "}
                        {!conf.redLight && !conf.safetyGear && !conf.tripleRiding && "NONE"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      </div>

    </div>
  );
};

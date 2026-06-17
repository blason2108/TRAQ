import React, { useState, useMemo } from "react";
import { MOCK_MODEL_METRICS } from "../data/mockData";
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from "recharts";
import { Cpu, Server, Sliders, ShieldCheck, Activity, HardDrive, ToggleLeft, ShieldAlert } from "lucide-react";

export const Settings = () => {
  const [vehicleThreshold, setVehicleThreshold] = useState(0.75);
  const [violationThreshold, setViolationThreshold] = useState(0.8);
  const [ocrThreshold, setOcrThreshold] = useState(0.85);
  const [streamFPS, setStreamFPS] = useState(30);

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

  // Memoize static model evaluation metrics to avoid triggering Recharts redraw pass during config slider drags
  const radialData = useMemo(() => [
    { name: "mAP", value: MOCK_MODEL_METRICS.mAP, fill: "#3b82f6" },
    { name: "Recall", value: MOCK_MODEL_METRICS.recall, fill: "#10b981" },
    { name: "Precision", value: MOCK_MODEL_METRICS.precision, fill: "#f59e0b" },
    { name: "Accuracy", value: MOCK_MODEL_METRICS.accuracy, fill: "#ef4444" }
  ], []);

  const handleSaveConfig = () => {
    alert("Model thresholds and pipeline parameters synced to edge inference nodes successfully.");
  };

  const handleSaveSignalConfig = () => {
    alert(`Enforcement profile for ${selectedCam} (${signalConfigs[selectedCam].name}) pushed to local edge controller.`);
  };

  return (
    <div className="space-y-3 font-mono">
      
      {/* Model version block */}
      <div className="panel p-3 border-[#1F2937] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#3b82f6]/10 text-[#3b82f6] rounded-[6px] border border-[#3b82f6]/20">
            <Server className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">ACTIVE CLASSIFIER DISPATCH CORE</h3>
            <p className="text-[10px] text-[#9CA3AF] mt-0.5">MODEL ID: <span className="font-mono font-bold text-[#F9FAFB]">{MOCK_MODEL_METRICS.version}</span></p>
          </div>
        </div>
        <div className="text-[11px] font-bold px-2 py-1 bg-[#1F2937] border border-[#2D3A4F] text-[#D1D5DB] rounded-[6px] font-mono">
          ENGINE: {MOCK_MODEL_METRICS.framework.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        
        {/* Radial Gauges for evaluation */}
        <div className="panel p-3 border-[#1F2937] flex flex-col justify-between lg:col-span-2">
          <div>
            <h3 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">CLASSIFIER BENCHMARK MATRIX</h3>
            <p className="text-[10px] text-[#9CA3AF]">Validation metrics recorded on test split datasets</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
            {/* Recharts Radial Chart */}
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="95%" barSize={6} data={radialData}>
                  <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={4} />
                  <Tooltip contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute text-center select-none">
                <p className="text-[9px] uppercase font-bold text-[#9CA3AF] tracking-wider">OVERALL mAP</p>
                <p className="text-xl font-bold text-white">{MOCK_MODEL_METRICS.mAP}%</p>
              </div>
            </div>

            {/* Custom visual progress rings */}
            <div className="space-y-2.5">
              {radialData.map((m) => (
                <div key={m.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: m.fill }}></span>
                    <span className="font-medium text-[#9CA3AF] uppercase">{m.name}</span>
                  </div>
                  <span className="font-bold text-white">{m.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health Status */}
        <div className="panel p-3 border-[#1F2937] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">EDGE DEVICE RESOURCES</h3>
            <p className="text-[10px] text-[#9CA3AF]">Telemetry status of classifier computing cores</p>
          </div>

          <div className="space-y-3.5 my-3">
            {/* Uptime */}
            <div className="flex justify-between items-center text-xs border-b border-[#1F2937] pb-2">
              <span className="text-[#9CA3AF] flex items-center gap-1.5"><Activity className="w-4 h-4 text-[#10b981]" /> CORE PIPELINE</span>
              <span className="font-bold text-[#10b981] font-mono">{MOCK_MODEL_METRICS.systemHealth.uptime.toUpperCase()}</span>
            </div>
            
            {/* Latency */}
            <div className="flex justify-between items-center text-xs border-b border-[#1F2937] pb-2">
              <span className="text-[#9CA3AF] flex items-center gap-1.5"><Cpu className="w-4 h-4 text-[#3b82f6]" /> INFERENCE LATENCY</span>
              <span className="font-bold text-white font-mono">{MOCK_MODEL_METRICS.systemHealth.latency}</span>
            </div>

            {/* GPU Usage progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#9CA3AF] flex items-center gap-1.5"><HardDrive className="w-4 h-4 text-[#f59e0b]" /> GPU CORE LOAD</span>
                <span className="text-white">{MOCK_MODEL_METRICS.systemHealth.gpuUsage}%</span>
              </div>
              <div className="w-full h-1 bg-[#1F2937] rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b]" style={{ width: `${MOCK_MODEL_METRICS.systemHealth.gpuUsage}%` }}></div>
              </div>
            </div>

            {/* CPU usage progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#9CA3AF] flex items-center gap-1.5"><Cpu className="w-4 h-4 text-[#a855f7]" /> HOST CPU LOAD</span>
                <span className="text-white">{MOCK_MODEL_METRICS.systemHealth.cpuUsage}%</span>
              </div>
              <div className="w-full h-1 bg-[#1F2937] rounded-full overflow-hidden">
                <div className="h-full bg-[#a855f7]" style={{ width: `${MOCK_MODEL_METRICS.systemHealth.cpuUsage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="p-2 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 rounded-[4px] flex items-center gap-2 text-[10px] uppercase font-bold">
            <ShieldCheck className="w-4 h-4 text-[#10b981]" />
            <span>CORE REGISTRY: HEALTHY</span>
          </div>
        </div>

      </div>

      {/* Threshold Config Sliders */}
      <div className="panel p-3 border-[#1F2937] space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4.5 h-4.5 text-[#3b82f6]" />
          <div>
            <h3 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">GLOBAL CLASSIFIER CONFIDENCE PARAMETERS</h3>
            <p className="text-[10px] text-[#9CA3AF]">Configure thresholds for bounding box and label assignments</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vehicle Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#9CA3AF]">VEHICLE CLASSIFIER CONFIDENCE</span>
              <span className="font-mono font-bold text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.2 rounded">
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
              className="w-full h-1 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
            />
          </div>

          {/* Helmet/Seatbelt Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#9CA3AF]">SAFETY GEAR CLASSIFIER CONFIDENCE</span>
              <span className="font-mono font-bold text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.2 rounded">
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
              className="w-full h-1 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
            />
          </div>

          {/* OCR Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#9CA3AF]">OCR CHARACTER CONFIDENCE</span>
              <span className="font-mono font-bold text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.2 rounded">
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
              className="w-full h-1 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
            />
          </div>

          {/* FPS Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#9CA3AF]">TARGET PIPELINE FRAMERATE CAP</span>
              <span className="font-mono font-bold text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.2 rounded">
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
              className="w-full h-1 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#1F2937]">
          <button
            onClick={handleSaveConfig}
            className="px-3 py-1.5 bg-[#3b82f6] hover:bg-[#3b82f6]/80 text-white font-semibold rounded-[6px] text-xs transition-colors cursor-pointer"
          >
            SYNC EDGE PARAMETERS
          </button>
        </div>
      </div>

      {/* NEW: Signal-Specific Rule Enforcement Panel */}
      <div className="panel p-3 border-[#1F2937] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4.5 h-4.5 text-[#f59e0b]" />
          <div>
            <h3 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">SIGNAL-SPECIFIC RULE ENFORCEMENT</h3>
            <p className="text-[10px] text-[#9CA3AF]">Configure infraction sensitivity levels and rule toggles at specific intersections</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* Signal selector & Config Form */}
          <div className="lg:col-span-5 bg-[#0B1220] p-3 rounded-[4px] border border-[#1F2937] space-y-3.5">
            {/* Selector */}
            <div className="space-y-1">
              <label className="text-[10px] text-[#9CA3AF] uppercase font-bold">SELECT ACTIVE EDGE FEEDS</label>
              <select
                value={selectedCam}
                onChange={(e) => setSelectedCam(e.target.value)}
                className="w-full bg-[#1F2937] border border-[#1f2937] text-white text-xs p-1.5 rounded-[4px] focus:outline-none"
              >
                {Object.keys(signalConfigs).map((id) => (
                  <option key={id} value={id}>
                    {id} // {signalConfigs[id].name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Enforcement Mode radio buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-[#9CA3AF] uppercase font-bold">ENFORCEMENT RIGOR MODE</label>
              <div className="grid grid-cols-3 gap-1.5">
                {["Strict", "Standard", "Lenient"].map((mode) => {
                  const isActive = signalConfigs[selectedCam].mode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => handleUpdateSignalConfig("mode", mode)}
                      className={`py-1 text-[10px] font-bold rounded-[4px] border transition-all ${
                        isActive
                          ? mode === "Strict" ? "bg-[#ef4444]/15 border-[#ef4444] text-[#ef4444]" :
                            mode === "Lenient" ? "bg-[#10b981]/15 border-[#10b981] text-[#10b981]" :
                            "bg-[#3b82f6]/15 border-[#3b82f6] text-[#3b82f6]"
                          : "bg-[#1F2937] border-[#1F2937] text-[#9CA3AF] hover:text-white"
                      }`}
                    >
                      {mode.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              <p className="text-[9px] text-[#9CA3AF] leading-snug">
                {signalConfigs[selectedCam].mode === "Strict" && "STRICT: Aggressive logging. Reduced velocity tolerances (-3km/h) and minimum confidence margins."}
                {signalConfigs[selectedCam].mode === "Standard" && "STANDARD: Default enforcement guidelines. System filters minor inference outliers."}
                {signalConfigs[selectedCam].mode === "Lenient" && "LENIENT: Generous margins. Warns rather than dispatches for low-severity cases."}
              </p>
            </div>

            {/* Speed Limit */}
            <div className="space-y-1">
              <label className="text-[10px] text-[#9CA3AF] uppercase font-bold">SPEED ENFORCEMENT LIMIT (KM/H)</label>
              <input
                type="number"
                value={signalConfigs[selectedCam].speedLimit}
                onChange={(e) => handleUpdateSignalConfig("speedLimit", parseInt(e.target.value) || 0)}
                className="w-full bg-[#1F2937] border border-[#1f2937] text-white text-xs p-1.5 rounded-[4px] focus:outline-none"
              />
            </div>

            {/* Rule Toggles */}
            <div className="space-y-2 pt-2 border-t border-[#1F2937]">
              <label className="text-[10px] text-[#9CA3AF] uppercase font-bold block">ACTIVE ENFORCEMENT RULES</label>
              
              {/* Red light */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#D1D5DB]">RED LIGHT INFRACTION CLASSIFICATION</span>
                <input
                  type="checkbox"
                  checked={signalConfigs[selectedCam].redLight}
                  onChange={(e) => handleUpdateSignalConfig("redLight", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[#3b82f6]"
                />
              </div>

              {/* Safety gear */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#D1D5DB]">SAFETY GEAR BOXING (HELMET/SEATBELT)</span>
                <input
                  type="checkbox"
                  checked={signalConfigs[selectedCam].safetyGear}
                  onChange={(e) => handleUpdateSignalConfig("safetyGear", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[#3b82f6]"
                />
              </div>

              {/* Triple Riding */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#D1D5DB]">MOTORCYCLE TRIPLE-RIDER CLASSIFIER</span>
                <input
                  type="checkbox"
                  checked={signalConfigs[selectedCam].tripleRiding}
                  onChange={(e) => handleUpdateSignalConfig("tripleRiding", e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-[#3b82f6]"
                />
              </div>
            </div>

            <button
              onClick={handleSaveSignalConfig}
              className="w-full mt-2 py-1.5 bg-[#3b82f6] hover:bg-[#3b82f6]/80 text-white font-bold text-xs rounded-[4px] transition-colors"
            >
              SYNC SIGNAL CONTROLLER
            </button>
          </div>

          {/* Active Registry table overview */}
          <div className="lg:col-span-7 bg-[#0B1220]/50 rounded-[4px] border border-[#1F2937] p-3 overflow-x-auto">
            <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase mb-2">ACTIVE SIGNAL STATUS REGISTRY</h4>
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-[#1F2937] text-[10px] text-[#9CA3AF]">
                  <th className="py-1">SIGNAL ID</th>
                  <th>INTERSECTION</th>
                  <th>ENFORCE MODE</th>
                  <th>SPEED LIMIT</th>
                  <th>ACTIVE RULES</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(signalConfigs).map((id) => {
                  const conf = signalConfigs[id];
                  return (
                    <tr key={id} className="border-b border-[#1F2937]/50 hover:bg-[#1C2533]/40">
                      <td className="font-bold text-white py-2">{id}</td>
                      <td className="text-slate-300 truncate max-w-[130px]">{conf.name}</td>
                      <td>
                        <span className={`font-bold uppercase text-[10px] ${
                          conf.mode === "Strict" ? "text-[#ef4444]" :
                          conf.mode === "Lenient" ? "text-[#10b981]" :
                          "text-[#3b82f6]"
                        }`}>
                          {conf.mode}
                        </span>
                      </td>
                      <td className="text-slate-300">{conf.speedLimit} KM/H</td>
                      <td className="text-[9px] text-[#9CA3AF]">
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

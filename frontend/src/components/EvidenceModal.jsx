import React, { useState } from "react";
import { X, Calendar, MapPin, Cpu, CheckCircle2, AlertTriangle, ShieldX, Download, Edit3, Check } from "lucide-react";

export const EvidenceModal = ({ violation, onClose, onUpdateStatus, onCorrectPlate }) => {
  const [isEditingPlate, setIsEditingPlate] = useState(false);
  const [tempPlate, setTempPlate] = useState(violation.licensePlate);

  if (!violation) return null;

  const handleSavePlate = () => {
    onCorrectPlate(violation.id, tempPlate);
    setIsEditingPlate(false);
  };

  // Render a high-tech mock camera frame using SVGs for annotations
  const renderMockFrame = () => {
    const isNoHelmet = violation.violationType === "No Helmet";
    const isSpeeding = violation.violationType === "Speeding";
    const isTriple = violation.violationType === "Triple Riding";
    const isNoSeatbelt = violation.violationType === "No Seatbelt";
    const isRedLight = violation.violationType === "Running Red Light";
    const isPhone = violation.violationType === "Phone Usage";

    return (
      <div className="relative aspect-video w-full rounded-[6px] overflow-hidden bg-[#0B1220] border border-[#1F2937] flex items-center justify-center">
        {/* Mock background road lane */}
        <svg viewBox="0 0 600 400" className="w-full h-full select-none">
          <defs>
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="100%" stopColor="#0B1220" />
            </linearGradient>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#070b14" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>
          
          {/* Sky and Ground */}
          <rect width="600" height="150" fill="url(#skyGrad)" />
          <rect y="150" width="600" height="250" fill="url(#roadGrad)" />
          
          {/* Lane dividers */}
          <path d="M 0 150 L 600 150" stroke="#1F2937" strokeWidth="2" />
          <path d="M 100 150 L 0 400" stroke="#1F2937" strokeWidth="2" />
          <path d="M 500 150 L 600 400" stroke="#1F2937" strokeWidth="2" />
          <path d="M 300 150 L 300 400" stroke="#F9FAFB" strokeWidth="2" strokeDasharray="15 15" strokeOpacity="0.2" />

          {/* Pedestrian crossing lines if Red Light */}
          {isRedLight && (
            <g opacity="0.15">
              <rect x="50" y="220" width="500" height="15" fill="#F9FAFB" transform="rotate(-5 300 230)" />
              <rect x="60" y="240" width="480" height="15" fill="#F9FAFB" transform="rotate(-5 300 250)" />
            </g>
          )}

          {/* Traffic Signal if Red Light */}
          {isRedLight && (
            <g transform="translate(490, 50)">
              {/* Pole */}
              <rect x="25" y="30" width="6" height="130" fill="#1F2937" />
              {/* Board */}
              <rect x="15" y="0" width="26" height="60" rx="3" fill="#111827" stroke="#1F2937" strokeWidth="1.5" />
              {/* Red Light */}
              <circle cx="28" cy="15" r="7" fill="#ef4444" />
              {/* Yellow Light */}
              <circle cx="28" cy="30" r="5" fill="#0B1220" />
              {/* Green Light */}
              <circle cx="28" cy="45" r="5" fill="#0B1220" />
            </g>
          )}

          {/* Vehicle Representation */}
          {violation.vehicleType === "Motorcycle" ? (
            <g transform="translate(210, 160)">
              {/* Two wheeler stylized shape */}
              <circle cx="50" cy="140" r="24" fill="#0B1220" stroke="#1F2937" strokeWidth="3" />
              <circle cx="130" cy="140" r="24" fill="#0B1220" stroke="#1F2937" strokeWidth="3" />
              <rect x="50" y="130" width="80" height="8" fill="#1F2937" />
              <path d="M 50 130 L 80 70 L 100 70 L 130 130 Z" fill="#0B1220" stroke="#1F2937" strokeWidth="2" />
              
              {/* Rider Body */}
              <circle cx="90" cy="50" r="14" fill="#1F2937" />
              <circle cx="90" cy="22" r="9" fill="#2A374A" />

              {/* Helmet overlay or blank */}
              {!isNoHelmet && (
                <path d="M 81 20 A 9 9 0 0 1 99 20 Z" fill="#3b82f6" />
              )}
              {isTriple && (
                <g transform="translate(-25, 10)" opacity="0.8">
                  {/* Passenger 1 */}
                  <circle cx="90" cy="50" r="13" fill="#1F2937" />
                  <circle cx="90" cy="24" r="8" fill="#2A374A" />
                </g>
              )}
              {isTriple && (
                <g transform="translate(-50, 18)" opacity="0.6">
                  {/* Passenger 2 */}
                  <circle cx="90" cy="50" r="12" fill="#1F2937" />
                  <circle cx="90" cy="24" r="8" fill="#2A374A" />
                </g>
              )}
            </g>
          ) : (
            // Car / Truck shape
            <g transform="translate(160, 140)">
              {/* Car Body */}
              <path d="M 20 100 L 40 40 L 240 40 L 260 100 Z" fill="#111827" stroke="#1F2937" strokeWidth="2" />
              <rect x="5" y="100" width="270" height="60" rx="4" fill="#0B1220" stroke="#1F2937" strokeWidth="1.5" />
              
              {/* Wheels */}
              <circle cx="55" cy="160" r="18" fill="#070b14" stroke="#1F2937" strokeWidth="3" />
              <circle cx="225" cy="160" r="18" fill="#070b14" stroke="#1F2937" strokeWidth="3" />
              
              {/* Windshield */}
              <path d="M 45 48 L 60 90 L 220 90 L 235 48 Z" fill="#1F2937" fillOpacity="0.4" stroke="#1F2937" strokeWidth="1.5" />
              
              {/* Headlights */}
              <circle cx="30" cy="120" r="6" fill="#f59e0b" />
              <circle cx="250" cy="120" r="6" fill="#f59e0b" />

              {/* Seatbelt line overlay */}
              {isNoSeatbelt ? (
                <g transform="translate(65, 55)">
                  <circle cx="20" cy="12" r="8" fill="#ef4444" fillOpacity="0.4" />
                  <line x1="8" y1="20" x2="32" y2="30" stroke="#ef4444" strokeWidth="2.5" />
                  <line x1="32" y1="20" x2="8" y2="30" stroke="#ef4444" strokeWidth="2.5" />
                </g>
              ) : (
                <g transform="translate(65, 55)" opacity="0.6">
                  <circle cx="20" cy="12" r="8" fill="#9CA3AF" />
                  <line x1="5" y1="5" x2="35" y2="30" stroke="#10b981" strokeWidth="2" />
                </g>
              )}
            </g>
          )}
        </svg>

        {/* Bounding box graphics */}
        <div className="absolute inset-0 pointer-events-none font-mono">
          {violation.annotatedBoxes.map((box, idx) => (
            <div
              key={idx}
              className="absolute border"
              style={{
                borderColor: box.color,
                left: `${(box.x / 600) * 100}%`,
                top: `${(box.y / 400) * 100}%`,
                width: `${(box.w / 600) * 100}%`,
                height: `${(box.h / 400) * 100}%`
              }}
            >
              <span
                className="absolute top-0 left-0 -translate-y-full text-[9px] font-bold px-1 py-0.2 text-white"
                style={{ backgroundColor: box.color }}
              >
                {box.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Camera HUD Overlays */}
        <div className="absolute top-2 left-2 bg-[#111827]/95 border border-[#1F2937] text-white text-[9px] px-2 py-0.5 rounded-[4px] font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse"></span>
          <span>DISPATCH STREAM RECORD // {violation.cameraDetails.resolution} @ {violation.cameraDetails.fps}FPS</span>
        </div>

        <div className="absolute bottom-2 right-2 bg-[#111827]/95 border border-[#1F2937] text-white text-[9px] px-2 py-0.5 rounded-[4px] font-mono">
          LATENCY: {violation.inferenceTime}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 bg-[#0B1220]/80 transition-opacity duration-150 font-mono">
      <div className="relative bg-[#111827] border border-[#1F2937] w-full max-w-4xl rounded-[6px] flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] overflow-hidden shadow-2xl">
        
        {/* Left column: Image frame */}
        <div className="w-full md:w-3/5 p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#1F2937]">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-[10px] font-bold text-[#3b82f6] font-mono tracking-wider">
                  CASE LOG: {violation.id}
                </span>
                <h2 className="text-sm font-bold text-[#F9FAFB] uppercase mt-0.5">
                  SEGMENTED EVIDENCE INSPECTOR
                </h2>
              </div>
            </div>

            {renderMockFrame()}
          </div>

          <div className="mt-3 p-2.5 bg-[#0B1220]/60 border border-[#1F2937] rounded-[4px]">
            <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1.5">Classifier Node Detections</h4>
            <div className="space-y-1">
              {violation.annotatedBoxes.map((box, idx) => (
                <div key={idx} className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#9CA3AF]">└─ {box.type.toUpperCase()}:</span>
                  <span className="font-bold" style={{ color: box.color }}>{box.label.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Details and Actions */}
        <div className="w-full md:w-2/5 p-4 flex flex-col justify-between overflow-y-auto bg-[#0B1220]/25">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-[4px] text-[#9CA3AF] hover:text-white hover:bg-[#1F2937] border border-transparent hover:border-[#1F2937] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-[4px] bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/25">
                {violation.violationType.toUpperCase()}
              </span>
              <div className="mt-3.5 grid grid-cols-2 gap-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <div className="text-[11px]">
                    <p className="font-bold text-[#F9FAFB] uppercase">Location</p>
                    <p className="text-[#9CA3AF] truncate max-w-[120px]">{violation.location.split(" - ")[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#9CA3AF]" />
                  <div className="text-[11px]">
                    <p className="font-bold text-[#F9FAFB] uppercase">Timestamp</p>
                    <p className="text-[#9CA3AF] truncate max-w-[120px]">{new Date(violation.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* License Plate Recognition correction section */}
            <div className="p-3 bg-[#0B1220] border border-[#1F2937] rounded-[4px] space-y-2.5">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase">LPR SEGMENTATION</h4>
                <span className="text-[9px] px-1.5 py-0.2 bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25 rounded-[3px] font-bold">
                  OCR: {(violation.ocrConfidence * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                {isEditingPlate ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={tempPlate}
                      onChange={(e) => setTempPlate(e.target.value.toUpperCase())}
                      className="flex-1 px-2 py-0.5 bg-[#0B1220] border border-[#1F2937] text-xs font-mono font-bold rounded-[4px] focus:outline-none focus:border-[#3b82f6] text-white uppercase"
                    />
                    <button
                      onClick={handleSavePlate}
                      className="p-1 bg-[#10b981] text-white rounded-[4px] hover:bg-[#10b981]/80 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-extrabold tracking-wider text-white px-2 py-0.5 bg-[#1F2937] rounded-[4px] border border-[#2D3A4F]">
                      {violation.licensePlate}
                    </span>
                    <button
                      onClick={() => {
                        setTempPlate(violation.licensePlate);
                        setIsEditingPlate(true);
                      }}
                      className="flex items-center gap-1 text-[11px] text-[#3b82f6] hover:underline font-bold"
                    >
                      <Edit3 className="w-3 h-3" />
                      CORRECT
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Model Metadata */}
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-[#9CA3AF] uppercase">MODEL METADATA</h4>
              <div className="bg-[#0B1220] border border-[#1F2937] rounded-[4px] p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">CLASSIFIER</span>
                  <span className="font-bold text-white flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-[#3b82f6]" /> YOLOv9-CUSTOM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">TOTAL ACCURACY</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{(violation.confidence * 100).toFixed(0)}%</span>
                    <div className="w-12 h-1 bg-[#1F2937] rounded-full overflow-hidden">
                      <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: `${violation.confidence * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#9CA3AF]">STATUS</span>
                  <span className={`font-bold uppercase ${
                    violation.status === "Confirmed" ? "text-[#10b981]" :
                    violation.status === "Rejected" ? "text-[#ef4444]" :
                    "text-[#f59e0b]"
                  }`}>{violation.status.toUpperCase()}</span>
                </div>
                {violation.speed && (
                  <div className="flex justify-between">
                    <span className="text-[#9CA3AF]">VELOCITY RECORD</span>
                    <span className="font-bold text-[#ef4444]">{violation.speed}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-3 border-t border-[#1F2937] space-y-1.5">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onUpdateStatus(violation.id, "Confirmed");
                  onClose();
                }}
                disabled={violation.status === "Confirmed"}
                className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-[4px] border transition-colors ${
                  violation.status === "Confirmed"
                    ? "bg-[#1F2937] text-slate-500 border-[#1F2937] cursor-not-allowed"
                    : "bg-[#10b981]/15 border-[#10b981]/30 hover:bg-[#10b981]/25 text-[#10b981]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                APPROVE
              </button>
              <button
                onClick={() => {
                  onUpdateStatus(violation.id, "Rejected");
                  onClose();
                }}
                disabled={violation.status === "Rejected"}
                className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-[4px] border transition-colors ${
                  violation.status === "Rejected"
                    ? "bg-[#1F2937] text-slate-500 border-[#1F2937] cursor-not-allowed"
                    : "bg-[#ef4444]/15 border-[#ef4444]/30 hover:bg-[#ef4444]/25 text-[#ef4444]"
                }`}
              >
                <ShieldX className="w-3.5 h-3.5" />
                REJECT
              </button>
            </div>
            
            <button
              onClick={() => {
                onUpdateStatus(violation.id, "Pending Review");
                onClose();
              }}
              disabled={violation.status === "Pending Review"}
              className={`w-full flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-[4px] border transition-colors ${
                violation.status === "Pending Review"
                  ? "bg-[#1F2937] text-slate-500 border-[#1F2937] cursor-not-allowed"
                  : "bg-[#f59e0b]/15 border-[#f59e0b]/30 hover:bg-[#f59e0b]/25 text-[#f59e0b]"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              FLAG REVIEW
            </button>

            <button
              onClick={() => alert(`Exporting case file ${violation.id} as PDF/ZIP evidence package.`)}
              className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-[4px] bg-[#1F2937] text-[#D1D5DB] border border-[#2D3A4F] hover:bg-[#1F2937]/80 transition-colors mt-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              EXPORT LOG FILE
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

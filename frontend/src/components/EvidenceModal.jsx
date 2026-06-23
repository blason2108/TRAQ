import React, { useState } from "react";
import { X, Calendar, MapPin, Cpu, CheckCircle2, AlertTriangle, ShieldX, Download, Edit3, Check } from "lucide-react";

export const EvidenceModal = ({ violation, onClose, onUpdateStatus, onCorrectPlate }) => {
  const [isEditingPlate, setIsEditingPlate] = useState(false);
  const [tempPlate, setTempPlate] = useState(violation.licensePlate);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Reset error state when violation changes
  React.useEffect(() => {
    setImageLoadError(false);
  }, [violation.id]);

  if (!violation) return null;

  const handleSavePlate = () => {
    onCorrectPlate(violation.id, tempPlate);
    setIsEditingPlate(false);
  };

  const renderEvidenceMedia = () => {
    // 1. Try to load the sample image first (if it exists and has not errored)
    if (!imageLoadError) {
      const sampleImageUrl = `http://localhost:8000/static/sample_images/${violation.id}.jpg`;
      return (
        <div className="relative aspect-video w-full rounded-none overflow-hidden bg-black border-2 border-border flex items-center justify-center">
          <img
            src={sampleImageUrl}
            alt="Violation Frame"
            className="w-full h-full object-contain"
            onError={(e) => {
              const typeUrl = `http://localhost:8000/static/sample_images/${encodeURIComponent(violation.violationType)}.jpg`;
              if (e.target.src !== typeUrl) {
                e.target.src = typeUrl;
              } else {
                setImageLoadError(true);
              }
            }}
          />
        </div>
      );
    }

    // 2. Fall back to video player if a video exists
    if (violation.video_url) {
      return (
        <div className="relative aspect-video w-full rounded-none overflow-hidden bg-black border-2 border-border flex items-center justify-center">
          <video
            src={violation.video_url}
            controls
            autoPlay
            loop
            muted
            className="w-full h-full object-contain"
          />
        </div>
      );
    }

    // 3. Fall back to vector drawing if neither exists
    return renderMockFrame();
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
      <div className="relative aspect-video w-full rounded-none overflow-hidden bg-map-bg border-2 border-border flex items-center justify-center swiss-diagonal">
        {/* Mock background road lane */}
        <svg viewBox="0 0 600 400" className="w-full h-full select-none">
          {/* Ground */}
          <rect width="600" height="400" fill="none" />

          {/* Lane dividers */}
          <path d="M 0 150 L 600 150" stroke="var(--road-stroke)" strokeWidth="2" />
          <path d="M 100 150 L 0 400" stroke="var(--road-stroke)" strokeWidth="2" />
          <path d="M 500 150 L 600 400" stroke="var(--road-stroke)" strokeWidth="2" />
          <path d="M 300 150 L 300 400" stroke="var(--road-stroke)" strokeWidth="2" strokeDasharray="15 15" strokeOpacity="0.2" />

          {/* Pedestrian crossing lines if Red Light */}
          {isRedLight && (
            <g opacity="0.3">
              <rect x="50" y="220" width="500" height="15" fill="var(--foreground)" transform="rotate(-5 300 230)" />
              <rect x="60" y="240" width="480" height="15" fill="var(--foreground)" transform="rotate(-5 300 250)" />
            </g>
          )}

          {/* Traffic Signal if Red Light */}
          {isRedLight && (
            <g transform="translate(490, 50)">
              {/* Pole */}
              <rect x="25" y="30" width="6" height="130" fill="var(--foreground)" />
              {/* Board */}
              <rect x="15" y="0" width="26" height="60" rx="0" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
              {/* Red Light */}
              <circle cx="28" cy="15" r="7" fill="var(--accent)" />
              {/* Yellow Light */}
              <circle cx="28" cy="30" r="5" fill="none" stroke="var(--border)" />
              {/* Green Light */}
              <circle cx="28" cy="45" r="5" fill="none" stroke="var(--border)" />
            </g>
          )}

          {/* Vehicle Representation */}
          {violation.vehicleType === "Motorcycle" ? (
            <g transform="translate(210, 160)">
              {/* Two wheeler shape */}
              <circle cx="50" cy="140" r="24" fill="var(--background)" stroke="var(--border)" strokeWidth="3" />
              <circle cx="130" cy="140" r="24" fill="var(--background)" stroke="var(--border)" strokeWidth="3" />
              <rect x="50" y="130" width="80" height="8" fill="var(--foreground)" />
              <path d="M 50 130 L 80 70 L 100 70 L 130 130 Z" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />

              {/* Rider Body */}
              <circle cx="90" cy="50" r="14" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
              <circle cx="90" cy="22" r="9" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />

              {/* Helmet overlay or blank */}
              {!isNoHelmet && (
                <path d="M 81 20 A 9 9 0 0 1 99 20 Z" fill="var(--foreground)" />
              )}
              {isTriple && (
                <g transform="translate(-25, 10)" opacity="0.9">
                  {/* Passenger 1 */}
                  <circle cx="90" cy="50" r="13" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
                  <circle cx="90" cy="24" r="8" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
                </g>
              )}
              {isTriple && (
                <g transform="translate(-50, 18)" opacity="0.7">
                  {/* Passenger 2 */}
                  <circle cx="90" cy="50" r="12" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
                  <circle cx="90" cy="24" r="8" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
                </g>
              )}
            </g>
          ) : (
            // Car / Truck shape
            <g transform="translate(160, 140)">
              {/* Car Body */}
              <path d="M 20 100 L 40 40 L 240 40 L 260 100 Z" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
              <rect x="5" y="100" width="270" height="60" rx="0" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />

              {/* Wheels */}
              <circle cx="55" cy="160" r="18" fill="var(--background)" stroke="var(--border)" strokeWidth="3" />
              <circle cx="225" cy="160" r="18" fill="var(--background)" stroke="var(--border)" strokeWidth="3" />

              {/* Windshield */}
              <path d="M 45 48 L 60 90 L 220 90 L 235 48 Z" fill="none" stroke="var(--border)" strokeWidth="2" />

              {/* Headlights */}
              <circle cx="30" cy="120" r="6" fill="var(--accent)" stroke="var(--border)" strokeWidth="1.5" />
              <circle cx="250" cy="120" r="6" fill="var(--accent)" stroke="var(--border)" strokeWidth="1.5" />

              {/* Seatbelt line overlay */}
              {isNoSeatbelt ? (
                <g transform="translate(65, 55)">
                  <circle cx="20" cy="12" r="8" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
                  <line x1="8" y1="20" x2="32" y2="30" stroke="var(--accent)" strokeWidth="3" />
                  <line x1="32" y1="20" x2="8" y2="30" stroke="var(--accent)" strokeWidth="3" />
                </g>
              ) : (
                <g transform="translate(65, 55)" opacity="0.8">
                  <circle cx="20" cy="12" r="8" fill="var(--background)" stroke="var(--border)" strokeWidth="2" />
                  <line x1="5" y1="5" x2="35" y2="30" stroke="var(--foreground)" strokeWidth="2.5" />
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
              className="absolute border-2"
              style={{
                borderColor: box.color === "#ef4444" ? "var(--accent)" : "var(--foreground)",
                left: `${(box.x / 600) * 100}%`,
                top: `${(box.y / 400) * 100}%`,
                width: `${(box.w / 600) * 100}%`,
                height: `${(box.h / 400) * 100}%`
              }}
            >
              <span
                className="absolute top-0 left-0 -translate-y-full text-[9px] font-black px-1.5 py-0.2 text-background bg-foreground uppercase tracking-wider"
              >
                {box.label.toUpperCase()}
              </span>
            </div>
          ))}
        </div>

        {/* Camera HUD Overlays */}
        <div className="absolute top-2.5 left-2.5 bg-foreground text-background text-[9px] px-2 py-0.5 rounded-none font-sans font-black uppercase tracking-wider border border-border">
          RECORD ARCHIVE // {violation.cameraDetails.resolution} @ {violation.cameraDetails.fps}FPS
        </div>

        <div className="absolute bottom-2.5 right-2.5 bg-foreground text-background text-[9px] px-2 py-0.5 rounded-none font-mono border border-border">
          DELAY: {violation.inferenceTime}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto flex items-center justify-center p-3 bg-black/60 transition-opacity duration-150 font-display text-xs">
      <div className="relative bg-background border-4 border-border w-full max-w-4xl rounded-none flex flex-col md:flex-row max-h-[90vh] md:max-h-[85vh] overflow-hidden shadow-2xl">

        {/* Left column: Image frame */}
        <div className="w-full md:w-3/5 p-4 flex flex-col justify-between border-b md:border-b-0 md:border-r-2 md:border-r-border border-border bg-background">
          <div>
            <div className="flex justify-between items-center mb-3 select-none">
              <div>
                <span className="text-[10px] font-black text-accent font-sans tracking-widest uppercase">
                  CASE LOG: {violation.id}
                </span>
                <h2 className="text-sm font-black text-foreground uppercase mt-0.5 font-display">
                  18 // EVIDENCE CLASSIFIER INSPECTOR
                </h2>
              </div>
            </div>

            {renderEvidenceMedia()}
          </div>

          <div className="mt-3.5 p-2.5 bg-card border-2 border-border rounded-none">
            <h4 className="text-[9px] font-sans font-black text-foreground uppercase tracking-widest mb-1.5">Segment Classifier Outputs</h4>
            <div className="space-y-1 font-mono text-foreground">
              {violation.annotatedBoxes.map((box, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">└─ {box.type.toUpperCase()}:</span>
                  <span className="font-bold text-foreground">{box.label.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Details and Actions */}
        <div className="w-full md:w-2/5 p-4 flex flex-col justify-between overflow-y-auto bg-background swiss-dots text-foreground">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 rounded-none text-foreground hover:text-background hover:bg-foreground border-2 border-transparent hover:border-border dark:hover:bg-accent dark:hover:text-accent-foreground dark:hover:border-accent transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-sans font-black uppercase px-2 py-0.5 rounded-none bg-accent text-accent-foreground border border-border tracking-widest">
                {violation.violationType.toUpperCase()}
              </span>
              <div className="mt-4 grid grid-cols-2 gap-3 font-sans font-bold uppercase text-[11px]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-foreground" />
                  <div>
                    <p className="font-black text-foreground">Location</p>
                    <p className="text-muted-foreground truncate max-w-[120px]">{violation.location.split(" - ")[0]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-foreground" />
                  <div>
                    <p className="font-black text-foreground">Timestamp</p>
                    <p className="text-muted-foreground truncate max-w-[120px] font-mono">{new Date(violation.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* License Plate Recognition correction section */}
            <div className="p-3 bg-card border-2 border-border rounded-none space-y-2.5">
              <div className="flex justify-between items-center select-none font-sans">
                <h4 className="text-[9px] font-black text-foreground tracking-widest uppercase">LPR SEGMENTATION</h4>
                <span className="text-[9px] px-1.5 py-0.2 bg-foreground text-background rounded-none font-mono font-bold">
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
                      className="flex-1 px-2 py-0.5 bg-background border-2 border-border text-xs font-mono font-bold rounded-none focus:outline-none focus:border-accent text-foreground uppercase"
                    />
                    <button
                      onClick={handleSavePlate}
                      className="p-1 bg-foreground text-background rounded-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground border border-border cursor-pointer transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-xs font-mono font-extrabold tracking-wider text-background bg-foreground dark:bg-accent dark:text-accent-foreground rounded-none border border-border dark:border-accent px-2 py-0.5">
                      {violation.licensePlate}
                    </span>
                    <button
                      onClick={() => {
                        setTempPlate(violation.licensePlate);
                        setIsEditingPlate(true);
                      }}
                      className="flex items-center gap-1 text-[11px] text-foreground hover:text-accent border-b-2 border-border hover:border-accent transition-all font-black uppercase cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      CORRECT
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Model Metadata */}
            <div className="space-y-1.5">
              <h4 className="text-[9px] font-sans font-black text-foreground tracking-widest uppercase block select-none">MODEL METADATA</h4>
              <div className="bg-card border-2 border-border rounded-none p-3 space-y-2 text-xs font-mono font-bold text-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CLASSIFIER</span>
                  <span className="font-black text-foreground">YOLOv9-CUSTOM</span>
                </div>
                <div className="flex justify-between font-sans">
                  <span className="text-muted-foreground font-mono font-bold">ACCURACY CONF</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="font-bold text-foreground">{(violation.confidence * 100).toFixed(0)}%</span>
                    <div className="w-12 h-1.5 bg-background border border-border rounded-none overflow-hidden">
                      <div className="h-full bg-foreground" style={{ width: `${violation.confidence * 100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">STATUS</span>
                  <span className="font-black text-foreground uppercase">{violation.status}</span>
                </div>
                {violation.speed && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VELOCITY RECORD</span>
                    <span className="font-bold text-accent">{violation.speed}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 pt-3 border-t-2 border-border space-y-1.5 font-sans font-black text-[10px] tracking-widest uppercase">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onUpdateStatus(violation.id, "Confirmed");
                  onClose();
                }}
                disabled={violation.status === "Confirmed"}
                className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-none border-2 border-border transition-colors cursor-pointer ${
                  violation.status === "Confirmed"
                    ? "bg-card text-muted-foreground/30 border-border/25 cursor-not-allowed"
                    : "bg-foreground text-background hover:bg-accent hover:text-accent-foreground hover:border-accent dark:border-border dark:hover:border-accent"
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
                className={`flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-none border-2 border-border transition-colors cursor-pointer ${
                  violation.status === "Rejected"
                    ? "bg-card text-muted-foreground/30 border-border/25 cursor-not-allowed"
                    : "bg-background text-foreground hover:bg-foreground hover:text-background dark:hover:bg-accent dark:hover:text-accent-foreground dark:hover:border-accent"
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
              className={`w-full flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-none border-2 border-border transition-colors cursor-pointer ${
                violation.status === "Pending Review"
                  ? "bg-card text-muted-foreground/30 border-border/25 cursor-not-allowed"
                  : "bg-card text-foreground hover:bg-foreground hover:text-background dark:hover:bg-accent dark:hover:text-accent-foreground dark:hover:border-accent"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              FLAG REVIEW
            </button>

            <button
              onClick={() => alert(`Exporting case file ${violation.id} as PDF/ZIP evidence package.`)}
              className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-none bg-background text-foreground border-2 border-border hover:bg-foreground hover:text-background dark:hover:bg-accent dark:hover:text-accent-foreground dark:hover:border-accent transition-colors mt-1 cursor-pointer"
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

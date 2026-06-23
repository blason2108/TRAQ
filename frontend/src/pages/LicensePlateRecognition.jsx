import React, { useState } from "react";
import { MOCK_LPR_LATEST } from "../data/mockData";
import { Edit3, Check, X, ShieldAlert, Cpu, RefreshCw, Sparkles } from "lucide-react";

export const LicensePlateRecognition = ({ onCorrectPlate, violations }) => {
  const [plates, setPlates] = useState(MOCK_LPR_LATEST);
  const [editingId, setEditingId] = useState(null);
  const [tempPlateText, setTempPlateText] = useState("");

  const handleStartEdit = (id, currentText) => {
    setEditingId(id);
    setTempPlateText(currentText);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = (id) => {
    setPlates((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isCorrected = tempPlateText !== p.plate || p.corrected;
          return {
            ...p,
            originalPlate: p.corrected ? p.originalPlate : p.plate,
            plate: tempPlateText.toUpperCase(),
            corrected: isCorrected
          };
        }
        return p;
      })
    );

    const targetPlate = plates.find((p) => p.id === id);
    if (targetPlate) {
      const match = violations.find((v) => v.licensePlate === targetPlate.plate);
      if (match) {
        onCorrectPlate(match.id, tempPlateText.toUpperCase());
      }
    }

    setEditingId(null);
  };

  // Render a mock crop of the license plate using a high-contrast canvas style
  const renderCroppedPlateImg = (plateText) => {
    return (
      <div className="w-28 h-8 bg-card border-2 border-border rounded-none flex items-center justify-center relative select-none">
        {/* IND Border Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-blue-800 flex flex-col justify-between items-center py-0.5 text-[3.5px] text-white font-bold leading-none">
          <span>IND</span>
          <span className="w-1 h-1 rounded-full bg-orange-400"></span>
        </div>
        {/* Monospace Embossed Font */}
        <span className="font-mono font-extrabold text-xs tracking-wider pl-2 text-foreground">
          {plateText}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-4 font-display text-xs bg-background text-foreground">

      {/* OCR Terminal Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 select-none">
        <div className="panel p-3 border-2 border-border flex items-center gap-3 bg-background">
          <div className="p-2 bg-foreground text-background rounded-none border border-border">
            <Cpu className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-[9px] font-sans font-black text-foreground tracking-widest uppercase">01 // RECOGNITION RATE</p>
            <h4 className="text-base font-black text-foreground mt-0.5">94.8% ACCURACY</h4>
          </div>
        </div>

        <div className="panel p-3 border-2 border-border flex items-center gap-3 bg-background">
          <div className="p-2 bg-foreground text-background rounded-none border border-border">
            <Sparkles className="w-5 h-5 text-background" />
          </div>
          <div>
            <p className="text-[9px] font-sans font-black text-foreground tracking-widest uppercase">02 // INFERENCE LIMIT</p>
            <h4 className="text-base font-black text-foreground mt-0.5">&gt;85.0% CONFIDENCE</h4>
          </div>
        </div>

        <div className="panel p-3 border-2 border-border flex items-center gap-3 bg-background">
          <div className="p-2 bg-foreground text-background rounded-none border border-border">
            <ShieldAlert className="w-5 h-5 text-background" />
          </div>
          <div>
            <p className="text-[9px] font-sans font-black text-foreground tracking-widest uppercase">03 // MANUAL CHANGES</p>
            <h4 className="text-base font-black text-accent mt-0.5">12 OVERRIDES</h4>
          </div>
        </div>
      </div>

      {/* Main Terminal Feed */}
      <div className="panel border-2 border-border p-3 space-y-3 bg-background">
        <div className="flex justify-between items-center mb-1 select-none">
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
              13 // OCR ACTIVE DISPATCH LOGS
            </h3>
            <p className="text-[10px] text-muted-foreground">Review and verify segmentations from active intersection feeds</p>
          </div>
          <button
            onClick={() => alert("Re-indexing OCR streams...")}
            className="p-1.5 rounded-none bg-background hover:bg-foreground text-foreground hover:text-background dark:hover:bg-accent dark:hover:text-accent-foreground border-2 border-border dark:hover:border-accent transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-sans text-xs">
            <thead>
              <tr className="bg-table-header-bg text-table-header-text text-[10px] uppercase font-black tracking-wider border-b-2 border-border">
                <th className="p-3">SEGMENTED PLATE CROP</th>
                <th className="p-3">OCR TRANSLITERATION</th>
                <th className="p-3">MODEL CONF</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">VERIFICATION STATUS</th>
                <th className="p-3 text-right">CORRECTION INTERFACE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs">
              {plates.map((p) => (
                <tr key={p.id} className="hover:bg-card transition-colors">
                  <td className="p-2">
                    {renderCroppedPlateImg(p.plate)}
                  </td>

                  {/* Prediction input / text */}
                  <td className="p-3">
                    {editingId === p.id ? (
                      <input
                        type="text"
                        value={tempPlateText}
                        onChange={(e) => setTempPlateText(e.target.value.toUpperCase())}
                        className="px-2 py-0.5 bg-background border-2 border-border text-xs font-mono font-bold rounded-none focus:outline-none focus:border-accent text-foreground uppercase"
                      />
                    ) : (
                      <span className="font-mono font-extrabold text-xs text-foreground">
                        {p.plate}
                      </span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="p-3 font-mono font-bold">
                    <span className={
                      p.confidence >= 0.95 ? "text-foreground border-b border-border" :
                        p.confidence >= 0.90 ? "text-foreground" :
                          "text-accent"
                    }>
                      {(p.confidence * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="p-3 text-muted-foreground font-mono">
                    {p.timestamp}
                  </td>

                  {/* Correction Status */}
                  <td className="p-3 font-sans font-black text-[9px] tracking-wider uppercase">
                    {p.corrected ? (
                      <span className="text-accent bg-accent/10 border border-accent/30 px-1.5 py-0.5 rounded-none">
                        MANUAL (PREV: {p.originalPlate})
                      </span>
                    ) : (
                      <span className="text-foreground bg-card border border-border/40 px-1.5 py-0.5 rounded-none">
                        MACHINE CONFIRMED
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    {editingId === p.id ? (
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleSave(p.id)}
                          className="p-1 bg-foreground text-background rounded-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent dark:hover:text-accent-foreground border border-border cursor-pointer transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 bg-background text-foreground rounded-none hover:bg-foreground hover:text-background dark:hover:bg-accent dark:hover:text-accent-foreground border border-border cursor-pointer transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(p.id, p.plate)}
                        className="flex items-center gap-1.5 text-xs text-foreground hover:text-accent border-b-2 border-border hover:border-accent transition-all font-black uppercase tracking-wider ml-auto cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        CORRECT REGISTRATION
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

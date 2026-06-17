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
    // Update local state
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

    // If it maps to a violation in the main app state, correct it there too
    const targetPlate = plates.find((p) => p.id === id);
    if (targetPlate) {
      // Find the corresponding violation
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
      <div className="w-28 h-8 bg-[#1F2937] border border-[#2D3A4F] rounded-[4px] flex items-center justify-center relative select-none">
        {/* IND Border Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-blue-800 flex flex-col justify-between items-center py-0.5 text-[3.5px] text-white font-bold leading-none">
          <span>IND</span>
          <span className="w-1 h-1 rounded-full bg-orange-400"></span>
        </div>
        {/* Monospace Embossed Font */}
        <span className="font-mono font-extrabold text-xs tracking-wider pl-2 text-white">
          {plateText}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-3 font-mono">
      
      {/* OCR Terminal Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="panel p-3 border-[#1F2937] flex items-center gap-3">
          <div className="p-2 bg-[#3b82f6]/10 text-[#3b82f6] rounded-[6px] border border-[#3b82f6]/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] uppercase">OCR RECOGNITION RATE</p>
            <h4 className="text-lg font-bold text-white mt-0.5">94.8% ACC</h4>
          </div>
        </div>
        
        <div className="panel p-3 border-[#1F2937] flex items-center gap-3">
          <div className="p-2 bg-[#10b981]/10 text-[#10b981] rounded-[6px] border border-[#10b981]/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] uppercase">DECISION CONF THRESHOLD</p>
            <h4 className="text-lg font-bold text-white mt-0.5">&gt;85.0% CONF</h4>
          </div>
        </div>

        <div className="panel p-3 border-[#1F2937] flex items-center gap-3">
          <div className="p-2 bg-[#f59e0b]/10 text-[#f59e0b] rounded-[6px] border border-[#f59e0b]/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-[#9CA3AF] uppercase">MANUAL OVERRIDES TODAY</p>
            <h4 className="text-lg font-bold text-white mt-0.5">12 OVERRIDES</h4>
          </div>
        </div>
      </div>

      {/* Main Terminal Feed */}
      <div className="panel border-[#1F2937] p-3 space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-[#F9FAFB] uppercase tracking-wider">
              OCR LIVE TRANSLATION DISPATCH LOG
            </h3>
            <p className="text-[10px] text-[#9CA3AF]">Verify character segmentations from active edge cameras</p>
          </div>
          <button
            onClick={() => alert("Re-indexing OCR streams...")}
            className="p-1 rounded-[4px] bg-[#1F2937] hover:bg-[#3b82f6]/10 text-[#3b82f6] border border-[#1F2937] hover:border-[#3b82f6]/30 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">SEGMENTED PLATE CROP</th>
                <th className="p-3">OCR TRANSLITERATION</th>
                <th className="p-3">MODEL CONF</th>
                <th className="p-3">TIMESTAMP</th>
                <th className="p-3">VERIFICATION STATUS</th>
                <th className="p-3 text-right">CORRECTION INTERFACE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-xs">
              {plates.map((p) => (
                <tr key={p.id} className="hover:bg-[#1C2533]/50 transition-colors">
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
                        className="px-2 py-0.5 bg-[#0B1220] border border-[#1F2937] text-xs font-mono font-bold rounded-[4px] focus:outline-none focus:border-[#3b82f6] text-white uppercase"
                      />
                    ) : (
                      <span className="font-extrabold text-white">
                        {p.plate}
                      </span>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="p-3 font-bold">
                    <span className={
                      p.confidence >= 0.95 ? "text-[#10b981]" :
                      p.confidence >= 0.90 ? "text-[#3b82f6]" :
                      "text-[#f59e0b]"
                    }>
                      {(p.confidence * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="p-3 text-[#9CA3AF]">
                    {p.timestamp}
                  </td>

                  {/* Correction Status */}
                  <td className="p-3">
                    {p.corrected ? (
                      <span className="text-[10px] font-bold text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20 px-1.5 py-0.5 rounded-[4px]">
                        MANUAL (PREV: {p.originalPlate})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-1.5 py-0.5 rounded-[4px]">
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
                          className="p-1 bg-[#10b981] text-white rounded-[4px] hover:bg-[#10b981]/80 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-1 bg-[#ef4444] text-white rounded-[4px] hover:bg-[#ef4444]/80 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(p.id, p.plate)}
                        className="flex items-center gap-1.5 text-xs text-[#3b82f6] hover:underline font-bold ml-auto"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
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

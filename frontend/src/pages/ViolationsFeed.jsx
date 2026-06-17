import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Eye, CheckCircle, XCircle, AlertCircle, ChevronDown } from "lucide-react";

export const ViolationsFeed = ({ violations, onViewViolation, onUpdateStatus, searchQuery, setSearchQuery }) => {
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [minConfidence, setMinConfidence] = useState(0.8);
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");

  // Memoize unique violation types for filter dropdown
  const violationTypes = useMemo(() => {
    return ["All", ...new Set(violations.map((v) => v.violationType))];
  }, [violations]);

  const statusTypes = ["All", "Pending Review", "Confirmed", "Rejected"];

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Memoize filter and sort calculations for maximum performance
  const filteredViolations = useMemo(() => {
    return violations
      .filter((v) => {
        const matchesSearch =
          v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.id.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = filterType === "All" || v.violationType === filterType;
        const matchesStatus = filterStatus === "All" || v.status === filterStatus;
        const matchesConfidence = v.confidence >= minConfidence;

        return matchesSearch && matchesType && matchesStatus && matchesConfidence;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (sortField === "timestamp") {
          valA = new Date(valA);
          valB = new Date(valB);
        }

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [violations, searchQuery, filterType, filterStatus, minConfidence, sortField, sortDirection]);

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
    <div className="space-y-3 font-mono">
      
      {/* Search & Filter Toolbar Panel */}
      <div className="panel p-3 border-[#1F2937] space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-[#9CA3AF]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Filter by License Plate, Camera Location, Case ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-[#0B1220] border border-[#1F2937] rounded-[6px] text-xs focus:outline-none focus:border-[#3b82f6] text-white"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter Type */}
            <div className="flex-1 md:flex-initial min-w-[120px] relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-1.5 bg-[#0B1220] border border-[#1F2937] rounded-[6px] text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {violationTypes.map((t) => (
                  <option key={t} value={t}>
                    TYPE: {t.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 text-[#9CA3AF] pointer-events-none" />
            </div>

            {/* Filter Status */}
            <div className="flex-1 md:flex-initial min-w-[130px] relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-1.5 bg-[#0B1220] border border-[#1F2937] rounded-[6px] text-xs font-semibold focus:outline-none cursor-pointer"
              >
                {statusTypes.map((s) => (
                  <option key={s} value={s}>
                    STATUS: {s.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Confidence Threshold slider */}
        <div className="pt-2 border-t border-[#1F2937] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="text-xs font-semibold text-[#9CA3AF]">MIN ACCURACY CONFIDENCE:</span>
            <span className="text-xs font-bold text-[#3b82f6] bg-[#3b82f6]/10 px-1.5 py-0.5 rounded-[4px]">
              {(minConfidence * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex-1 max-w-md">
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full h-1 bg-[#1F2937] rounded-lg appearance-none cursor-pointer accent-[#3b82f6]"
            />
          </div>
        </div>
      </div>

      {/* Violations Table Panel */}
      <div className="panel border-[#1F2937] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#111827] text-[#9CA3AF] border-b border-[#1F2937] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">Frame</th>
                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("id")}>
                  Case ID
                </th>
                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("timestamp")}>
                  Timestamp
                </th>
                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("location")}>
                  Camera/Location
                </th>
                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("violationType")}>
                  Violation Type
                </th>
                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("licensePlate")}>
                  Plate OCR
                </th>
                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("confidence")}>
                  Confidence
                </th>
                <th className="p-3 cursor-pointer hover:text-white" onClick={() => handleSort("status")}>
                  Status
                </th>
                <th className="p-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F2937] text-xs">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-6 text-center text-[#9CA3AF] font-medium font-sans">
                    NO DISPATCH ENTRIES MATCHING SELECTION
                  </td>
                </tr>
              ) : (
                filteredViolations.map((viol) => (
                  <tr
                    key={viol.id}
                    className="hover:bg-[#1C2533]/50 transition-colors group"
                  >
                    {/* SVG Frame Thumbnail */}
                    <td className="p-2">
                      <div className="w-12 h-8 rounded-[4px] bg-[#0B1220] border border-[#1F2937] flex items-center justify-center relative overflow-hidden">
                        <svg viewBox="0 0 100 60" className="w-full h-full opacity-50">
                          <rect width="100%" height="100%" fill={viol.vehicleType === "Motorcycle" ? "#1A233D" : "#1A2D3D"} />
                          <circle cx="50" cy="30" r="10" fill="#334155" />
                        </svg>
                      </div>
                    </td>

                    {/* Case ID */}
                    <td className="p-3 font-bold text-white">
                      {viol.id}
                    </td>

                    {/* Timestamp */}
                    <td className="p-3 text-[#9CA3AF]">
                      <div>{new Date(viol.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{new Date(viol.timestamp).toLocaleTimeString()}</div>
                    </td>

                    {/* Location */}
                    <td className="p-3 font-bold text-[#D1D5DB]">
                      {viol.location}
                    </td>

                    {/* Violation Type */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold border rounded-[4px] ${getViolationBadgeStyle(viol.violationType)}`}>
                        {viol.violationType.toUpperCase()}
                      </span>
                    </td>

                    {/* License Plate OCR */}
                    <td className="p-3">
                      <span className="font-extrabold tracking-wider px-1.5 py-0.5 bg-[#1F2937] rounded-[4px] border border-[#2D3A4F] text-white">
                        {viol.licensePlate}
                      </span>
                    </td>

                    {/* Confidence bar */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">
                          {(viol.confidence * 100).toFixed(0)}%
                        </span>
                        <div className="w-10 h-1 bg-[#1F2937] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              viol.confidence >= 0.9 ? "bg-[#10b981]" : "bg-[#f59e0b]"
                            }`}
                            style={{ width: `${viol.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-[4px] border ${
                          viol.status === "Confirmed"
                            ? "bg-[#10b981]/10 text-[#10b981] border-[#10b981]/25"
                            : viol.status === "Rejected"
                            ? "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/25"
                            : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/25"
                        }`}
                      >
                        {viol.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewViolation(viol)}
                          className="p-1 rounded-[4px] bg-[#1F2937] hover:bg-[#3b82f6]/10 text-[#3b82f6] border border-[#1F2937] hover:border-[#3b82f6]/30 transition-all"
                          title="View Case details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onUpdateStatus(viol.id, viol.status === "Confirmed" ? "Rejected" : "Confirmed")}
                          className="p-1 rounded-[4px] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors border border-transparent hover:border-[#1F2937] hidden group-hover:block"
                          title="Verify Toggle"
                        >
                          {viol.status === "Confirmed" ? <XCircle className="w-3.5 h-3.5 text-[#ef4444]" /> : <CheckCircle className="w-3.5 h-3.5 text-[#10b981]" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

import React, { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Eye, CheckCircle, XCircle, ChevronDown } from "lucide-react";

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
      case "No Helmet": return "text-accent border-accent bg-background";
      case "Speeding": return "text-accent border-accent bg-background";
      case "No Seatbelt": return "text-foreground border-border bg-card";
      case "Running Red Light": return "text-red-600 dark:text-red-400 border-red-600 dark:border-red-500/50 bg-red-50 dark:bg-red-950/30";
      case "Triple Riding": return "text-accent border-accent bg-card";
      case "Phone Usage": return "text-foreground border-border bg-background";
      default: return "text-foreground border-border bg-background";
    }
  };

  return (
    <div className="space-y-4 font-display text-xs bg-background text-foreground">

      {/* Search & Filter Toolbar Panel */}
      <div className="panel p-3 border-2 border-border bg-background space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-foreground">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="SEARCH BY PLATE ID, CAMERA, CASE ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-search pr-3 py-1 bg-background border-2 border-border rounded-none text-xs focus:outline-none focus:border-accent text-foreground uppercase placeholder-muted-foreground/60"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Filter Type */}
            <div className="flex-1 md:flex-initial min-w-[140px] relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-1.5 bg-background border-2 border-border rounded-none text-xs font-black focus:outline-none cursor-pointer uppercase text-foreground"
              >
                {violationTypes.map((t) => (
                  <option key={t} value={t} className="bg-background text-foreground">
                    TYPE: {t.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-2 text-foreground pointer-events-none" />
            </div>

            {/* Filter Status */}
            <div className="flex-1 md:flex-initial min-w-[140px] relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-1.5 bg-background border-2 border-border rounded-none text-xs font-black focus:outline-none cursor-pointer uppercase text-foreground"
              >
                {statusTypes.map((s) => (
                  <option key={s} value={s} className="bg-background text-foreground">
                    STATUS: {s.toUpperCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-2.5 top-2 text-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Confidence Threshold slider */}
        <div className="pt-2.5 border-t-2 border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-background">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
            <span className="text-[10px] font-sans font-black text-foreground tracking-widest uppercase">MIN ACCURACY THRESHOLD:</span>
            <span className="text-xs font-mono font-bold text-background bg-foreground px-2 py-0.5 border border-border">
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
              className="w-full h-1.5 bg-foreground border-2 border-border rounded-none appearance-none cursor-pointer accent-accent"
            />
          </div>
        </div>
      </div>

      {/* Violations Table Panel */}
      <div className="panel border-2 border-border overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-sans text-xs">
            <thead>
              <tr className="bg-table-header-bg text-table-header-text text-[10px] uppercase font-black tracking-wider border-b-2 border-border">
                <th className="p-3 cursor-pointer hover:text-accent" onClick={() => handleSort("id")}>
                  Case ID
                </th>
                <th className="p-3 cursor-pointer hover:text-accent" onClick={() => handleSort("timestamp")}>
                  Timestamp
                </th>
                <th className="p-3 cursor-pointer hover:text-accent" onClick={() => handleSort("location")}>
                  Camera/Location
                </th>
                <th className="p-3 cursor-pointer hover:text-accent" onClick={() => handleSort("violationType")}>
                  Violation Type
                </th>
                <th className="p-3 cursor-pointer hover:text-accent" onClick={() => handleSort("licensePlate")}>
                  Plate OCR
                </th>
                <th className="p-3 cursor-pointer hover:text-accent" onClick={() => handleSort("confidence")}>
                  Confidence
                </th>
                <th className="p-3 cursor-pointer hover:text-accent" onClick={() => handleSort("status")}>
                  Status
                </th>
                <th className="p-3 text-center">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-muted-foreground font-black uppercase font-sans">
                    NO DISPATCH ENTRIES MATCHING SELECTION
                  </td>
                </tr>
              ) : (
                filteredViolations.map((viol) => (
                  <tr
                    key={viol.id}
                    className="hover:bg-card transition-colors group"
                  >


                    {/* Case ID */}
                    <td className="p-3 font-mono font-bold text-foreground">
                      {viol.id}
                    </td>

                    {/* Timestamp */}
                    <td className="p-3 text-muted-foreground font-mono">
                      <div>{new Date(viol.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{new Date(viol.timestamp).toLocaleTimeString()}</div>
                    </td>

                    {/* Location */}
                    <td className="p-3 font-bold text-foreground uppercase">
                      {viol.location}
                    </td>

                    {/* Violation Type */}
                    <td className="p-3">
                      <span className={`px-2 py-0.5 text-[9px] font-black border rounded-none uppercase tracking-wider whitespace-nowrap ${getViolationBadgeStyle(viol.violationType)}`}>
                        {viol.violationType}
                      </span>
                    </td>

                    {/* License Plate OCR */}
                    <td className="p-3">
                      <span className="font-mono font-extrabold tracking-wider px-2 py-0.5 bg-foreground text-background dark:bg-accent dark:text-accent-foreground rounded-none border border-border dark:border-accent">
                        {viol.licensePlate}
                      </span>
                    </td>

                    {/* Confidence bar */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="font-bold text-foreground">
                          {(viol.confidence * 100).toFixed(0)}%
                        </span>
                        <div className="w-10 h-1.5 bg-card border border-border rounded-none overflow-hidden">
                          <div
                            className={`h-full ${viol.confidence >= 0.9 ? "bg-foreground" : "bg-accent"}`}
                            style={{ width: `${viol.confidence * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-none border uppercase tracking-widest ${
                          viol.status === "Confirmed"
                            ? "bg-foreground text-background border-border"
                            : viol.status === "Rejected"
                              ? "bg-card text-muted-foreground border-border/50 line-through"
                              : "bg-accent/10 text-accent border-accent/30 animate-pulse"
                        }`}
                      >
                        {viol.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewViolation(viol)}
                          className="p-1 rounded-none bg-background hover:bg-foreground text-foreground hover:text-background dark:hover:bg-accent dark:hover:text-accent-foreground border-2 border-border dark:hover:border-accent transition-all cursor-pointer"
                          title="View Case details"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

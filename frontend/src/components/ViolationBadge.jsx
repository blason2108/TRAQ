import React from "react";

export const ViolationBadge = ({ type }) => {
  // Map violation types to styles
  const getBadgeStyle = (violation) => {
    switch (violation) {
      case "No Helmet":
        return "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-500/30";
      case "Speeding":
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-500/30";
      case "No Seatbelt":
        return "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-500/30";
      case "Running Red Light":
        return "bg-red-500/10 text-red-600 border border-red-500/20 dark:bg-red-950/30 dark:text-red-400 dark:border-red-500/30";
      case "Triple Riding":
        return "bg-violet-500/10 text-violet-600 border border-violet-500/20 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-500/30";
      case "Phone Usage":
        return "bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-500/30";
      default:
        return "bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:bg-slate-950/30 dark:text-slate-400 dark:border-slate-500/30";
    }
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full tracking-wide inline-flex items-center gap-1.5 ${getBadgeStyle(type)}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {type}
    </span>
  );
};

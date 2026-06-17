import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const KPICard = ({ title, value, change, isPositive, icon: Icon, description }) => {
  return (
    <div className="glass-card p-6 rounded-2xl shadow-sm border transition-all duration-300 hover:shadow-md hover:scale-[1.01] flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="text-3xl font-bold font-heading mt-2 text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary dark:bg-brand-primary/20 dark:text-blue-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
        {change !== undefined && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                : "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {Math.abs(change)}%
          </span>
        )}
        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
          {description || "vs yesterday"}
        </span>
      </div>
    </div>
  );
};

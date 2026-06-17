import React from "react";
import { LayoutDashboard, AlertCircle, FileSpreadsheet, BarChart3, Settings, ShieldAlert, ChevronLeft, ChevronRight, LogOut } from "lucide-react";

export const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed, onLogout }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "violations", label: "Violations Feed", icon: AlertCircle, count: 3 },
    { id: "lpr", label: "LPR Terminal", icon: FileSpreadsheet },
    { id: "analytics", label: "Analytics & Reports", icon: BarChart3 },
    { id: "settings", label: "Model & Settings", icon: Settings }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-30 flex flex-col justify-between border-r border-[#1F2937] bg-[#111827] transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1F2937]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 rounded-[6px] bg-[#1F2937] border border-[#2A374A] flex items-center justify-center text-[#ef4444]">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            {!collapsed && (
              <div className="transition-all duration-300">
                <h1 className="text-xs font-bold tracking-wider text-[#F9FAFB]">
                  TRAFFICVISION
                </h1>
                <p className="text-[9px] text-[#9CA3AF] font-mono tracking-widest leading-none mt-0.5">
                  CORE CONTROL // V2.4
                </p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-[6px] hover:bg-[#1F2937] text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors hidden md:block border border-transparent hover:border-[#1F2937]"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2.5 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-[6px] text-xs font-semibold transition-all duration-150 group relative ${
                  isActive
                    ? "bg-[#1F2937] text-[#F9FAFB] border-l-2 border-[#3b82f6] rounded-l-none"
                    : "text-[#9CA3AF] hover:bg-[#1C2533] hover:text-[#F9FAFB]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-[#3b82f6]" : "text-[#9CA3AF]"}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {item.count && !collapsed && (
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-[4px] ${
                      isActive
                        ? "bg-[#3b82f6] text-white"
                        : "bg-[#ef4444] text-white"
                    }`}
                  >
                    {item.count}
                  </span>
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-[#111827] border border-[#1F2937] text-white text-[10px] rounded-[6px] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md font-medium z-50 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / Logout */}
      <div className="p-2.5 border-t border-[#1F2937]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-semibold text-[#ef4444] hover:bg-[#ef4444]/10 transition-all duration-150 group relative"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>System Exit</span>}
          {collapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-[#ef4444] text-white text-[10px] rounded-[6px] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 shadow-md font-medium z-50 whitespace-nowrap">
              System Exit
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

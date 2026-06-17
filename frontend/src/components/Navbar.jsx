import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Bell, Search, Settings, LogOut, Check, Terminal } from "lucide-react";

export const Navbar = ({ activeTab, searchQuery, setSearchQuery, notifications, onMarkAllRead, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getTabLabel = () => {
    switch (activeTab) {
      case "dashboard":
        return "COMMAND CENTER SYSTEM OVERVIEW";
      case "violations":
        return "LIVE VIOLATION DISPATCH FEED";
      case "lpr":
        return "LPR OCR TRANSLATION TERMINAL";
      case "analytics":
        return "STATISTICAL INCIDENT ANALYSIS";
      case "settings":
        return "CLASSIFIER LOGIC CONFIGURATION";
      default:
        return "TRAQ SYSTEM CONTROLLER";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 border-b border-[#1F2937] bg-[#111827] sticky top-0 z-20 px-4 flex items-center justify-between text-[#F9FAFB]">
      
      {/* Title */}
      <div className="flex items-center gap-2">
        <Terminal className="w-4.5 h-4.5 text-[#3b82f6]" />
        <h2 className="text-sm font-bold tracking-wider text-[#F9FAFB] uppercase font-mono">
          {getTabLabel()}
        </h2>
      </div>

      {/* Center/Right Actions */}
      <div className="flex items-center gap-3">
        
        {/* Search Input */}
        <div className="relative max-w-xs hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-[#9CA3AF]" />
          </div>
          <input
            type="text"
            placeholder="Search plates, cameras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 pl-8 pr-2 py-1 bg-[#1F2937] border border-[#1F2937] text-white text-xs font-mono rounded-[6px] focus:outline-none focus:border-[#3b82f6]"
          />
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-[6px] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] transition-colors border border-transparent hover:border-[#1F2937]"
          title="Toggle UI Contrast"
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-[#3b82f6]" />}
        </button>

        {/* Alert Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-1.5 rounded-[6px] text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1F2937] transition-colors relative border border-transparent hover:border-[#1F2937]"
          >
            <Bell className="w-3.5 h-3.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#ef4444] rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#111827] border border-[#1F2937] rounded-[6px] overflow-hidden z-50 shadow-lg">
              <div className="px-3 py-2 border-b border-[#1F2937] flex justify-between items-center bg-[#1C2533]">
                <span className="text-xs font-bold text-[#F9FAFB] font-mono tracking-wider">ACTIVE INCIDENT ALERTS</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      onMarkAllRead();
                      setShowNotifications(false);
                    }}
                    className="text-[10px] text-[#3b82f6] hover:underline font-mono"
                  >
                    ACKNOWLEDGE ALL
                  </button>
                )}
              </div>
              <div className="divide-y divide-[#1F2937] max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-xs text-[#9CA3AF] font-mono">NO ACTIVE INCIDENTS</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-2.5 text-left transition-colors hover:bg-[#1C2533] ${
                        notif.read ? "opacity-60" : "bg-[#ef4444]/5"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-[11px] font-mono text-[#D1D5DB] leading-tight">
                          {notif.text}
                        </p>
                        <span className="text-[9px] text-[#9CA3AF] font-mono whitespace-nowrap">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-0.5 rounded-[6px] hover:bg-[#1F2937] border border-transparent hover:border-[#1F2937] transition-colors"
          >
            <div className="w-6 h-6 rounded-[4px] bg-[#1F2937] text-[#D1D5DB] border border-[#2A374A] font-mono font-bold flex items-center justify-center text-[10px]">
              OP
            </div>
            <div className="text-left hidden md:block pr-1.5">
              <p className="text-[11px] font-bold text-[#F9FAFB] leading-none">Dispatcher 402</p>
              <p className="text-[9px] text-[#9CA3AF] font-mono mt-0.5 uppercase tracking-wide">SOC Supervisor</p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-[#1F2937] rounded-[6px] overflow-hidden z-50 p-1 shadow-lg">
              <div className="px-2.5 py-1.5 border-b border-[#1F2937] mb-1">
                <p className="text-[11px] font-mono font-bold text-white">Alan V. (ID: 0402)</p>
                <p className="text-[9px] text-[#9CA3AF] font-mono">alan.v@enforcement.gov</p>
              </div>
              <button
                onClick={() => {
                  alert("Accessing System Settings...");
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#D1D5DB] hover:bg-[#1F2937] rounded-[4px] transition-colors font-mono"
              >
                <Settings className="w-3.5 h-3.5" />
                CONFIG PROFILE
              </button>
              <div className="border-t border-[#1F2937] my-1"></div>
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 rounded-[4px] transition-colors font-mono"
              >
                <LogOut className="w-3.5 h-3.5" />
                LOGOUT CONSOLE
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

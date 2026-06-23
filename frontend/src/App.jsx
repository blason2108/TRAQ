import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Login } from "./pages/Login";
import { LandingPage } from "./pages/LandingPage";
import { DashboardOverview } from "./pages/DashboardOverview";
import { ViolationsFeed } from "./pages/ViolationsFeed";
import { LicensePlateRecognition } from "./pages/LicensePlateRecognition";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { EvidenceModal } from "./components/EvidenceModal";
import { MOCK_VIOLATIONS, MOCK_NOTIFICATIONS } from "./data/mockData";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Violations list state so updates reflect dynamically
  const [violations, setViolations] = useState([]);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // Sync violations from backend on load
  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/violations");
        if (res.ok) {
          const data = await res.json();
          const mapped = data.violations.map((v) => {
            // Map violationType
            let vType = v.infraction;
            if (v.infraction === "Helmet non-compliance") vType = "No Helmet";
            else if (v.infraction === "Triple riding") vType = "Triple Riding";
            else if (v.infraction === "Red-light violation") vType = "Running Red Light";
            else if (v.infraction === "Stop-line violation") vType = "Running Red Light";
            else if (v.infraction === "Wrong-side driving") vType = "Wrong-side driving";
            else if (v.infraction === "Illegal parking") vType = "Illegal parking";
            
            // Map status casing
            let status = "Pending Review";
            if (v.status === "Confirmed" || v.status === "CONFIRMED") status = "Confirmed";
            else if (v.status === "Rejected" || v.status === "REJECTED") status = "Rejected";

            // Parse confidence
            let confVal = parseFloat(v.conf) / 100;
            if (isNaN(confVal)) confVal = 0.95;

            // Simulated timestamp
            const mockTime = new Date();
            const offsetSec = parseFloat(v.time) || 0;
            mockTime.setSeconds(mockTime.getSeconds() - offsetSec);
            const timestamp = mockTime.toISOString();

            return {
              id: v.case_id,
              timestamp: timestamp,
              location: v.location || "Koramangala 80ft Rd - Cam 04",
              gps: "12.9352° N, 77.6245° E",
              vehicleType: v.infraction?.toLowerCase().includes("helmet") || v.infraction?.toLowerCase().includes("triple") ? "Motorcycle" : "Car",
              violationType: vType,
              severity: vType === "Running Red Light" || vType === "Speeding" || vType === "Wrong-side driving" ? "high" : "medium",
              licensePlate: v.plate_ocr || "UNKNOWN",
              ocrConfidence: 0.90,
              confidence: confVal,
              status: status,
              annotatedBoxes: [
                { type: "vehicle", label: "Detected Vehicle", x: 100, y: 120, w: 300, h: 240, color: "#3b82f6" },
                { type: "violation", label: `${vType} Detected`, x: 150, y: 90, w: 200, h: 220, color: "#ef4444" }
              ],
              cameraDetails: {
                model: "HikVision PTZ-4K",
                fps: 30,
                resolution: "3840x2160"
              },
              inferenceTime: "40ms",
              video_url: v.video_url ? (v.video_url.startsWith("http") ? v.video_url : `http://localhost:8000${v.video_url}`) : null
            };
          });
          // Combine with mock violations
          setViolations([...mapped, ...MOCK_VIOLATIONS]);
        } else {
          setViolations(MOCK_VIOLATIONS);
        }
      } catch (err) {
        console.error("Failed to load violations from backend:", err);
        setViolations(MOCK_VIOLATIONS);
      }
    };
    fetchViolations();

    // Set up polling to refresh database entries every 5 seconds
    const interval = setInterval(fetchViolations, 5000);
    return () => clearInterval(interval);
  }, [reloadTrigger]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    alert("Authentication bypass is active. Session is locked in assessor mode.");
  };

  const handleViewViolation = (violation) => {
    setSelectedViolation(violation);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );

    if (selectedViolation && selectedViolation.id === id) {
      setSelectedViolation((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      const dbStatus = newStatus.toUpperCase();
      await fetch(`http://localhost:8000/api/violations/${id}/status?status=${encodeURIComponent(dbStatus)}`, {
        method: "PATCH"
      });
    } catch (err) {
      console.error("Failed to update status on server:", err);
    }
  };

  const handleCorrectPlate = async (id, newPlate) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, licensePlate: newPlate, ocrConfidence: 1.0 } : v))
    );

    if (selectedViolation && selectedViolation.id === id) {
      setSelectedViolation((prev) => ({ ...prev, licensePlate: newPlate, ocrConfidence: 1.0 }));
    }

    try {
      await fetch(`http://localhost:8000/api/violations/${id}/plate?plate=${encodeURIComponent(newPlate)}`, {
        method: "PATCH"
      });
    } catch (err) {
      console.error("Failed to update plate on server:", err);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Login bypass active. Dashboard renders directly.

  // Render tab contents
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardOverview
            violations={violations}
            onViewViolation={handleViewViolation}
            onNavigateToViolations={() => setActiveTab("violations")}
            onUpdateStatus={handleUpdateStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onReload={() => setReloadTrigger((prev) => prev + 1)}
          />
        );
      case "violations":
        return (
          <ViolationsFeed
            violations={violations}
            onViewViolation={handleViewViolation}
            onUpdateStatus={handleUpdateStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case "lpr":
        return (
          <LicensePlateRecognition
            onCorrectPlate={handleCorrectPlate}
            violations={violations}
          />
        );
      case "analytics":
        return <Analytics violations={violations} onViewViolation={handleViewViolation} />;
      case "settings":
        return <Settings />;
      default:
        return (
          <DashboardOverview
            violations={violations}
            onViewViolation={handleViewViolation}
            onNavigateToViolations={() => setActiveTab("violations")}
            onUpdateStatus={handleUpdateStatus}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onReload={() => setReloadTrigger((prev) => prev + 1)}
          />
        );
    }
  };

  if (showLanding) {
    return <LandingPage onEnterDashboard={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans swiss-noise">

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
        onShowLanding={() => setShowLanding(true)}
      />

      {/* Main Body */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 bg-background border-l-2 border-border ${collapsed ? "pl-20" : "pl-20 md:pl-64"
          }`}
      >
        <Navbar
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onLogout={handleLogout}
          onShowLanding={() => setShowLanding(true)}
        />

        {/* Dynamic tab viewport */}
        <main className="flex-1 p-4 w-full mx-auto bg-background swiss-grid-pattern border-t-2 border-border">
          {renderTabContent()}
        </main>
      </div>

      {/* Modal Detailed Evidence Overlay */}
      {selectedViolation && (
        <EvidenceModal
          violation={selectedViolation}
          onClose={() => setSelectedViolation(null)}
          onUpdateStatus={handleUpdateStatus}
          onCorrectPlate={handleCorrectPlate}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

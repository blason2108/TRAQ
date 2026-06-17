import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Login } from "./pages/Login";
import { DashboardOverview } from "./pages/DashboardOverview";
import { ViolationsFeed } from "./pages/ViolationsFeed";
import { LicensePlateRecognition } from "./pages/LicensePlateRecognition";
import { Analytics } from "./pages/Analytics";
import { Settings } from "./pages/Settings";
import { EvidenceModal } from "./components/EvidenceModal";
import { MOCK_VIOLATIONS, MOCK_NOTIFICATIONS } from "./data/mockData";

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedViolation, setSelectedViolation] = useState(null);
  
  // Violations list state so updates reflect dynamically
  const [violations, setViolations] = useState(MOCK_VIOLATIONS);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    alert("Authentication bypass is active. Session is locked in assessor mode.");
  };

  const handleViewViolation = (violation) => {
    setSelectedViolation(violation);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus } : v))
    );

    // Update the currently viewed violation in modal if applicable
    if (selectedViolation && selectedViolation.id === id) {
      setSelectedViolation((prev) => ({ ...prev, status: newStatus }));
    }
  };

  const handleCorrectPlate = (id, newPlate) => {
    setViolations((prev) =>
      prev.map((v) => (v.id === id ? { ...v, licensePlate: newPlate, ocrConfidence: 1.0 } : v))
    );

    // Update modal state too
    if (selectedViolation && selectedViolation.id === id) {
      setSelectedViolation((prev) => ({ ...prev, licensePlate: newPlate, ocrConfidence: 1.0 }));
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Simulated auto-streaming background generator (adds realism to live feed)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      // Create a random violation stream occasionally
      const r = Math.random();
      if (r > 0.7) {
        const violationTypesList = ["No Helmet", "Speeding", "No Seatbelt", "Triple Riding", "Running Red Light", "Phone Usage"];
        const randomType = violationTypesList[Math.floor(Math.random() * violationTypesList.length)];
        const locationsList = [
          "Silk Board Junction - Cam 01",
          "Koramangala 80ft Rd - Cam 04",
          "Outer Ring Road - Cam 12",
          "Indiranagar 100ft Rd - Cam 09",
          "Whitefield Main Road - Cam 07"
        ];
        const randomLoc = locationsList[Math.floor(Math.random() * locationsList.length)];
        const vehiclesList = ["Motorcycle", "Car", "SUV", "Truck"];
        const randomVeh = vehiclesList[Math.floor(Math.random() * vehiclesList.length)];
        const suffix = Math.floor(1000 + Math.random() * 9000);
        const randomPlate = `KA03EX${suffix}`;

        const newViolation = {
          id: `VIOL-2026-00${violations.length + 1}`,
          timestamp: new Date().toISOString(),
          location: randomLoc,
          gps: "12.9352° N, 77.6245° E",
          vehicleType: randomVeh,
          violationType: randomType,
          severity: randomType === "Speeding" || randomType === "Running Red Light" ? "high" : "medium",
          licensePlate: randomPlate,
          ocrConfidence: 0.9 + Math.random() * 0.1,
          confidence: 0.85 + Math.random() * 0.14,
          status: "Pending Review",
          annotatedBoxes: [
            { type: "vehicle", label: `${randomVeh} (96%)`, x: 100, y: 120, w: 300, h: 240, color: "#3b82f6" },
            { type: "violation", label: `${randomType} Detected`, x: 150, y: 90, w: 200, h: 220, color: "#ef4444" }
          ],
          cameraDetails: {
            model: "HikVision PTZ-4K",
            fps: 30,
            resolution: "3840x2160"
          },
          inferenceTime: "40ms"
        };

        setViolations((prev) => [newViolation, ...prev]);

        // Add a fresh notification
        const newNotif = {
          id: Date.now(),
          text: `Alert: ${randomType} detected at ${randomLoc.split(" - ")[0]} (${randomPlate})`,
          type: "high",
          time: "Just now",
          read: false
        };
        setNotifications((prev) => [newNotif, ...prev]);
      }
    }, 15000); // Trigger every 15 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn, violations.length]);

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
        return <Analytics />;
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
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0B1220] text-[#F9FAFB] font-sans">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 bg-[#0B1220] ${
          collapsed ? "pl-20" : "pl-20 md:pl-64"
        }`}
      >
        <Navbar
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          notifications={notifications}
          onMarkAllRead={handleMarkAllRead}
          onLogout={handleLogout}
        />

        {/* Dynamic tab viewport */}
        <main className="flex-1 p-4 w-full mx-auto bg-[#0B1220]">
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

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import * as esri from "esri-leaflet";
import { Search, Map as MapIcon, Layers, Compass, Loader2, Maximize2, Minimize2 } from "lucide-react";
import { searchPropertyBySurveyNumber } from "../utils/arcgisUtils";

// Import Leaflet CSS from node_modules
import "leaflet/dist/leaflet.css";

// Configure default icon assets to prevent broken marker issues in production build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/**
 * Premium Brutalist ArcGIS and Leaflet Map Component
 */
export const ArcGISMap = ({ violations, activePingCoord, onViewViolation }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const dynamicLayerRef = useRef(null);
  const highlightLayerRef = useRef(null);
  const markersRef = useRef({});

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  
  // Layer visibility state
  const [showLanduse, setShowLanduse] = useState(false);
  const [showRoads, setShowRoads] = useState(false);
  const [showBMA, setShowBMA] = useState(false);

  // Dropdown and Fullscreen state
  const [showLayersDropdown, setShowLayersDropdown] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);

  // Handle resizing Leaflet canvas when enlarging map view
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map) {
      setTimeout(() => {
        map.invalidateSize({ animate: true });
      }, 350); // Give css transitions/backdrops time to draw
    }
  }, [isEnlarged]);

  // Hardcoded Camera data mapping real GPS positions to intersections
  const cameras = [
    { id: "CAM-01", name: "MG Road Crossing (Cam 01)", lat: 12.9740, lng: 77.6074, location: "MG Road Crossing - Cam 01" },
    { id: "CAM-02", name: "Silk Board Junction (Cam 02)", lat: 12.9176, lng: 77.6244, location: "Silk Board Junction - Cam 02" },
    { id: "CAM-04", name: "Koramangala 80ft Rd (Cam 04)", lat: 12.9352, lng: 77.6245, location: "Koramangala 80ft Rd - Cam 04" },
    { id: "CAM-07", name: "Whitefield Main Rd (Cam 07)", lat: 12.9698, lng: 77.7500, location: "Whitefield Main Road - Cam 07" },
    { id: "CAM-09", name: "Indiranagar 100ft Rd (Cam 09)", lat: 12.9719, lng: 77.6412, location: "Indiranagar 100ft Rd - Cam 09" },
    { id: "CAM-12", name: "Outer Ring Road (Cam 12)", lat: 12.9279, lng: 77.6812, location: "Outer Ring Road - Cam 12" },
    { id: "CAM-18", name: "Electronic City Expressway", lat: 12.8450, lng: 77.6766, location: "Electronic City Expressway - Cam 18", offline: true }
  ];

  // Mock recent traffic violations scattered across Bangalore
  const mockRecentViolations = [
    { id: "MOCK-V1", lat: 12.9562, lng: 77.6015, type: "No Helmet", plate: "KA03HA4592", time: "2 min ago", location: "Richmond Town" },
    { id: "MOCK-V2", lat: 12.9304, lng: 77.6146, type: "Triple Riding", plate: "KA01EE8821", time: "5 min ago", location: "Koramangala" },
    { id: "MOCK-V3", lat: 12.9784, lng: 77.6408, type: "Speeding", plate: "KA53MB8820", time: "8 min ago", location: "Indiranagar" },
    { id: "MOCK-V4", lat: 12.9260, lng: 77.6762, type: "Running Red Light", plate: "MH12GP9001", time: "11 min ago", location: "Bellandur" },
    { id: "MOCK-V5", lat: 12.9100, lng: 77.6320, type: "No Seatbelt", plate: "DL4CAF1234", time: "14 min ago", location: "HSR Layout" },
  ];

  // Base URL from env
  const ARCGIS_URL = import.meta.env.VITE_ARCGIS_BGIS_MASTERPLAN_URL || 
    "https://kgis.ksrsac.in/kgismaps1/rest/services/Bangalore_GIS/BGIS_Masterplan/MapServer";

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize leaflet map centered over Central Bangalore
    const map = L.map(mapContainerRef.current, {
      center: [12.9430, 77.6412],
      zoom: 12,
      zoomControl: false, // Custom position control
      attributionControl: false // Disable standard to keep clean hud look
    });
    mapInstanceRef.current = map;

    // Add zoom control at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Render World Street Map tiles (instead of dark themed)
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
    }).addTo(map);

    // Initialize Layer Group for highlights
    const highlightGroup = L.layerGroup().addTo(map);
    highlightLayerRef.current = highlightGroup;

    // Load BGIS Masterplan dynamic server layer
    const dynamicLayer = esri.dynamicMapLayer({
      url: ARCGIS_URL,
      opacity: 0.65,
      useCors: true,
      layers: [] // Switched off by default
    }).addTo(map);
    dynamicLayerRef.current = dynamicLayer;

    // click identifier listener
    map.on("click", (e) => {
      // Clear previous search highlight outlines
      highlightGroup.clearLayers();

      // Query MapServer attributes at Lat/Lng point clicked
      dynamicLayer.identify()
        .on(map)
        .at(e.latlng)
        .run((error, featureCollection) => {
          if (error) {
            console.error("GIS Identify error:", error);
            return;
          }
          if (featureCollection.features && featureCollection.features.length > 0) {
            // Find the most detailed layer matched (Landuse: 3, RoadWidth: 2, BMA: 1)
            const sortedFeatures = [...featureCollection.features].sort((a, b) => b.layerId - a.layerId);
            const feature = sortedFeatures[0];
            const props = feature.properties;
            
            let title = "GIS Node Info";
            let content = "";

            if (feature.layerId === 3) {
              title = "Proposed Land Use (BDA)";
              content = `
                <div class="font-mono text-[10px] space-y-1.5 text-foreground">
                  <div><span class="text-muted-foreground">ZONE ID:</span> <span class="font-bold text-blue-500">${props.PLU_BDA || "N/A"}</span></div>
                  <div><span class="text-muted-foreground">CATEGORY:</span> <span class="font-bold">${props.PLU_Tp_sur || "General Landuse"}</span></div>
                  <div><span class="text-muted-foreground">TYPE CODE:</span> <span>${props.PLU_Tp_pro || "N/A"}</span></div>
                  <div><span class="text-muted-foreground">AREA SIZE:</span> <span>${props["SHAPE.STArea()"] ? (parseFloat(props["SHAPE.STArea()"]) / 1000).toFixed(1) + "k sq m" : "N/A"}</span></div>
                </div>
              `;
            } else if (feature.layerId === 2) {
              title = "Proposed Road Width";
              content = `
                <div class="font-mono text-[10px] space-y-1.5 text-foreground">
                  <div><span class="text-muted-foreground">WIDTH:</span> <span class="font-bold text-blue-500">${props.RR_WIDTH_P || "N/A"} Meters</span></div>
                  <div><span class="text-muted-foreground">HIERARCHY:</span> <span class="font-bold">${props.RR_TP_HIER || "Local"}</span></div>
                  <div><span class="text-muted-foreground">ROAD TYPE:</span> <span>${props.RR_TP_TYPE || "Proposed"}</span></div>
                </div>
              `;
            } else {
              title = "BMA Boundary";
              content = `
                <div class="font-mono text-[10px] text-foreground">
                  <span class="text-muted-foreground">REGION:</span> Region Area
                </div>
              `;
            }

            const popupContent = `
              <div class="p-1 font-sans text-xs">
                <div class="font-black border-b border-border pb-1.5 mb-2 text-foreground uppercase tracking-wider text-[11px]">${title}</div>
                ${content}
              </div>
            `;

            L.popup()
              .setLatLng(e.latlng)
              .setContent(popupContent)
              .openOn(map);
          }
        });
    });

    // Draw Mock Recent Violation Red Dots
    mockRecentViolations.forEach((viol) => {
      const icon = L.divIcon({
        className: "mock-violation-marker",
        html: `
          <div class="relative flex items-center justify-center" style="width: 14px; height: 14px;">
            <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75" style="width: 14px; height: 14px;"></div>
            <div style="width: 8px; height: 8px; background-color: #ef4444; border: 1.5px solid var(--background); border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker([viol.lat, viol.lng], { icon }).addTo(map);

      const tooltipContent = `
        <div class="p-1.5 font-mono text-[9px] uppercase tracking-wide">
          <div class="font-black text-red-500 border-b border-border pb-1 mb-1">MOCK VIOLATION</div>
          <div class="flex flex-col gap-0.5">
            <div><span class="text-muted-foreground">TYPE:</span> <span class="font-bold text-foreground">${viol.type}</span></div>
            <div><span class="text-muted-foreground">VEHICLE:</span> <span class="font-bold text-foreground">${viol.plate}</span></div>
            <div><span class="text-muted-foreground">LOC:</span> <span class="font-bold text-foreground">${viol.location}</span></div>
            <div><span class="text-muted-foreground">TIME:</span> <span class="font-bold text-muted-foreground">${viol.time}</span></div>
          </div>
        </div>
      `;
      marker.bindTooltip(tooltipContent, { permanent: false, direction: "top", className: "brutalist-tooltip" });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update ArcGIS Server Sublayers visibility based on Checkbox selection
  useEffect(() => {
    if (!dynamicLayerRef.current) return;
    const activeLayers = [];
    if (showBMA) activeLayers.push(1);
    if (showRoads) activeLayers.push(2);
    if (showLanduse) activeLayers.push(3);
    
    dynamicLayerRef.current.setLayers(activeLayers);
  }, [showLanduse, showRoads, showBMA]);

  // 2. Draw Camera Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old camera markers if any
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    cameras.forEach((cam) => {
      // Check if camera has any pending alert violations in the incoming feed
      const isAlerting = violations.some(v => v.location.includes(cam.id) && v.status === "Pending Review");
      const statusColor = cam.offline ? "var(--muted-foreground)" : (isAlerting ? "var(--accent)" : "#10b981");

      const icon = L.divIcon({
        className: "custom-leaflet-marker",
        html: `
          <div class="relative flex items-center justify-center" style="width: 16px; height: 16px;">
            ${isAlerting ? `<div class="absolute inset-0 bg-accent rounded-full animate-ping opacity-75" style="width: 16px; height: 16px;"></div>` : ""}
            <div style="width: 10px; height: 10px; background-color: ${statusColor}; border: 1.5px solid var(--background); border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const marker = L.marker([cam.lat, cam.lng], { icon }).addTo(map);
      
      // Bind popups showing camera details
      const tooltipContent = `
        <div class="p-1 font-mono text-[9px] uppercase tracking-wide">
          <div class="font-black text-foreground">${cam.name}</div>
          <div class="mt-1 flex justify-between gap-4">
            <span class="text-muted-foreground">STATUS:</span>
            <span class="font-bold ${cam.offline ? "text-muted-foreground" : "text-emerald-500"}">${cam.offline ? "OFFLINE" : "ACTIVE"}</span>
          </div>
        </div>
      `;
      marker.bindTooltip(tooltipContent, { permanent: false, direction: "top", className: "brutalist-tooltip" });

      marker.on("click", () => {
        // Find latest violation at this camera to let users inspect
        const matchViol = violations.find(v => v.location.includes(cam.id));
        if (matchViol) {
          onViewViolation(matchViol);
        } else {
          alert(`${cam.name} operational status: Stable. No active infractions.`);
        }
      });

      markersRef.current[cam.id] = marker;
    });
  }, [violations]);

  // 3. Center and Zoom Map to Latest alert coordinate ping changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activePingCoord) return;

    // Search camera mapping corresponding coordinates
    const matchedCam = cameras.find(c => c.location === violations[0]?.location);
    if (matchedCam) {
      map.setView([matchedCam.lat, matchedCam.lng], 14, { animate: true, duration: 1 });
      
      // Open marker tooltip briefly to attract attention
      const m = markersRef.current[matchedCam.id];
      if (m) {
        m.openTooltip();
        setTimeout(() => m.closeTooltip(), 4000);
      }
    }
  }, [activePingCoord]);

  // 4. Handle GIS search by Survey Number or Code
  const handleGISSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");
    const map = mapInstanceRef.current;

    try {
      // Query BDA Masterplan REST endpoint
      const result = await searchPropertyBySurveyNumber(searchQuery);

      if (result && result.features && result.features.length > 0) {
        // Clear previous overlays
        highlightLayerRef.current.clearLayers();

        // Draw geojson polygons on map
        const geoJsonLayer = L.geoJSON(result, {
          style: {
            color: "#3b82f6", // Cool blue outline instead of red
            weight: 2,
            fillColor: "#3b82f6",
            fillOpacity: 0.25
          },
          onEachFeature: (feature, layer) => {
            const props = feature.properties;
            layer.bindPopup(`
              <div class="p-1 font-sans text-xs">
                <div class="font-black border-b border-border pb-1 mb-1 text-foreground uppercase">Matched Masterplan Zone</div>
                <div class="font-mono text-[9px] space-y-1">
                  <div><strong>Zone ID:</strong> ${props.PLU_BDA || "N/A"}</div>
                  <div><strong>Description:</strong> ${props.PLU_Tp_sur || "Landuse Area"}</div>
                  <div><strong>Zoning Type:</strong> ${props.PLU_Tp_pro || "N/A"}</div>
                </div>
              </div>
            `);
          }
        }).addTo(highlightLayerRef.current);

        // Zoom map viewport to fit matched polygon boundaries
        const bounds = geoJsonLayer.getBounds();
        map.fitBounds(bounds, { maxZoom: 16, animate: true, duration: 1.2 });
        
        // Open first polygon popup
        const layers = geoJsonLayer.getLayers();
        if (layers.length > 0) {
          layers[0].openPopup();
        }
      } else {
        setSearchError("No parcel matched this query code.");
      }
    } catch (err) {
      console.error("GIS Search fail:", err);
      setSearchError("REST service query timed out.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay for enlarged mode */}
      {isEnlarged && (
        <div 
          className="fixed inset-0 bg-black/75 z-[1999] transition-opacity duration-300"
          onClick={() => setIsEnlarged(false)}
        />
      )}

      <div 
        className={`border-2 border-border bg-black overflow-hidden font-sans select-none transition-all duration-300 ${
          isEnlarged 
            ? "fixed inset-x-8 inset-y-12 z-[2000] shadow-2xl flex flex-col" 
            : "relative w-full h-full min-h-[260px] flex flex-col"
        }`}
      >
        {/* Map display canvas */}
        <div ref={mapContainerRef} className="flex-1 w-full h-full z-0 bg-[#121212]"></div>

        {/* Embedded Search overlay hud */}
        <form 
          onSubmit={handleGISSearch}
          className="absolute bottom-2.5 left-2.5 z-[1000] flex items-center bg-background border-2 border-border p-1 w-64 max-w-[calc(100vw-30px)] shadow-lg"
        >
          <input
            type="text"
            placeholder="Search Zone Code (e.g. Ba, Ca, K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent px-2 py-0.5 text-[10px] font-mono focus:outline-none text-foreground placeholder-muted-foreground uppercase"
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="p-1 text-foreground hover:text-accent cursor-pointer transition-colors border-l border-border pl-1.5"
          >
            {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Controls Overlay (Top Right) */}
        <div className="absolute top-2.5 right-2.5 z-[1000] flex items-start gap-1.5">
          {/* Layer Dropdown */}
          <div className="flex flex-col items-end">
            <button
              type="button"
              onClick={() => setShowLayersDropdown(!showLayersDropdown)}
              className="bg-background border-2 border-border p-1.5 shadow-lg text-foreground hover:text-accent cursor-pointer transition-colors flex items-center gap-1.5 font-mono text-[9px] uppercase font-black"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>

            {showLayersDropdown && (
              <div className="bg-background border-2 border-border p-2 w-36 shadow-lg font-mono text-[8px] uppercase font-black space-y-1.5 select-none mt-1">
                <label className="flex items-center gap-2 cursor-pointer hover:text-accent">
                  <input 
                    type="checkbox" 
                    checked={showLanduse} 
                    onChange={(e) => setShowLanduse(e.target.checked)} 
                    className="rounded-none border-border bg-card cursor-pointer accent-accent"
                  />
                  Land Use (BDA)
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-accent">
                  <input 
                    type="checkbox" 
                    checked={showRoads} 
                    onChange={(e) => setShowRoads(e.target.checked)} 
                    className="rounded-none border-border bg-card cursor-pointer accent-accent"
                  />
                  Proposed Roads
                </label>
                <label className="flex items-center gap-2 cursor-pointer hover:text-accent">
                  <input 
                    type="checkbox" 
                    checked={showBMA} 
                    onChange={(e) => setShowBMA(e.target.checked)} 
                    className="rounded-none border-border bg-card cursor-pointer accent-accent"
                  />
                  BMA Boundary
                </label>
              </div>
            )}
          </div>

          {/* Enlarge/Minimize Button */}
          <button
            type="button"
            onClick={() => setIsEnlarged(!isEnlarged)}
            className="bg-background border-2 border-border p-1.5 shadow-lg text-foreground hover:text-accent cursor-pointer transition-colors flex items-center gap-1.5 font-mono text-[9px] uppercase font-black"
            title={isEnlarged ? "Minimize Map" : "Enlarge Map"}
          >
            {isEnlarged ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Minimize</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Enlarge</span>
              </>
            )}
          </button>
        </div>

        {/* Alert / Search Error Banner */}
        {searchError && (
          <div className="absolute bottom-12 left-2.5 z-[1000] bg-background text-foreground font-mono text-[9px] px-2 py-0.5 border border-border">
            {searchError}
          </div>
        )}
        
        {/* Custom Styles for Brutalist Leaflet Elements */}
        <style>{`
          .leaflet-popup-content-wrapper {
            background-color: var(--background) !important;
            border: 2px solid var(--border) !important;
            border-radius: 0px !important;
            box-shadow: 4px 4px 0px rgba(0,0,0,0.1) !important;
            color: var(--foreground) !important;
          }
          .leaflet-popup-tip {
            background-color: var(--background) !important;
            border: 2px solid var(--border) !important;
            border-top: none !important;
            border-left: none !important;
          }
          .brutalist-tooltip {
            background-color: var(--background) !important;
            border: 2.5px solid var(--border) !important;
            border-radius: 0px !important;
            color: var(--foreground) !important;
            font-family: monospace !important;
          }
          .leaflet-container {
            font-family: sans-serif !important;
          }
        `}</style>
      </div>
    </>
  );
};

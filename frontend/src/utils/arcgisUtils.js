/**
 * ArcGIS REST API Utility Functions for Bangalore GIS Masterplan Integration
 * 
 * Base Service Endpoint:
 * https://kgis.ksrsac.in/kgismaps1/rest/services/Bangalore_GIS/BGIS_Masterplan/MapServer
 * 
 * Layers Map:
 * - Layer ID 1: BMA (Bangalore Metropolitan Area Boundary)
 * - Layer ID 2: RoadWidth (Proposed Road Widths & Hierarchy)
 * - Layer ID 3: Propose Landuse (Proposed Landuse Zoning Categories)
 */

// Load base MapServer URL from Vite environment variables with a hardcoded fallback
const BASE_URL = import.meta.env.VITE_ARCGIS_BGIS_MASTERPLAN_URL || 
  "https://kgis.ksrsac.in/kgismaps1/rest/services/Bangalore_GIS/BGIS_Masterplan/MapServer";

/**
 * Standard utility to fetch and handle JSON response from ArcGIS endpoints
 */
async function fetchArcGISJson(url, params = {}) {
  const queryParams = new URLSearchParams({
    f: "json", // Request format
    ...params
  });
  
  const response = await fetch(`${url}?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error(`ArcGIS request failed: HTTP ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

/**
 * Queries the BDA Proposed Landuse layer (Layer 3)
 * @param {string} where - SQL where clause (e.g. "PLU_BDA = 'Ba'")
 * @param {Array<string>} outFields - Fields to select (default: OBJECTID, PLU_BDA, PLU_Tp_pro, PLU_Tp_sur)
 * @returns {Promise<Object>} GeoJSON or JSON representation of the features
 */
export async function queryLanduseFeatures(where = "1=1", outFields = ["OBJECTID", "PLU_BDA", "PLU_Tp_pro", "PLU_Tp_sur"]) {
  const url = `${BASE_URL}/3/query`;
  const params = {
    where,
    outFields: outFields.join(","),
    returnGeometry: "true",
    outSR: "4326", // Convert geometry output to standard WGS84 Lat/Lng coordinates
    f: "geojson", // Fetch standard GeoJSON instead of Esri JSON format
    spatialRel: "esriSpatialRelIntersects"
  };
  // We use standard fetch here since params overrides f: "json"
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${url}?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error(`ArcGIS Landuse query failed: HTTP ${response.status}`);
  }
  return await response.json();
}

/**
 * Queries the Proposed Road Width layer (Layer 2)
 * @param {string} where - SQL where clause (e.g. "RR_WIDTH_P >= 30")
 * @param {Array<string>} outFields - Fields to select (default: OBJECTID, RR_WIDTH_P, RR_TP_HIER, RR_TP_TYPE)
 * @returns {Promise<Object>} Features
 */
export async function queryRoadWidths(where = "1=1", outFields = ["OBJECTID", "RR_WIDTH_P", "RR_TP_HIER", "RR_TP_TYPE"]) {
  const url = `${BASE_URL}/2/query`;
  const params = {
    where,
    outFields: outFields.join(","),
    returnGeometry: "true",
    outSR: "4326", // Convert geometry output to standard WGS84 Lat/Lng coordinates
    f: "geojson", // Fetch standard GeoJSON
    spatialRel: "esriSpatialRelIntersects"
  };
  const queryParams = new URLSearchParams(params);
  const response = await fetch(`${url}?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error(`ArcGIS Road query failed: HTTP ${response.status}`);
  }
  return await response.json();
}

/**
 * Searches properties / zones by a custom survey or parcel query value
 * @param {string} surveyNum - Survey number search term
 * @returns {Promise<Object>} Features matched
 */
export async function searchPropertyBySurveyNumber(surveyNum) {
  if (!surveyNum) return null;
  // Match exact or substring in the PLU Proposed Survey Number column
  const where = `PLU_Tp_sur LIKE '%${surveyNum.replace(/'/g, "''")}%' OR PLU_BDA LIKE '%${surveyNum.replace(/'/g, "''")}%'`;
  return await queryLanduseFeatures(where);
}

/**
 * Executes a spatial identify operation against the entire BGIS_Masterplan MapServer endpoint.
 * Useful for querying multiple layers simultaneously at a specific Lat/Lng.
 * 
 * @param {Object} latlng - LatLng coordinates {lat, lng}
 * @param {Object} bounds - Bounding box of the active map view
 * @param {number} width - Map container width in pixels
 * @param {number} height - Map container height in pixels
 * @returns {Promise<Object>} Identified features properties grouped by layer
 */
export async function identifyGISFeatures(latlng, bounds, width = 600, height = 400) {
  const url = `${BASE_URL}/identify`;
  
  // Convert lat/lng to Web Mercator Web coordinates for spatial search
  const earthRadius = 6378137.0;
  const x = latlng.lng * Math.PI / 180 * earthRadius;
  const y = Math.log(Math.tan((90 + latlng.lat) * Math.PI / 360)) * earthRadius;
  
  // Bounding box mapping for identify task
  const xmin = bounds.getSouthWest().lng * Math.PI / 180 * earthRadius;
  const ymin = Math.log(Math.tan((90 + bounds.getSouthWest().lat) * Math.PI / 360)) * earthRadius;
  const xmax = bounds.getNorthEast().lng * Math.PI / 180 * earthRadius;
  const ymax = Math.log(Math.tan((90 + bounds.getNorthEast().lat) * Math.PI / 360)) * earthRadius;

  const params = {
    geometry: `${x},${y}`,
    geometryType: "esriGeometryPoint",
    sr: "102100", // Web Mercator WKID
    layers: "all:1,2,3", // Query layers BMA, RoadWidth, Landuse
    tolerance: "10", // Pixel tolerance search radius
    mapExtent: `${xmin},${ymin},${xmax},${ymax}`,
    imageDisplay: `${width},${height},96`,
    returnGeometry: "false"
  };

  return await fetchArcGISJson(url, params);
}

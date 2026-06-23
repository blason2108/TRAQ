// Realistic Mock Data for TrafficVision AI dashboard (Flipkart GRiD hackathon)

export const MOCK_VIOLATIONS = [
  {
    id: "VIOL-2026-001",
    timestamp: "2026-06-17T14:48:12Z",
    location: "Koramangala 80ft Rd - Cam 04",
    gps: "12.9352° N, 77.6245° E",
    vehicleType: "Motorcycle",
    violationType: "No Helmet",
    severity: "high", // high, medium, low
    licensePlate: "PB02BS2316",
    ocrConfidence: 0.98,
    confidence: 0.96,
    status: "Pending Review",
    annotatedBoxes: [
      { type: "vehicle", label: "Motorcycle (97%)", x: 120, y: 140, w: 220, h: 240, color: "#3b82f6" },
      { type: "helmet", label: "Rider: No Helmet (96%)", x: 200, y: 80, w: 60, h: 60, color: "#ef4444" },
      { type: "plate", label: "Plate: PB02BS2316 (98%)", x: 190, y: 320, w: 80, h: 30, color: "#10b981" }
    ],
    cameraDetails: {
      model: "HikVision PTZ-4K",
      fps: 30,
      resolution: "3840x2160"
    },
    inferenceTime: "42ms"
  },
  {
    id: "VIOL-2026-002",
    timestamp: "2026-06-17T14:45:30Z",
    location: "Outer Ring Road - Cam 12",
    gps: "12.9279° N, 77.6812° E",
    vehicleType: "Car",
    violationType: "No Seatbelt",
    severity: "medium",
    licensePlate: "MH12GP7731",
    ocrConfidence: 0.95,
    confidence: 0.91,
    status: "Pending Review",
    annotatedBoxes: [
      { type: "vehicle", label: "Car (99%)", x: 80, y: 100, w: 340, h: 260, color: "#3b82f6" },
      { type: "seatbelt", label: "Driver: No Seatbelt (91%)", x: 160, y: 130, w: 70, h: 90, color: "#f59e0b" },
      { type: "plate", label: "Plate: MH12GP7731 (95%)", x: 210, y: 310, w: 90, h: 35, color: "#10b981" }
    ],
    cameraDetails: {
      model: "Axis Dome-HD",
      fps: 25,
      resolution: "1920x1080"
    },
    inferenceTime: "38ms"
  },
  {
    id: "VIOL-2026-003",
    timestamp: "2026-06-17T14:42:05Z",
    location: "Silk Board Junction - Cam 02",
    gps: "12.9176° N, 77.6244° E",
    vehicleType: "Motorcycle",
    violationType: "Triple Riding",
    severity: "high",
    licensePlate: "DL4CAF8821",
    ocrConfidence: 0.92,
    confidence: 0.89,
    status: "Pending Review",
    annotatedBoxes: [
      { type: "vehicle", label: "Motorcycle (94%)", x: 140, y: 150, w: 200, h: 230, color: "#3b82f6" },
      { type: "violation", label: "Triple Riding Detected (89%)", x: 160, y: 100, w: 160, h: 180, color: "#ef4444" },
      { type: "plate", label: "Plate: DL4CAF8821 (92%)", x: 210, y: 340, w: 70, h: 25, color: "#10b981" }
    ],
    cameraDetails: {
      model: "HikVision PTZ-4K",
      fps: 30,
      resolution: "3840x2160"
    },
    inferenceTime: "45ms"
  },
  {
    id: "VIOL-2026-004",
    timestamp: "2026-06-17T14:38:19Z",
    location: "Indiranagar 100ft Rd - Cam 09",
    gps: "12.9719° N, 77.6412° E",
    vehicleType: "Car",
    violationType: "Speeding",
    severity: "high",
    licensePlate: "KA51MB2020",
    ocrConfidence: 0.99,
    confidence: 0.97,
    status: "Confirmed",
    speed: "94 km/h (Limit: 60)",
    annotatedBoxes: [
      { type: "vehicle", label: "Car (99%)", x: 90, y: 120, w: 320, h: 240, color: "#3b82f6" },
      { type: "speed", label: "Speeding: 94km/h (97%)", x: 90, y: 90, w: 320, h: 30, color: "#ef4444" },
      { type: "plate", label: "Plate: KA51MB2020 (99%)", x: 200, y: 300, w: 85, h: 30, color: "#10b981" }
    ],
    cameraDetails: {
      model: "Truvelo SpeedCam",
      fps: 60,
      resolution: "1920x1080"
    },
    inferenceTime: "32ms"
  },
  {
    id: "VIOL-2026-005",
    timestamp: "2026-06-17T14:31:02Z",
    location: "MG Road Crossing - Cam 01",
    gps: "12.9740° N, 77.6074° E",
    vehicleType: "SUV",
    violationType: "Running Red Light",
    severity: "high",
    licensePlate: "UP16CT4004",
    ocrConfidence: 0.88,
    confidence: 0.94,
    status: "Rejected",
    annotatedBoxes: [
      { type: "vehicle", label: "SUV (98%)", x: 100, y: 130, w: 300, h: 250, color: "#3b82f6" },
      { type: "signal", label: "Red Light Infraction (94%)", x: 220, y: 50, w: 60, h: 120, color: "#ef4444" },
      { type: "plate", label: "Plate: UP16CT4004 (88%)", x: 210, y: 320, w: 80, h: 30, color: "#10b981" }
    ],
    cameraDetails: {
      model: "Axis Dome-HD",
      fps: 25,
      resolution: "1920x1080"
    },
    inferenceTime: "40ms"
  },
  {
    id: "VIOL-2026-006",
    timestamp: "2026-06-17T14:25:44Z",
    location: "Electronic City Expressway - Cam 18",
    gps: "12.8450° N, 77.6766° E",
    vehicleType: "Truck",
    violationType: "Speeding",
    severity: "medium",
    licensePlate: "HR55AN9921",
    ocrConfidence: 0.96,
    confidence: 0.92,
    status: "Confirmed",
    speed: "88 km/h (Limit: 80)",
    annotatedBoxes: [
      { type: "vehicle", label: "Truck (96%)", x: 60, y: 80, w: 380, h: 300, color: "#3b82f6" },
      { type: "speed", label: "Speeding: 88km/h (92%)", x: 60, y: 50, w: 380, h: 30, color: "#f59e0b" },
      { type: "plate", label: "Plate: HR55AN9921 (96%)", x: 200, y: 320, w: 100, h: 40, color: "#10b981" }
    ],
    cameraDetails: {
      model: "Truvelo SpeedCam",
      fps: 60,
      resolution: "1920x1080"
    },
    inferenceTime: "35ms"
  },
  {
    id: "VIOL-2026-007",
    timestamp: "2026-06-17T14:15:10Z",
    location: "Koramangala 80ft Rd - Cam 04",
    gps: "12.9352° N, 77.6245° E",
    vehicleType: "Motorcycle",
    violationType: "No Helmet",
    severity: "high",
    licensePlate: "KA05JK1234",
    ocrConfidence: 0.94,
    confidence: 0.93,
    status: "Pending Review",
    annotatedBoxes: [
      { type: "vehicle", label: "Motorcycle (95%)", x: 130, y: 150, w: 210, h: 230, color: "#3b82f6" },
      { type: "helmet", label: "Rider: No Helmet (93%)", x: 205, y: 90, w: 55, h: 55, color: "#ef4444" },
      { type: "plate", label: "Plate: KA05JK1234 (94%)", x: 195, y: 330, w: 80, h: 30, color: "#10b981" }
    ],
    cameraDetails: {
      model: "HikVision PTZ-4K",
      fps: 30,
      resolution: "3840x2160"
    },
    inferenceTime: "41ms"
  },
  {
    id: "VIOL-2026-008",
    timestamp: "2026-06-17T13:58:33Z",
    location: "Whitefield Main Road - Cam 07",
    gps: "12.9698° N, 77.7500° E",
    vehicleType: "Car",
    violationType: "Phone Usage",
    severity: "medium",
    licensePlate: "KA03MM8800",
    ocrConfidence: 0.91,
    confidence: 0.87,
    status: "Pending Review",
    annotatedBoxes: [
      { type: "vehicle", label: "Car (94%)", x: 80, y: 110, w: 340, h: 250, color: "#3b82f6" },
      { type: "violation", label: "Driver Phone Usage (87%)", x: 150, y: 140, w: 80, h: 70, color: "#f59e0b" },
      { type: "plate", label: "Plate: KA03MM8800 (91%)", x: 210, y: 310, w: 90, h: 30, color: "#10b981" }
    ],
    cameraDetails: {
      model: "HikVision PTZ-4K",
      fps: 30,
      resolution: "3840x2160"
    },
    inferenceTime: "44ms"
  }
];

export const MOCK_KPIS = {
  totalViolations: 1248,
  totalViolationsChange: 12.5, // % change from yesterday
  vehiclesScanned: 84920,
  vehiclesScannedChange: 5.8,
  commonViolation: "No Helmet",
  commonViolationCount: 512,
  accuracy: 96.4,
  accuracyChange: 0.3
};

export const MOCK_TRENDS = [
  { time: "08:00", violations: 45, scanned: 2500, accuracy: 96.2 },
  { time: "09:00", violations: 82, scanned: 4800, accuracy: 96.5 },
  { time: "10:00", violations: 95, scanned: 5200, accuracy: 96.1 },
  { time: "11:00", violations: 70, scanned: 4100, accuracy: 96.3 },
  { time: "12:00", violations: 55, scanned: 3800, accuracy: 96.6 },
  { time: "13:00", violations: 48, scanned: 3500, accuracy: 96.4 },
  { time: "14:00", violations: 65, scanned: 3900, accuracy: 96.2 },
  { time: "15:00", violations: 78, scanned: 4400, accuracy: 96.5 },
  { time: "16:00", violations: 88, scanned: 4900, accuracy: 96.4 },
  { time: "17:00", violations: 110, scanned: 5800, accuracy: 96.7 },
  { time: "18:00", violations: 125, scanned: 6100, accuracy: 96.3 },
  { time: "19:00", violations: 90, scanned: 4500, accuracy: 96.5 }
];

export const MOCK_BREAKDOWN = [
  { name: "No Helmet", value: 512, color: "#ef4444" },
  { name: "Speeding", value: 342, color: "#f59e0b" },
  { name: "No Seatbelt", value: 198, color: "#3b82f6" },
  { name: "Running Red Light", value: 112, color: "#ec4899" },
  { name: "Triple Riding", value: 58, color: "#8b5cf6" },
  { name: "Phone Usage", value: 26, color: "#06b6d4" }
];

export const MOCK_LPR_LATEST = [
  { id: "LPR-1", plate: "PB02BS2316", confidence: 0.98, timestamp: "14:48:12", corrected: false },
  { id: "LPR-2", plate: "MH12GP7731", confidence: 0.95, timestamp: "14:45:30", corrected: false },
  { id: "LPR-3", plate: "DL4CAF8821", confidence: 0.92, timestamp: "14:42:05", corrected: false },
  { id: "LPR-4", plate: "KA51MB2020", confidence: 0.99, timestamp: "14:38:19", corrected: false },
  { id: "LPR-5", plate: "UP16CT4004", confidence: 0.88, timestamp: "14:31:02", corrected: true, originalPlate: "UP16CT400A" },
  { id: "LPR-6", plate: "HR55AN9921", confidence: 0.96, timestamp: "14:25:44", corrected: false },
  { id: "LPR-7", plate: "KA05JK1234", confidence: 0.94, timestamp: "14:15:10", corrected: false }
];

export const MOCK_HOTSPOTS = [
  { id: "LOC-1", name: "Silk Board Junction", violationsCount: 245, mainViolation: "Triple Riding / Red Light", activeCameras: 8, rating: "Critical" },
  { id: "LOC-2", name: "Koramangala 80ft Rd", violationsCount: 182, mainViolation: "No Helmet", activeCameras: 4, rating: "High" },
  { id: "LOC-3", name: "Outer Ring Road (Bellandur)", violationsCount: 168, mainViolation: "Speeding / Seatbelt", activeCameras: 12, rating: "High" },
  { id: "LOC-4", name: "MG Road Crossing", violationsCount: 94, mainViolation: "Running Red Light", activeCameras: 6, rating: "Medium" },
  { id: "LOC-5", name: "Indiranagar 100ft Rd", violationsCount: 88, mainViolation: "No Helmet / Phone Usage", activeCameras: 5, rating: "Medium" }
];

export const MOCK_HEATMAP = [
  { day: "Mon", "00-04": 5, "04-08": 12, "08-12": 58, "12-16": 42, "16-20": 78, "20-24": 25 },
  { day: "Tue", "00-04": 8, "04-08": 15, "08-12": 62, "12-16": 45, "16-20": 82, "20-24": 30 },
  { day: "Wed", "00-04": 4, "04-08": 10, "08-12": 55, "12-16": 38, "16-20": 70, "20-24": 22 },
  { day: "Thu", "00-04": 6, "04-08": 14, "08-12": 60, "12-16": 40, "16-20": 75, "20-24": 28 },
  { day: "Fri", "00-04": 10, "04-08": 18, "08-12": 72, "12-16": 55, "16-20": 94, "20-24": 45 },
  { day: "Sat", "00-04": 18, "04-08": 8, "08-12": 35, "12-16": 48, "16-20": 88, "20-24": 62 },
  { day: "Sun", "00-04": 22, "04-08": 5, "08-12": 20, "12-16": 32, "16-20": 60, "20-24": 40 }
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, text: "Critical: Speeding detected at ORR - Cam 12 (94 km/h)", type: "critical", time: "2 min ago", read: false },
  { id: 2, text: "OCR match: Plate PB02BS2316 flagged in Watchlist", type: "info", time: "5 min ago", read: false },
  { id: 3, text: "High severity: Triple Riding detected at Silk Board - Cam 02", type: "high", time: "8 min ago", read: true },
  { id: 4, text: "System Warning: Cam 08 connection latency exceeded 150ms", type: "warning", time: "15 min ago", read: true }
];

export const MOCK_MODEL_METRICS = {
  version: "TrafficVision-v2.4.1-rc3",
  framework: "PyTorch 2.2 / YOLOv9-Custom",
  lastUpdated: "2026-06-01",
  accuracy: 96.4,
  precision: 95.8,
  recall: 94.2,
  f1: 95.0,
  mAP: 93.8,
  history: [
    { epoch: 10, mAP: 78.2, loss: 0.45 },
    { epoch: 20, mAP: 84.5, loss: 0.32 },
    { epoch: 30, mAP: 89.1, loss: 0.22 },
    { epoch: 40, mAP: 91.8, loss: 0.17 },
    { epoch: 50, mAP: 93.8, loss: 0.12 }
  ],
  systemHealth: {
    latency: "38ms",
    throughput: "88 FPS",
    uptime: "99.98%",
    status: "healthy",
    cpuUsage: 42,
    gpuUsage: 68,
    memoryUsage: 54
  }
};

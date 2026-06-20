# violation_engine/anpr.py
# ─────────────────────────────────────────────
# Automatic Number Plate Recognition (ANPR).
#
# Two responsibilities:
#   1. detect_and_ocr_plate()
#      Crops the plate zone from a vehicle bbox,
#      upscales + thresholds, runs EasyOCR.
#
#   2. ANPRRegistry
#      Logs every plate seen per track_id.
#      best_plate(track_id) returns the last
#      successfully read plate for that vehicle.
# ─────────────────────────────────────────────

import cv2
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple


def detect_and_ocr_plate(frame: np.ndarray,
                          vehicle_bbox: Tuple,
                          ocr_reader) -> str:
    """
    Extract and read the licence plate from a vehicle detection.

    Strategy:
      - Crop the bottom 35% of the vehicle bbox (where plates are mounted)
      - Upscale to at least 120px tall for OCR accuracy
      - Otsu threshold for contrast
      - Run EasyOCR with alphanumeric allowlist

    Parameters
    ----------
    frame        : full BGR frame
    vehicle_bbox : (x1, y1, x2, y2) in pixels
    ocr_reader   : easyocr.Reader instance (passed in so it's created once)

    Returns
    -------
    plate string e.g. 'KA05AB1234', or 'UNKNOWN'
    """
    x1, y1, x2, y2 = [int(v) for v in vehicle_bbox]
    h = y2 - y1

    # Bottom 35% = typical plate mounting zone
    plate_y1   = y1 + int(h * 0.65)
    plate_crop = frame[max(0, plate_y1):y2, max(0, x1):x2]

    if plate_crop.size == 0:
        return 'UNKNOWN'

    # Upscale so OCR has enough pixels to work with
    scale = max(1, 120 // plate_crop.shape[0])
    crop  = cv2.resize(plate_crop, None,
                       fx=scale, fy=scale,
                       interpolation=cv2.INTER_CUBIC)

    # Grayscale + Otsu threshold
    gray      = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 0, 255,
                              cv2.THRESH_BINARY + cv2.THRESH_OTSU)

    results = ocr_reader.readtext(
        thresh,
        detail=0,
        allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    )

    plate = ''.join(results).upper().replace(' ', '')
    return plate[:10] if plate else 'UNKNOWN'


class ANPRRegistry:
    """
    Continuous log of every plate seen — not just violators.
    Keeps a cache of the last-seen plate per track_id for fast lookup.
    """

    def __init__(self):
        self.records: List[Dict] = []
        self._cache:  Dict[int, str] = {}    # track_id → most recent plate

    def log(self, track_id: int, plate: str,
            frame_idx: int, timestamp: str,
            camera: str = 'CAM_01') -> None:
        """Record a plate sighting."""
        self._cache[track_id] = plate
        self.records.append({
            'track_id':  track_id,
            'plate':     plate,
            'frame':     frame_idx,
            'timestamp': timestamp,
            'camera':    camera,
        })

    def best_plate(self, track_id: int) -> str:
        """Return the last successfully read plate for a track, or 'UNKNOWN'."""
        return self._cache.get(track_id, 'UNKNOWN')

    def route_of(self, plate: str) -> List[Dict]:
        """Return all sightings for a specific plate (for route tracking)."""
        return [r for r in self.records if r['plate'] == plate]

    def to_df(self) -> pd.DataFrame:
        """Convert to DataFrame for CSV export."""
        return pd.DataFrame(self.records)

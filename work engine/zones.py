# violation_engine/zones.py
# ─────────────────────────────────────────────
# Spatial zone definitions and helpers.
#
#   ROI polygon        — enforcement area (vehicles outside are ignored)
#   Stop-line detector — Hough lines on the bottom 35% of frame
#   Forbidden zones    — rectangles where parking is illegal
# ─────────────────────────────────────────────

import cv2
import numpy as np
from typing import List, Tuple


# ── ROI polygon ───────────────────────────────

def build_default_roi(W: int, H: int) -> np.ndarray:
    """
    Default road-surface trapezoid for a typical overhead intersection camera.
    Covers full width at the bottom, narrowing to ~60% at the horizon.

    Tune horizon_y / horizon_x1 / horizon_x2 for your camera angle.
    Returns an (N, 2) int32 numpy array for use with cv2.pointPolygonTest.
    """
    horizon_y  = int(H * 0.45)
    horizon_x1 = int(W * 0.20)
    horizon_x2 = int(W * 0.80)

    return np.array([
        [0,          H],            # bottom-left
        [W,          H],            # bottom-right
        [horizon_x2, horizon_y],    # top-right (near horizon)
        [horizon_x1, horizon_y],    # top-left  (near horizon)
    ], dtype=np.int32)


def in_roi(cx: float, cy: float, roi_polygon: np.ndarray) -> bool:
    """
    Point-in-polygon test. Returns True if (cx, cy) is inside the ROI.
    Always returns True if polygon has fewer than 3 points (safety fallback).
    """
    if roi_polygon.shape[0] < 3:
        return True
    return cv2.pointPolygonTest(
        roi_polygon.reshape(-1, 1, 2),
        (float(cx), float(cy)),
        False
    ) >= 0


def perspective_ok(bbox: Tuple, W: int, H: int,
                   min_area_ratio: float = 0.008) -> bool:
    """
    Perspective filter: ignore bboxes that are too small
    (they're far away and detections are unreliable at that scale).
    """
    x1, y1, x2, y2 = bbox
    area_ratio = (x2 - x1) * (y2 - y1) / (W * H)
    return area_ratio >= min_area_ratio


# ── Stop-line detection ───────────────────────

def detect_stop_line(frame: np.ndarray) -> int:
    """
    Find the stop line Y-coordinate using Hough line detection.

    Strategy:
      - Search only the bottom 35% of the frame (near-camera zone)
      - Keep only near-horizontal lines (angle < 8°)
      - Take the LOWEST one (max Y) = physically closest to camera
      - Falls back to 80% of frame height if no line is found

    Returns
    -------
    stop_line_y : int   — Y pixel coordinate of the stop line
    """
    H, W = frame.shape[:2]
    search_top = int(H * 0.65)       # bottom 35%
    roi        = frame[search_top:, :]

    gray  = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    blur  = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 30, 100)   # lower thresholds for faint road markings

    lines = cv2.HoughLinesP(
        edges, 1, np.pi / 180,
        threshold=60,
        minLineLength=int(W * 0.25),   # at least 25% of frame width
        maxLineGap=40
    )

    if lines is None:
        return int(H * 0.80)           # fallback

    # Keep near-horizontal lines
    h_lines = []
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angle = abs(np.degrees(np.arctan2(y2 - y1, x2 - x1)))
        if angle < 8 or angle > 172:
            h_lines.append(y1)

    if not h_lines:
        return int(H * 0.80)

    # Lowest line (max Y in ROI coords) = closest to camera = stop line
    roi_y   = int(np.max(h_lines))
    frame_y = search_top + roi_y

    # Clamp to reasonable range
    frame_y = max(int(H * 0.65), min(int(H * 0.92), frame_y))
    return frame_y


# ── Forbidden parking zones ───────────────────

def build_default_forbidden_zones(W: int, H: int) -> List[Tuple[int, int, int, int]]:
    """
    Default: entire frame is a no-parking zone.
    Override this with specific rectangles per camera in production.

    Returns list of (x1, y1, x2, y2) rectangles.
    """
    return [(0, 0, W, H)]


def in_forbidden_zone(cx: float, cy: float,
                      zones: List[Tuple[int, int, int, int]]) -> bool:
    """Returns True if centroid (cx, cy) is inside any forbidden parking rectangle."""
    for (x1, y1, x2, y2) in zones:
        if x1 <= cx <= x2 and y1 <= cy <= y2:
            return True
    return False

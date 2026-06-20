# violation_engine/signal_tracker.py
# ─────────────────────────────────────────────
# Traffic signal state estimator.
#
# Strategy (3-layer):
#   Layer 1 — YOLO detects traffic light bbox → classify colour via HSV
#   Layer 2 — KCF tracker holds the bbox between YOLO detections
#   Layer 3 — Cycle-learning fallback when no signal is visible at all
#
# Usage:
#   tracker = SignalTracker(fps=25)
#   state   = tracker.update(frame, frame_idx, tlight_boxes)
#   if tracker.is_red: ...
# ─────────────────────────────────────────────

import cv2
import numpy as np
from collections import deque
from typing import List


class SignalTracker:
    """
    Detect traffic light position once, track with KCF thereafter.
    Re-detects every REDETECT_INTERVAL frames to correct drift.
    Falls back to cycle-phase prediction when tracker is lost.
    """

    REDETECT_INTERVAL = 150   # frames between forced YOLO re-detects

    # Typical signal cycle durations in seconds
    CYCLE = {'red': 60, 'green': 45, 'yellow': 5}

    def __init__(self, fps: float):
        self.fps            = fps
        self._tracker       = None       # cv2 KCF tracker instance
        self._last_detect   = -self.REDETECT_INTERVAL
        self.current        = 'unknown'
        self.history: deque = deque(maxlen=400)
        self._total_cycle   = sum(self.CYCLE.values())

    # ── Colour classification ─────────────────

    def _classify_crop(self, crop: np.ndarray) -> str:
        """HSV pixel-count method — returns 'red', 'green', 'yellow', or 'unknown'."""
        if crop.size == 0:
            return 'unknown'
        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)

        # Red wraps around 0/180 in HSV
        r1 = cv2.inRange(hsv, np.array([0,   100, 100]), np.array([10,  255, 255]))
        r2 = cv2.inRange(hsv, np.array([160, 100, 100]), np.array([180, 255, 255]))
        g  = cv2.inRange(hsv, np.array([40,  100, 100]), np.array([90,  255, 255]))
        y  = cv2.inRange(hsv, np.array([15,  100, 100]), np.array([40,  255, 255]))

        px   = {'red':    cv2.countNonZero(r1 | r2),
                'green':  cv2.countNonZero(g),
                'yellow': cv2.countNonZero(y)}
        best = max(px, key=px.get)
        return best if px[best] > 40 else 'unknown'

    # ── KCF tracker init ──────────────────────

    def _init_tracker(self, frame: np.ndarray, bbox_xyxy) -> None:
        x1, y1, x2, y2 = [int(v) for v in bbox_xyxy]
        self._tracker = cv2.TrackerKCF_create()
        self._tracker.init(frame, (x1, y1, x2 - x1, y2 - y1))

    # ── Cycle-learning fallback ───────────────

    def _predict_from_cycle(self) -> str:
        """Estimate current phase from elapsed time in history buffer."""
        t   = (len(self.history) / self.fps) % self._total_cycle
        acc = 0
        for phase, dur in self.CYCLE.items():
            acc += dur
            if t < acc:
                return phase
        return 'red'

    # ── Public API ────────────────────────────

    def update(self, frame: np.ndarray,
               frame_idx: int,
               detected_tlight_boxes: List) -> str:
        """
        Call once per processed frame.

        Parameters
        ----------
        frame                  : current BGR frame
        frame_idx              : frame counter (used for re-detect timing)
        detected_tlight_boxes  : list of [x1,y1,x2,y2] from YOLO for class 'traffic light'

        Returns
        -------
        'red' | 'green' | 'yellow' | 'unknown'
        """
        need_redetect = (
            self._tracker is None or
            (frame_idx - self._last_detect) >= self.REDETECT_INTERVAL
        )

        # Layer 1+2: init / re-init tracker from YOLO detection
        if need_redetect and detected_tlight_boxes:
            self._init_tracker(frame, detected_tlight_boxes[0])
            self._last_detect = frame_idx

        # Layer 2: track
        if self._tracker is not None:
            ok, bbox_xywh = self._tracker.update(frame)
            if ok:
                x, y, w, h = [int(v) for v in bbox_xywh]
                crop  = frame[max(0, y):y + h, max(0, x):x + w]
                state = self._classify_crop(crop)
                self.history.append(state)
                self.current = state
                return self.current
            else:
                self._tracker = None   # lost — trigger re-detect next frame

        # Layer 3: cycle fallback
        if len(self.history) > 20:
            self.current = self._predict_from_cycle()
            return self.current

        return 'unknown'

    @property
    def is_red(self) -> bool:
        return self.current == 'red'

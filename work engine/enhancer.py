# violation_engine/enhancer.py
# ─────────────────────────────────────────────
# Adaptive image quality enhancement.
# Runs three checks per frame and only applies
# the corrections that are actually needed.
#
# Checks:
#   1. Brightness  → CLAHE on LAB L-channel  (low-light)
#   2. Blur score  → Unsharp mask            (motion blur)
#   3. Fog check   → Histogram stretch       (haze / fog)
# ─────────────────────────────────────────────

import cv2
import numpy as np
from collections import defaultdict
from typing import List, Tuple


class AdaptiveEnhancer:
    """
    Quality-assessment gate: only enhances frames that need it.
    Call enhance(frame) → (enhanced_frame, list_of_ops_applied)
    """

    def __init__(self,
                 brightness_thresh: float = 60.0,
                 blur_thresh: float = 80.0,
                 clahe_clip: float = 3.0):
        self.brightness_thresh = brightness_thresh
        self.blur_thresh       = blur_thresh
        self.clahe = cv2.createCLAHE(clipLimit=clahe_clip,
                                     tileGridSize=(8, 8))
        # Running stats — how many frames needed each fix
        self.stats: dict = defaultdict(int)

    # ── Quality checks ────────────────────────

    def _brightness(self, gray: np.ndarray) -> float:
        return float(np.mean(gray))

    def _blur_score(self, gray: np.ndarray) -> float:
        """Laplacian variance — lower = blurrier."""
        return float(cv2.Laplacian(gray, cv2.CV_64F).var())

    def _is_foggy(self, gray: np.ndarray) -> bool:
        """High mean + low std → washed-out / foggy frame."""
        return bool(np.mean(gray) > 160 and np.std(gray) < 30)

    # ── Enhancement methods ───────────────────

    def _enhance_low_light(self, frame: np.ndarray) -> np.ndarray:
        """CLAHE on the L channel of LAB colour space."""
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        l = self.clahe.apply(l)
        return cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)

    def _deblur(self, frame: np.ndarray) -> np.ndarray:
        """Lightweight unsharp mask to sharpen motion-blurred frames."""
        blurred = cv2.GaussianBlur(frame, (0, 0), 3)
        return cv2.addWeighted(frame, 1.5, blurred, -0.5, 0)

    def _dehaze(self, frame: np.ndarray) -> np.ndarray:
        """Simple histogram stretch on the L channel to cut through haze."""
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        l = cv2.normalize(l, None, 0, 255, cv2.NORM_MINMAX)
        return cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)

    # ── Public API ────────────────────────────

    def enhance(self, frame: np.ndarray) -> Tuple[np.ndarray, List[str]]:
        """
        Assess quality and apply only necessary corrections.

        Returns
        -------
        enhanced_frame : np.ndarray   — corrected frame (copy of input if nothing needed)
        ops_applied    : List[str]    — which corrections ran, e.g. ['low_light', 'deblur']
        """
        applied = []
        out  = frame.copy()
        gray = cv2.cvtColor(out, cv2.COLOR_BGR2GRAY)

        # 1. Low-light
        if self._brightness(gray) < self.brightness_thresh:
            out  = self._enhance_low_light(out)
            gray = cv2.cvtColor(out, cv2.COLOR_BGR2GRAY)   # recompute
            applied.append('low_light')
            self.stats['low_light'] += 1

        # 2. Motion blur
        if self._blur_score(gray) < self.blur_thresh:
            out  = self._deblur(out)
            gray = cv2.cvtColor(out, cv2.COLOR_BGR2GRAY)   # recompute
            applied.append('deblur')
            self.stats['deblur'] += 1

        # 3. Fog / haze
        if self._is_foggy(gray):
            out = self._dehaze(out)
            applied.append('dehaze')
            self.stats['dehaze'] += 1

        self.stats['total'] += 1
        return out, applied

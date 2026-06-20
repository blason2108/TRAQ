# violation_engine/lane_tracker.py
# ─────────────────────────────────────────────
# Lane-aware wrong-side driving detector.
#
# How it works:
#   Phase 1 — LEARNING (first LEARN_FRAMES frames)
#       Collect centroid trajectories for all tracked vehicles.
#       After enough frames, run KMeans on direction vectors to
#       discover the N valid flow directions for this intersection.
#
#   Phase 2 — INFERENCE
#       For each vehicle, compute its recent direction vector.
#       If it doesn't match any learned cluster within ANGLE_TOL
#       degrees, flag as wrong-side driving.
#
# Usage:
#   tracker = LaneDirectionTracker()
#   tracker.update(track_id, cx, cy, frame_idx)
#   if tracker.is_wrong_side(track_id): ...
# ─────────────────────────────────────────────

import numpy as np
from collections import defaultdict
from typing import Dict, List, Optional


class LaneDirectionTracker:
    """
    Learns valid traffic flow directions from observed trajectories,
    then flags vehicles moving against the grain.
    """

    LEARN_FRAMES = 300    # unique frames before KMeans is run (~12s at 25fps)
    N_CLUSTERS   = 4      # expected flow directions (straight + turns)
    ANGLE_TOL    = 45.0   # degrees tolerance around each cluster centre

    def __init__(self):
        # track_id → list of (cx, cy) centroids
        self.tracks: Dict[int, List] = defaultdict(list)
        self.learned  = False
        self._centers = None          # (N, 2) unit direction vectors after learning
        self._frame_n = 0
        self._last_frame_updated = -1

    # ── Learning phase ────────────────────────

    def update(self, track_id: int, cx: float, cy: float,
               frame_idx: int = -1) -> None:
        """
        Record centroid for a vehicle.
        Call once per vehicle per processed frame.
        """
        self.tracks[track_id].append((cx, cy))

        # Count unique frames (not per-vehicle hits)
        if frame_idx != self._last_frame_updated:
            self._frame_n += 1
            self._last_frame_updated = frame_idx

        if not self.learned and self._frame_n >= self.LEARN_FRAMES:
            self._learn_flow()

    def _learn_flow(self) -> None:
        """Run KMeans on collected direction vectors to find valid flow clusters."""
        from sklearn.cluster import KMeans

        dirs = []
        for pts in self.tracks.values():
            if len(pts) < 6:
                continue
            arr = np.array(pts)
            dx  = arr[-1, 0] - arr[0, 0]
            dy  = arr[-1, 1] - arr[0, 1]
            n   = np.hypot(dx, dy)
            if n > 15:                     # only meaningful displacement
                dirs.append([dx / n, dy / n])

        if len(dirs) < self.N_CLUSTERS:
            return   # not enough data yet, try again later

        km = KMeans(n_clusters=self.N_CLUSTERS, n_init=10, random_state=42)
        km.fit(dirs)
        self._centers = km.cluster_centers_
        self.learned  = True
        print(f'[LaneDirectionTracker] Learned {self.N_CLUSTERS} '
              f'flow directions from {len(dirs)} trajectories.')

    # ── Inference phase ───────────────────────

    def _recent_direction(self, track_id: int) -> Optional[np.ndarray]:
        """Unit direction vector from last 8 positions, or None if not enough data."""
        pts = self.tracks.get(track_id, [])
        if len(pts) < 8:
            return None
        arr = np.array(pts[-8:])
        dx  = arr[-1, 0] - arr[0, 0]
        dy  = arr[-1, 1] - arr[0, 1]
        n   = np.hypot(dx, dy)
        if n < 5:
            return None    # vehicle barely moved — can't determine direction
        return np.array([dx / n, dy / n])

    def is_wrong_side(self, track_id: int) -> bool:
        """
        Returns True if the vehicle is moving against all learned flow directions.
        Safe to call before learning is complete — returns False during learning.
        """
        if not self.learned:
            return False
        d = self._recent_direction(track_id)
        if d is None:
            return False

        # Cosine similarity with each cluster centre
        sims      = self._centers @ d
        best_sim  = float(np.max(sims))
        threshold = np.cos(np.radians(self.ANGLE_TOL))
        return best_sim < threshold    # doesn't match any valid direction

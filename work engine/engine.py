# violation_engine/engine.py
# ─────────────────────────────────────────────
# ViolationEngineV2 — main orchestrator.
#
# One instance per video / camera stream.
# Call process_frame() for each frame.
# Read resolved_events when done.
#
# Violation types handled:
#   1. Helmet non-compliance  (motorcycles)
#   2. Triple riding          (motorcycles)
#   3. Red-light violation
#   4. Stop-line violation
#   5. Wrong-side driving
#   6. Illegal parking
#   (Seatbelt: placeholder — needs trained classifier)
#
# Event lifecycle:
#   NEW → ACTIVE (after CONFIRM_FRAMES consecutive detections)
#   ACTIVE → RESOLVED (when track disappears for GHOST_FRAMES)
#   Evidence (image + clip) is saved exactly once on NEW → ACTIVE.
# ─────────────────────────────────────────────

import cv2
import numpy as np
from collections import defaultdict
from datetime import datetime
from typing import Dict, List, Optional, Set, Tuple

from .models        import ViolationEvent, ViolationState
from .enhancer      import AdaptiveEnhancer
from .signal_tracker import SignalTracker
from .lane_tracker  import LaneDirectionTracker
from .anpr          import ANPRRegistry, detect_and_ocr_plate
from .zones         import (in_roi, perspective_ok, in_forbidden_zone,
                             build_default_roi, detect_stop_line,
                             build_default_forbidden_zones)


# ── COCO class IDs used by YOLOv8 pretrained models ──
COCO = {
    'person':        0,
    'bicycle':       1,
    'car':           2,
    'motorcycle':    3,
    'bus':           5,
    'truck':         7,
    'traffic light': 9,
    'stop sign':     11,
}
VEHICLE_IDS = {COCO['car'], COCO['motorcycle'],
               COCO['bus'], COCO['truck'], COCO['bicycle']}
PERSON_ID   = COCO['person']
TLIGHT_ID   = COCO['traffic light']

EXEMPT_KEYWORDS = {'ambulance', 'fire truck', 'police'}

# Colour overlays for annotated evidence frames (BGR)
LABEL_COLORS = {
    'Helmet non-compliance':  (0,   0,   255),
    'Triple riding':          (255, 0,   255),
    'Wrong-side driving':     (255, 0,   0),
    'Stop-line violation':    (0,   200, 255),
    'Red-light violation':    (0,   0,   200),
    'Illegal parking':        (128, 0,   255),
}


class ViolationEngineV2:
    """
    Stateful violation rule engine.
    One instance per camera / video session.
    """

    # Consecutive frames a violation must appear before it's confirmed
    CONFIRM_FRAMES = 3
    # Frames a track can be absent before its events are resolved
    GHOST_FRAMES   = 30

    # Detection confidence thresholds
    CONF_DETECTION    = 0.40
    CONF_VIOLATION    = 0.50   # minimum fused confidence to record

    def __init__(self,
                 fps:       float,
                 frame_w:   int,
                 frame_h:   int,
                 yolo_model,           # ultralytics YOLO instance (master detector)
                 ocr_reader,           # easyocr.Reader instance
                 camera_id:  str   = 'CAM_01',
                 tracker:    str   = 'bytetrack',
                 roi_polygon          = None,    # np.ndarray or None for default
                 stop_line_y: int  = None,       # int or None to auto-detect
                 forbidden_zones      = None):   # list of (x1,y1,x2,y2) or None

        self.fps      = fps
        self.W        = frame_w
        self.H        = frame_h
        self.camera   = camera_id
        self.tracker  = tracker
        self.model    = yolo_model
        self.ocr      = ocr_reader

        # Spatial config
        self.roi_polygon = (roi_polygon if roi_polygon is not None
                            else build_default_roi(frame_w, frame_h))
        self.stop_line_y = stop_line_y   # set later via set_stop_line() if needed
        self.forbidden_zones = (forbidden_zones if forbidden_zones is not None
                                else build_default_forbidden_zones(frame_w, frame_h))

        # Sub-systems
        self.enhancer = AdaptiveEnhancer()
        self.signal   = SignalTracker(fps)
        self.lane     = LaneDirectionTracker()
        self.anpr     = ANPRRegistry()

        # Event tracking
        # (track_id, violation_type) → ViolationEvent
        self._events:    Dict[Tuple, ViolationEvent] = {}
        # (track_id, violation_type) → consecutive confirm count
        self._confirm:   Dict[Tuple, int]            = defaultdict(int)
        # track_id → last frame it was seen
        self._last_seen: Dict[int, int]              = {}

        self.resolved_events: List[ViolationEvent]   = []
        self._ev_counter = 0

    # ── Spatial setup helpers ─────────────────

    def set_stop_line(self, sample_frame: np.ndarray) -> int:
        """Auto-detect stop line from a sample frame. Call before processing."""
        self.stop_line_y = detect_stop_line(sample_frame)
        return self.stop_line_y

    # ── Utility helpers ───────────────────────

    def _timestamp(self, frame_idx: int) -> str:
        secs = frame_idx / self.fps
        return datetime.utcfromtimestamp(secs).strftime('%H:%M:%S.%f')[:-3]

    def _new_event_id(self, frame_idx: int) -> str:
        self._ev_counter += 1
        return f'VIO-{self.camera}-{frame_idx:06d}-{self._ev_counter:04d}'

    def _fuse_confidence(self, *scores: float) -> float:
        """Geometric mean of multiple model confidence scores."""
        arr = [s for s in scores if s > 0]
        return float(np.prod(arr) ** (1.0 / len(arr))) if arr else 0.0

    def _iou(self, a: Tuple, b: Tuple) -> float:
        ax1, ay1, ax2, ay2 = a
        bx1, by1, bx2, by2 = b
        ix1 = max(ax1, bx1);  iy1 = max(ay1, by1)
        ix2 = min(ax2, bx2);  iy2 = min(ay2, by2)
        inter = max(0, ix2 - ix1) * max(0, iy2 - iy1)
        if inter == 0:
            return 0.0
        union = (ax2-ax1)*(ay2-ay1) + (bx2-bx1)*(by2-by1) - inter
        return inter / union if union > 0 else 0.0

    def _count_riders(self, vehicle_bbox: Tuple,
                      person_boxes: List) -> int:
        """Count persons whose bbox overlaps the vehicle bbox (IoU > 0.15)."""
        return sum(1 for pb in person_boxes
                   if self._iou(vehicle_bbox, tuple(pb)) > 0.15)

    # ── Violation-specific checks ─────────────

    def _has_helmet(self, frame: np.ndarray,
                    bbox: Tuple) -> Tuple[bool, float]:
        """
        Heuristic helmet check on the head region (top third of bbox).
        Uses Hough circles to detect a rounded helmet shape.

        ⚠ Production upgrade: replace with fine-tuned YOLOv8 helmet detector
          trained on IDD or a similar dataset.

        Returns (has_helmet: bool, confidence: float)
        """
        x1, y1, x2, y2 = [int(v) for v in bbox]
        h = y2 - y1
        w = x2 - x1
        head_crop = frame[max(0, y1):y1 + h // 3, max(0, x1):x2]

        if head_crop.size == 0:
            return True, 0.5    # inconclusive — don't flag

        gray = cv2.cvtColor(head_crop, cv2.COLOR_BGR2GRAY)
        circles = cv2.HoughCircles(
            gray, cv2.HOUGH_GRADIENT, 1.2,
            minDist=20, param1=50, param2=30,
            minRadius=w // 8, maxRadius=w // 3
        )

        if circles is not None:
            return True, 0.70   # round object found = likely helmet

        # Fallback: dark blob in head area = dark helmet
        dark_ratio = np.sum(gray < 80) / gray.size
        if dark_ratio > 0.3:
            return True, 0.55

        return False, 0.65      # no helmet found

    def _has_seatbelt(self, *_) -> Tuple[bool, float]:
        """
        Seatbelt check DISABLED — heuristic removed due to poor accuracy.

        ⚠ Production upgrade: fine-tune a binary classifier on:
          https://universe.roboflow.com/search?q=seatbelt
          Then replace this method with a real inference call.

        Currently always returns (True, 0.0) = no violation flagged.
        """
        return True, 0.0

    # ── Event lifecycle ───────────────────────

    def _flag(self,
              key:          Tuple,    # (track_id, violation_type)
              frame_idx:    int,
              ts:           str,
              conf:         float,
              bbox:         Tuple,
              track_id:     int,
              vehicle_type: str,
              rider_count:  int,
              exempt:       bool) -> bool:
        """
        Increment confirm counter for a (track, violation) pair.
        Transitions NEW → ACTIVE after CONFIRM_FRAMES consecutive hits.
        Returns True only on the activation frame (evidence should be saved).
        """
        self._confirm[key] += 1

        if key not in self._events:
            self._events[key] = ViolationEvent(
                event_id     = self._new_event_id(frame_idx),
                track_id     = track_id,
                violation    = key[1],
                camera       = self.camera,
                vehicle_type = vehicle_type,
                rider_count  = rider_count,
                exempt       = exempt,
                plate        = self.anpr.best_plate(track_id),
            )

        ev = self._events[key]

        if ev.state == ViolationState.NEW:
            if self._confirm[key] >= self.CONFIRM_FRAMES:
                ev.activate(frame_idx, ts, conf, bbox)
                return True    # newly activated → caller saves evidence

        elif ev.state == ViolationState.ACTIVE:
            ev.update(frame_idx, ts, conf)

        return False

    def _resolve_stale_tracks(self, active_ids: Set[int],
                               frame_idx: int) -> None:
        """Resolve events for tracks that have vanished for GHOST_FRAMES."""
        for tid in list(self._last_seen):
            if tid not in active_ids:
                if frame_idx - self._last_seen[tid] > self.GHOST_FRAMES:
                    for key in [k for k in self._events if k[0] == tid]:
                        ev = self._events.pop(key)
                        if ev.state == ViolationState.ACTIVE:
                            ev.resolve()
                            self.resolved_events.append(ev)
                    self._last_seen.pop(tid, None)

    # ── Main frame processor ──────────────────

    def process_frame(self,
                      raw_frame: np.ndarray,
                      frame_idx: int
                      ) -> List[Tuple[ViolationEvent, np.ndarray]]:
        """
        Process one frame through the full detection + rule pipeline.

        Parameters
        ----------
        raw_frame  : BGR frame from cv2.VideoCapture
        frame_idx  : sequential frame counter

        Returns
        -------
        List of (ViolationEvent, annotated_frame) for events that
        just became ACTIVE this frame and need evidence saved.
        """
        frame, _ = self.enhancer.enhance(raw_frame)
        ts       = self._timestamp(frame_idx)
        new_evidence: List[Tuple[ViolationEvent, np.ndarray]] = []

        # ── YOLO detection + tracking ─────────
        results = self.model.track(
            frame,
            persist=True,
            conf=self.CONF_DETECTION,
            tracker=self.tracker,
            classes=list(COCO.values()),
            verbose=False
        )

        if not results or results[0].boxes is None:
            return []
        boxes = results[0].boxes
        if boxes.id is None:
            return []

        bboxes = boxes.xyxy.cpu().numpy()
        confs  = boxes.conf.cpu().numpy()
        clss   = boxes.cls.cpu().numpy().astype(int)
        ids    = boxes.id.cpu().numpy().astype(int)

        person_boxes = [bboxes[i] for i, c in enumerate(clss) if c == PERSON_ID]
        tlight_boxes = [bboxes[i] for i, c in enumerate(clss) if c == TLIGHT_ID]
        vehicle_dets = [
            (bboxes[i], float(confs[i]), int(clss[i]), int(ids[i]))
            for i, c in enumerate(clss) if c in VEHICLE_IDS
        ]
        active_ids = {int(tid) for _, _, _, tid in vehicle_dets}

        # ── Signal state ──────────────────────
        signal_state = self.signal.update(frame, frame_idx, tlight_boxes)

        # ── Use auto stop-line if not set ─────
        if self.stop_line_y is None:
            self.stop_line_y = detect_stop_line(frame)

        # ── Per-vehicle checks ────────────────
        for (bbox, det_conf, cls_id, track_id) in vehicle_dets:

            x1, y1, x2, y2 = [int(v) for v in bbox]
            cx = (x1 + x2) / 2
            cy = (y1 + y2) / 2
            class_name = self.model.names[cls_id]
            is_moto    = cls_id == COCO['motorcycle']
            is_car     = cls_id in {COCO['car'], COCO['bus'], COCO['truck']}
            exempt     = any(k in class_name.lower() for k in EXEMPT_KEYWORDS)

            # Spatial filters
            if not in_roi(cx, cy, self.roi_polygon):
                continue
            if not perspective_ok(bbox, self.W, self.H):
                continue

            self._last_seen[track_id] = frame_idx
            self.lane.update(track_id, cx, cy, frame_idx)

            # ANPR — log every vehicle
            plate = detect_and_ocr_plate(frame, bbox, self.ocr)
            if plate != 'UNKNOWN':
                self.anpr.log(track_id, plate, frame_idx, ts, self.camera)

            riders = self._count_riders((x1, y1, x2, y2), person_boxes)

            # Inner helper to flag and collect evidence
            def check(vtype: str, rule_conf: float) -> None:
                fused = self._fuse_confidence(det_conf, rule_conf)
                if fused < self.CONF_VIOLATION:
                    return
                key       = (track_id, vtype)
                activated = self._flag(key, frame_idx, ts, fused,
                                       (x1, y1, x2, y2),
                                       track_id, class_name,
                                       riders, exempt)
                if activated:
                    new_evidence.append((self._events[key], frame.copy()))

            # ─ 1. Helmet non-compliance ───────
            if is_moto and not exempt:
                has_h, hc = self._has_helmet(frame, bbox)
                if not has_h:
                    check('Helmet non-compliance', hc)

            # ─ 2. Triple riding ───────────────
            if is_moto and riders >= 3 and not exempt:
                check('Triple riding', 0.85)

            # ─ 3. Seatbelt (placeholder) ──────
            # Uncomment when trained classifier is ready:
            # if is_car and not exempt:
            #     has_sb, sc = self._has_seatbelt(frame, bbox)
            #     if not has_sb:
            #         check('Seatbelt non-compliance', sc)

            # ─ 4. Red-light violation ─────────
            if signal_state == 'red' and not exempt:
                pts = self.lane.tracks.get(track_id, [])
                if len(pts) >= 5:
                    recent_y = np.array(pts[-5:])[:, 1]
                    if np.std(recent_y) > 3:    # vehicle is moving
                        check('Red-light violation', 0.80)

            # ─ 5. Stop-line violation ─────────
            if signal_state == 'red' and not exempt:
                if y2 > self.stop_line_y:
                    check('Stop-line violation', 0.72)

            # ─ 6. Wrong-side driving ──────────
            if self.lane.is_wrong_side(track_id) and not exempt:
                check('Wrong-side driving', 0.78)

            # ─ 7. Illegal parking ─────────────
            pts = self.lane.tracks.get(track_id, [])
            if len(pts) > int(self.fps * 5):
                recent = np.array(pts[-int(self.fps * 5):])
                stationary = (np.std(recent[:, 0]) < 5 and
                              np.std(recent[:, 1]) < 5)
                if (stationary and
                        in_forbidden_zone(cx, cy, self.forbidden_zones) and
                        not exempt):
                    check('Illegal parking', 0.75)

        # Resolve disappeared tracks
        self._resolve_stale_tracks(active_ids, frame_idx)

        return new_evidence

    # ── End of video ──────────────────────────

    def flush(self, frame_idx: int) -> None:
        """
        Force-resolve all remaining ACTIVE events.
        Call once after the video loop ends.
        """
        for key, ev in list(self._events.items()):
            if ev.state == ViolationState.ACTIVE:
                ev.resolve()
                self.resolved_events.append(ev)
        self._events.clear()

    # ── Evidence annotation ───────────────────

    def annotate_frame(self, frame: np.ndarray,
                       ev: ViolationEvent) -> np.ndarray:
        """
        Draw bounding box + label on a copy of frame for evidence saving.
        Called by the evidence generator (or directly from the run loop).
        """
        out   = frame.copy()
        x1, y1, x2, y2 = ev.bbox
        color = LABEL_COLORS.get(ev.violation, (255, 255, 0))

        cv2.rectangle(out, (x1, y1), (x2, y2), color, 2)

        label = f'{ev.violation} | {ev.plate} | {ev.confidence:.2f}'
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.55, 1)
        cv2.rectangle(out, (x1, y1 - th - 10), (x1 + tw + 6, y1), color, -1)
        cv2.putText(out, label, (x1 + 3, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.55, (255, 255, 255), 1)

        cv2.putText(out, f'Track {ev.track_id}  |  {ev.first_ts}',
                    (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
        return out

# violation_engine/models.py
# ─────────────────────────────────────────────
# Data classes shared across all modules.
# ViolationState: lifecycle of a violation event.
# ViolationEvent: one record per (track_id, violation_type).
# ─────────────────────────────────────────────

from dataclasses import dataclass, asdict
from typing import Tuple
from enum import Enum, auto


class ViolationState(Enum):
    NEW      = auto()   # detected but not yet confirmed
    ACTIVE   = auto()   # confirmed — evidence captured once here
    RESOLVED = auto()   # track disappeared, event closed


@dataclass
class ViolationEvent:
    """
    One event per (track_id, violation_type).
    Evidence (image + clip) is captured exactly once on NEW → ACTIVE transition.
    Confidence is updated as a running max while ACTIVE.
    """
    event_id:      str
    track_id:      int
    violation:     str
    state:         ViolationState = ViolationState.NEW
    plate:         str   = 'UNKNOWN'
    confidence:    float = 0.0
    camera:        str   = 'CAM_01'
    first_frame:   int   = 0
    last_frame:    int   = 0
    first_ts:      str   = ''
    last_ts:       str   = ''
    bbox:          Tuple = (0, 0, 0, 0)   # x1,y1,x2,y2 at time of activation
    vehicle_type:  str   = ''
    rider_count:   int   = 0
    exempt:        bool  = False           # True for ambulance / police etc.
    evidence_img:  str   = ''             # path to annotated JPEG
    evidence_clip: str   = ''             # path to 5-second MP4 clip

    # ── Lifecycle transitions ─────────────────

    def activate(self, frame_idx: int, ts: str,
                 conf: float, bbox: Tuple) -> None:
        """NEW → ACTIVE. Called once when CONFIRM_FRAMES threshold is reached."""
        self.state       = ViolationState.ACTIVE
        self.first_frame = frame_idx
        self.first_ts    = ts
        self.confidence  = conf
        self.bbox        = bbox

    def update(self, frame_idx: int, ts: str, conf: float) -> None:
        """Called every frame while ACTIVE to keep running max confidence."""
        self.last_frame = frame_idx
        self.last_ts    = ts
        self.confidence = max(self.confidence, conf)

    def resolve(self) -> None:
        """ACTIVE → RESOLVED. Called when track disappears from frame."""
        self.state = ViolationState.RESOLVED

    def to_dict(self) -> dict:
        """JSON-serialisable dict. Used by the API and for violations.json."""
        d = asdict(self)
        d['state'] = self.state.name   # enum → string
        return d

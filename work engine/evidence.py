# violation_engine/evidence.py
# ─────────────────────────────────────────────
# EvidenceGenerator
#
# Saves two artefacts per violation event:
#   1. Annotated JPEG  — single frame with bbox + label overlay
#   2. MP4 clip        — CLIP_SECS seconds of context video
#
# Uses a ring-buffer of recent raw frames so the clip
# always includes footage BEFORE the violation was flagged.
# ─────────────────────────────────────────────

import cv2
import numpy as np
from collections import deque
from pathlib import Path
from typing import List

from .models import ViolationEvent

LABEL_COLORS = {
    'Helmet non-compliance':  (0,   0,   255),
    'Triple riding':          (255, 0,   255),
    'Wrong-side driving':     (255, 0,   0),
    'Stop-line violation':    (0,   200, 255),
    'Red-light violation':    (0,   0,   200),
    'Illegal parking':        (128, 0,   255),
}


class EvidenceGenerator:
    """
    Manages frame buffer and writes evidence files.

    Parameters
    ----------
    fps        : video frame rate (used for clip length)
    W, H       : frame dimensions
    frames_dir : directory to save annotated JPEGs
    clips_dir  : directory to save MP4 clips
    clip_secs  : how many seconds of context to save per clip (default 5)
    """

    def __init__(self,
                 fps:        float,
                 W:          int,
                 H:          int,
                 frames_dir: Path,
                 clips_dir:  Path,
                 clip_secs:  int = 5):
        self.fps       = fps
        self.W         = W
        self.H         = H
        self.frames_dir = Path(frames_dir)
        self.clips_dir  = Path(clips_dir)
        self.clip_secs  = clip_secs

        # Ring buffer — stores raw frames for clip extraction
        self._buf: deque = deque(maxlen=int(fps * clip_secs))

        self.frames_dir.mkdir(parents=True, exist_ok=True)
        self.clips_dir.mkdir(parents=True, exist_ok=True)

    # ── Buffer management ─────────────────────

    def push_frame(self, frame: np.ndarray) -> None:
        """Add every raw frame to the buffer. Call BEFORE process_frame()."""
        self._buf.append(frame.copy())

    # ── Saving artefacts ──────────────────────

    def save_frame(self, ev: ViolationEvent,
                   annotated_frame: np.ndarray) -> str:
        """
        Write the annotated frame JPEG and update ev.evidence_img.

        Parameters
        ----------
        ev               : ViolationEvent (evidence_img will be set in-place)
        annotated_frame  : frame already drawn with bbox + labels

        Returns
        -------
        path : str — absolute path to saved JPEG
        """
        path = str(self.frames_dir / f'{ev.event_id}.jpg')
        cv2.imwrite(path, annotated_frame)
        ev.evidence_img = path
        return path

    def save_clip(self, ev: ViolationEvent) -> str:
        """
        Write an MP4 clip from the current ring buffer contents.
        The clip is whatever was in the buffer at the moment of activation,
        so it shows footage leading up to and including the violation.

        Returns
        -------
        path : str — absolute path to saved MP4
        """
        path   = str(self.clips_dir / f'{ev.event_id}.mp4')
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        writer = cv2.VideoWriter(path, fourcc, self.fps, (self.W, self.H))

        for frame in self._buf:
            writer.write(frame)
        writer.release()

        ev.evidence_clip = path
        return path

    def save_evidence(self, ev: ViolationEvent,
                      annotated_frame: np.ndarray) -> None:
        """
        Convenience method — saves both JPEG and clip in one call.
        Sets ev.evidence_img and ev.evidence_clip in-place.
        """
        self.save_frame(ev, annotated_frame)
        self.save_clip(ev)

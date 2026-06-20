# violation_engine/__init__.py
# ─────────────────────────────────────────────
# Public API — import what you need from here.
#
# Person 4 (backend) usage:
#   from violation_engine import ViolationEngineV2, ViolationEvent
#
# Full run (Colab / CLI):
#   from violation_engine.run import run_video
#   run_video('/content/my_video.mp4')
# ─────────────────────────────────────────────

from .models         import ViolationEvent, ViolationState
from .engine         import ViolationEngineV2
from .anpr           import ANPRRegistry, detect_and_ocr_plate
from .enhancer       import AdaptiveEnhancer
from .signal_tracker import SignalTracker
from .lane_tracker   import LaneDirectionTracker
from .evidence       import EvidenceGenerator
from .zones          import (build_default_roi, detect_stop_line,
                              in_roi, perspective_ok,
                              in_forbidden_zone,
                              build_default_forbidden_zones)
from .analytics      import (save_violations_json, save_anpr_csv,
                              generate_charts, print_summary,
                              evaluate_metrics)

__all__ = [
    # Core
    'ViolationEngineV2',
    'ViolationEvent',
    'ViolationState',
    # Sub-systems
    'ANPRRegistry',
    'detect_and_ocr_plate',
    'AdaptiveEnhancer',
    'SignalTracker',
    'LaneDirectionTracker',
    'EvidenceGenerator',
    # Spatial
    'build_default_roi',
    'detect_stop_line',
    'in_roi',
    'perspective_ok',
    'in_forbidden_zone',
    'build_default_forbidden_zones',
    # Analytics
    'save_violations_json',
    'save_anpr_csv',
    'generate_charts',
    'print_summary',
    'evaluate_metrics',
]

# violation_engine/run.py
# ─────────────────────────────────────────────
# Standalone entry point.
# Run this directly in Colab or locally to process a video.
#
# Usage (local):
#   python -m violation_engine.run --video path/to/video.mp4
#
# Usage (Colab cell):
#   from violation_engine.run import run_video
#   run_video('/content/my_traffic_video.mp4')
# ─────────────────────────────────────────────

import argparse
import json
import cv2
import zipfile
from pathlib import Path
from tqdm import tqdm

from .engine    import ViolationEngineV2
from .evidence  import EvidenceGenerator
from .analytics import (save_violations_json, save_anpr_csv,
                         generate_charts, print_summary, evaluate_metrics)


def run_video(video_path: str,
              output_dir: str  = '/content/traffic_project',
              camera_id: str   = 'CAM_01',
              process_every: int = 2,
              clip_secs: int   = 5,
              gt_labels: str   = None) -> dict:
    """
    Full end-to-end pipeline for one video file.

    Parameters
    ----------
    video_path     : path to input video (.mp4 / .avi / .mov)
    output_dir     : root directory for all outputs
    camera_id      : camera label embedded in violation IDs
    process_every  : process every Nth frame (2 = 50% speed, still accurate)
    clip_secs      : seconds of context video saved per violation clip
    gt_labels      : optional path to gt_labels.json for metric evaluation

    Returns
    -------
    dict with keys: violations, anpr_records, stats
    """
    # ── Load models (done once per session) ───
    try:
        from ultralytics import YOLO
        import easyocr
    except ImportError:
        raise ImportError(
            'Run: pip install ultralytics easyocr opencv-python-headless '
            'scikit-learn pandas matplotlib seaborn tqdm'
        )

    print('Loading YOLOv8 model...')
    model      = YOLO('yolov8n.pt')
    print('Loading EasyOCR...')
    ocr_reader = easyocr.Reader(['en'], gpu=True, verbose=False)
    print('✓ Models ready\n')

    # ── Output directories ─────────────────────
    base       = Path(output_dir)
    evidence   = base / 'evidence'
    frames_dir = evidence / 'frames'
    clips_dir  = evidence / 'clips'
    reports    = base / 'reports'
    for d in [frames_dir, clips_dir, reports]:
        d.mkdir(parents=True, exist_ok=True)

    # ── Video info ─────────────────────────────
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        raise RuntimeError(f'Cannot open video: {video_path}')

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps          = cap.get(cv2.CAP_PROP_FPS)
    W            = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    H            = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    ret, sample  = cap.read()
    cap.release()

    if not ret:
        raise RuntimeError('Could not read first frame. Check the video file.')

    print(f'Video: {Path(video_path).name}')
    print(f'  {W}×{H}  |  {fps:.0f} fps  |  {total_frames} frames  '
          f'|  {total_frames/fps:.0f}s\n')

    # ── Engine + evidence generator ────────────
    engine = ViolationEngineV2(
        fps=fps, frame_w=W, frame_h=H,
        yolo_model=model,
        ocr_reader=ocr_reader,
        camera_id=camera_id,
    )
    engine.set_stop_line(sample)   # auto-detect stop line from first frame

    ev_gen = EvidenceGenerator(
        fps=fps, W=W, H=H,
        frames_dir=frames_dir,
        clips_dir=clips_dir,
        clip_secs=clip_secs,
    )

    # ── Main inference loop ────────────────────
    cap       = cv2.VideoCapture(str(video_path))
    frame_idx = 0
    pbar      = tqdm(total=total_frames, desc='Processing', unit='fr')

    while cap.isOpened():
        ret, raw = cap.read()
        if not ret:
            break

        ev_gen.push_frame(raw)   # always buffer raw frames for clips
        frame_idx += 1
        pbar.update(1)

        if frame_idx % process_every != 0:
            continue

        # Run detection + violation logic
        newly_active = engine.process_frame(raw, frame_idx)

        # Save evidence for newly confirmed violations
        for (ev, ann_frame) in newly_active:
            annotated = engine.annotate_frame(ann_frame, ev)
            ev_gen.save_evidence(ev, annotated)

    pbar.close()
    cap.release()
    engine.flush(frame_idx)

    # ── Reports ────────────────────────────────
    events = engine.resolved_events
    print(f'\n✓ Done — {len(events)} violations resolved\n')

    save_violations_json(events, reports / 'violations.json')
    save_anpr_csv(engine.anpr, reports / 'anpr_registry.csv')
    generate_charts(events, fps, reports / 'analytics.png')
    print_summary(events)

    if gt_labels:
        evaluate_metrics(events, Path(gt_labels))

    return {
        'violations':   [ev.to_dict() for ev in events],
        'anpr_records': engine.anpr.records,
        'stats':        dict(engine.enhancer.stats),
    }


# ── CLI entry point ───────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='TRAQ — Traffic Violation Detection')
    parser.add_argument('--video',    required=True,
                        help='Path to input video file')
    parser.add_argument('--output',   default='/content/traffic_project',
                        help='Output directory (default: /content/traffic_project)')
    parser.add_argument('--camera',   default='CAM_01',
                        help='Camera ID label (default: CAM_01)')
    parser.add_argument('--skip',     default=2, type=int,
                        help='Process every Nth frame (default: 2)')
    parser.add_argument('--gt',       default=None,
                        help='Optional path to gt_labels.json for evaluation')
    args = parser.parse_args()

    run_video(
        video_path    = args.video,
        output_dir    = args.output,
        camera_id     = args.camera,
        process_every = args.skip,
        gt_labels     = args.gt,
    )

# violation_engine/run.py
import argparse
import json
import cv2
from pathlib import Path
from tqdm import tqdm

# ── INTEGRATION: Import DB components ──────────
from backend.database import SessionLocal
from backend.models import Violation
# ──────────────────────────────────────────────

from .engine     import ViolationEngineV2
from .evidence   import EvidenceGenerator
from .analytics import (save_violations_json, save_anpr_csv,
                        generate_charts, print_summary, evaluate_metrics)

def run_video(video_path: str,
              output_dir: str  = '/content/traffic_project',
              camera_id: str   = 'CAM_01',
              process_every: int = 2,
              clip_secs: int   = 5,
              gt_labels: str   = None) -> dict:
    
    # ── Load models ───
    try:
        from ultralytics import YOLO
        import easyocr
    except ImportError:
        raise ImportError('Run: pip install ultralytics easyocr opencv-python-headless')

    print('Loading YOLOv8 model...')
    model      = YOLO('yolov8n.pt')
    print('Loading EasyOCR...')
    ocr_reader = easyocr.Reader(['en'], gpu=True, verbose=False)
    print('✓ Models ready\n')

    # ── Output directories ─────────────────────
    base         = Path(output_dir)
    evidence     = base / 'evidence'
    clips_dir    = evidence / 'clips'
    reports      = base / 'reports'
    for d in [evidence, clips_dir, reports]:
        d.mkdir(parents=True, exist_ok=True)

    # ── Video info ─────────────────────────────
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened(): raise RuntimeError(f'Cannot open video: {video_path}')

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps          = cap.get(cv2.CAP_PROP_FPS)
    W            = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    H            = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    ret, sample  = cap.read()
    cap.release()

    # ── Engine + evidence generator ────────────
    engine = ViolationEngineV2(fps=fps, frame_w=W, frame_h=H, yolo_model=model, ocr_reader=ocr_reader, camera_id=camera_id)
    engine.set_stop_line(sample)

    ev_gen = EvidenceGenerator(fps=fps, W=W, H=H, frames_dir=evidence / 'frames', clips_dir=clips_dir, clip_secs=clip_secs)

    # ── Main inference loop ────────────────────
    cap         = cv2.VideoCapture(str(video_path))
    frame_idx = 0
    pbar        = tqdm(total=total_frames, desc='Processing', unit='fr')
    
    # DB session
    db = SessionLocal()

    while cap.isOpened():
        ret, raw = cap.read()
        if not ret: break

        ev_gen.push_frame(raw)
        frame_idx += 1
        pbar.update(1)

        if frame_idx % process_every != 0: continue

        newly_active = engine.process_frame(raw, frame_idx)

        for (ev, ann_frame) in newly_active:
            annotated = engine.annotate_frame(ann_frame, ev)
            ev_gen.save_evidence(ev, annotated)
            
            # ── INTEGRATION: Save to SQLite ──
            case_id = f"VIOL-{camera_id}-{frame_idx}-{ev.track_id}"
            if not db.query(Violation).filter(Violation.case_id == case_id).first():
                new_v = Violation(
                    case_id=case_id,
                    track_id=ev.track_id,
                    time=str(round(frame_idx/fps, 2)),
                    signal=camera_id,
                    plate_ocr=str(ev.plate),
                    infraction=ev.violation,
                    conf="95%",
                    location="KORAMANGALA JUNCTION",
                    status="PENDING REVIEW",
                    video_url=f"http://localhost:8000/static/evidence/clips/{ev.event_id}.mp4"
                )
                db.add(new_v)
                db.commit()

    pbar.close()
    cap.release()
    db.close() # Close session
    engine.flush(frame_idx)

    # ── Reports ────────────────────────────────
    events = engine.resolved_events
    save_violations_json(events, reports / 'violations.json')
    save_anpr_csv(engine.anpr, reports / 'anpr_registry.csv')
    
    return {'violations': [ev.to_dict() for ev in events]}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--video', required=True)
    parser.add_argument('--output', default='/content/traffic_project')
    args = parser.parse_args()

    run_video(video_path=args.video, output_dir=args.output)

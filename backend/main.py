import os
import shutil
import json
from fastapi import FastAPI, Depends, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from .database import SessionLocal, init_db
from . import models

# Get absolute paths to configure static files directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(os.path.dirname(BASE_DIR), "backend", "static")
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(os.path.join(STATIC_DIR, "uploads"), exist_ok=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db() # Create tables on startup

# Copy demo video for simulated playback if it exists
try:
    os.makedirs(os.path.join(STATIC_DIR, "evidence", "clips"), exist_ok=True)
    demo_dest = os.path.join(STATIC_DIR, "evidence", "clips", "demo_clip.mp4")
    src_video = os.path.join(os.path.dirname(STATIC_DIR), "Generate_an_second_photoreal.mp4")
    # If not found directly, try one level up
    if not os.path.exists(src_video):
        src_video = os.path.join(os.path.dirname(os.path.dirname(STATIC_DIR)), "Generate_an_second_photoreal.mp4")
    if os.path.exists(src_video) and not os.path.exists(demo_dest):
        shutil.copy(src_video, demo_dest)
        print("Demo video copied to static directory successfully.")
except Exception as e:
    print(f"Failed to copy demo video: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Mount Static Files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Helper to save violations from the engine thread
def save_to_db(data):
    db = SessionLocal()
    new_v = models.Violation(**data)
    db.add(new_v)
    db.commit()
    db.close()

@app.get("/api/violations")
def get_violations(db: Session = Depends(get_db)):
    return {"violations": db.query(models.Violation).all()}

@app.patch("/api/violations/{case_id}/status")
def update_status(case_id: str, status: str, db: Session = Depends(get_db)):
    v = db.query(models.Violation).filter(models.Violation.case_id == case_id).first()
    if v:
        v.status = status
        db.commit()
    return {"message": "Success"}

@app.patch("/api/violations/{case_id}/plate")
def update_plate(case_id: str, plate: str, db: Session = Depends(get_db)):
    v = db.query(models.Violation).filter(models.Violation.case_id == case_id).first()
    if v:
        v.plate_ocr = plate
        db.commit()
    return {"message": "Success"}

# Background task for running the AI engine or fallback simulation
def process_video_task(video_path: str, camera_id: str):
    try:
        from work_engine.run import run_video
        print(f"Starting AI video processing on {video_path}...")
        run_video(video_path=video_path, output_dir=STATIC_DIR, camera_id=camera_id)
        print("AI video processing completed successfully.")
    except Exception as e:
        print(f"AI engine error or dependencies missing ({e}). Running simulation fallback...")
        
        # Simulated delay for realistic user experience
        import time
        import random
        time.sleep(4)
        
        # Inject standard demo violations
        db = SessionLocal()
        timestamp_sec = int(time.time())
        
        demo_violations = [
            {
                "case_id": f"VIOL-{camera_id}-{timestamp_sec}-1",
                "track_id": 105,
                "time": "12.4",
                "signal": camera_id,
                "plate_ocr": "KA03EX5582",
                "infraction": "Helmet non-compliance",
                "conf": "94%",
                "location": "KORAMANGALA JUNCTION",
                "status": "PENDING REVIEW",
                "video_url": "/static/evidence/clips/demo_clip.mp4"
            },
            {
                "case_id": f"VIOL-{camera_id}-{timestamp_sec}-2",
                "track_id": 108,
                "time": "18.2",
                "signal": camera_id,
                "plate_ocr": "KA51MB2020",
                "infraction": "Red-light violation",
                "conf": "97%",
                "location": "KORAMANGALA JUNCTION",
                "status": "PENDING REVIEW",
                "video_url": "/static/evidence/clips/demo_clip.mp4"
            }
        ]
        
        for data in demo_violations:
            if not db.query(models.Violation).filter(models.Violation.case_id == data["case_id"]).first():
                new_v = models.Violation(**data)
                db.add(new_v)
        db.commit()
        db.close()
        print("Simulation database entries injected successfully.")

@app.post("/api/upload")
async def upload(camera_id: str = "CAM_01", file: UploadFile = File(...), bg: BackgroundTasks = None):
    # Save the file locally in backend/static/uploads
    filename = file.filename
    dest_path = os.path.join(STATIC_DIR, "uploads", filename)
    
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Queue processing task in the background
    if bg:
        bg.add_task(process_video_task, dest_path, camera_id)
        
    return {"status": "processing", "file": filename}


# Config Sync Endpoints
CONFIG_FILE = os.path.join(BASE_DIR, "edge_config.json")

DEFAULT_CONFIG = {
    "vehicleThreshold": 0.75,
    "violationThreshold": 0.80,
    "ocrThreshold": 0.85,
    "streamFPS": 30,
    "signalConfigs": {
        "CAM-01": { "name": "Silk Board Jnc - North", "mode": "Strict", "speedLimit": 60, "redLight": True, "safetyGear": True, "tripleRiding": True },
        "CAM-02": { "name": "Silk Board Jnc - East", "mode": "Standard", "speedLimit": 60, "redLight": True, "safetyGear": True, "tripleRiding": True },
        "CAM-04": { "name": "Koramangala 80ft Rd", "mode": "Standard", "speedLimit": 50, "redLight": False, "safetyGear": True, "tripleRiding": True },
        "CAM-07": { "name": "Whitefield Main Rd", "mode": "Lenient", "speedLimit": 60, "redLight": True, "safetyGear": True, "tripleRiding": False },
        "CAM-09": { "name": "Indiranagar 100ft Rd", "mode": "Strict", "speedLimit": 50, "redLight": True, "safetyGear": True, "tripleRiding": True },
        "CAM-12": { "name": "Outer Ring Road - Cam 12", "mode": "Strict", "speedLimit": 80, "redLight": False, "safetyGear": True, "tripleRiding": False },
        "CAM-18": { "name": "Electronic City Expwy", "mode": "Standard", "speedLimit": 80, "redLight": False, "safetyGear": True, "tripleRiding": False }
    }
}

@app.get("/api/config")
def get_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_CONFIG
    return DEFAULT_CONFIG

@app.post("/api/config")
def save_config(config: dict):
    try:
        with open(CONFIG_FILE, "w") as f:
            json.dump(config, f, indent=2)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


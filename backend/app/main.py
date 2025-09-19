from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routes import auth, devices, heartbeat, notifications

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="IoT Device Monitoring API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(devices.router, prefix="/api/devices", tags=["devices"])
app.include_router(heartbeat.router, prefix="/api/heartbeat", tags=["heartbeat"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])

@app.get("/")
def read_root():
    return {"message": "IoT Device Monitoring API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
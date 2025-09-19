from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import asyncio
import json
from .. import schemas, crud, database, models

router = APIRouter()

# WebSocket manager for real-time notifications
class ConnectionManager:
    def __init__(self):
        self.active_connections: List = []

    async def connect(self, websocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

@router.post("/", response_model=schemas.Heartbeat)
async def create_heartbeat(
    heartbeat: schemas.HeartbeatCreate,
    db: Session = Depends(database.get_db)
):
    db_heartbeat = crud.create_heartbeat(db=db, heartbeat=heartbeat)
    if db_heartbeat is None:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Check notifications
    await check_notifications(db, db_heartbeat)
    
    return db_heartbeat

@router.get("/{device_id}/history", response_model=List[schemas.Heartbeat])
def read_heartbeat_history(
    device_id: str,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(database.get_db)
):
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=7)
    if not end_date:
        end_date = datetime.utcnow()
    
    return crud.get_heartbeats(db, device_id, start_date, end_date)

async def check_notifications(db: Session, heartbeat: models.Heartbeat):
    # Get device info
    device = db.query(models.Device).filter(models.Device.id == heartbeat.device_id).first()
    if not device:
        return
    
    # Get active notifications for this user
    notifications = db.query(models.Notification).filter(
        models.Notification.user_id == device.user_id,
        models.Notification.is_active == True
    ).all()
    
    for notification in notifications:
        # Check if this device should be monitored
        if notification.device_ids:
            device_ids = json.loads(notification.device_ids)
            if str(heartbeat.device_id) not in device_ids:
                continue
        
        # Get the metric value
        metric_value = getattr(heartbeat, notification.metric, None)
        if metric_value is None:
            continue
        
        # Check condition
        threshold_met = False
        if notification.condition == ">":
            threshold_met = metric_value > notification.threshold
        elif notification.condition == "<":
            threshold_met = metric_value < notification.threshold
        elif notification.condition == ">=":
            threshold_met = metric_value >= notification.threshold
        elif notification.condition == "<=":
            threshold_met = metric_value <= notification.threshold
        elif notification.condition == "==":
            threshold_met = metric_value == notification.threshold
        
        if threshold_met:
            # Create alert
            message = f"Device {device.name} - {notification.metric} is {metric_value} (threshold: {notification.threshold})"
            alert = crud.create_notification_alert(
                db, str(notification.id), str(heartbeat.device_id), message, metric_value
            )
            
            # Broadcast to WebSocket connections
            await manager.broadcast(json.dumps({
                "type": "notification",
                "alert": {
                    "id": str(alert.id),
                    "message": message,
                    "device_name": device.name,
                    "metric": notification.metric,
                    "value": metric_value,
                    "threshold": notification.threshold,
                    "created_at": alert.created_at.isoformat()
                }
            }))
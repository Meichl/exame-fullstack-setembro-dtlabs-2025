from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
import json
from .. import schemas, crud, auth, database
from .heartbeat import manager

router = APIRouter()

@router.get("/", response_model=List[schemas.Notification])
def read_notifications(
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return crud.get_notifications(db, str(current_user.id))

@router.post("/", response_model=schemas.Notification)
def create_notification(
    notification: schemas.NotificationCreate,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return crud.create_notification(db=db, notification=notification, user_id=str(current_user.id))

@router.put("/{notification_id}", response_model=schemas.Notification)
def update_notification(
    notification_id: str,
    notification: schemas.NotificationUpdate,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_notification = crud.update_notification(db, notification_id, notification, str(current_user.id))
    if db_notification is None:
        raise HTTPException(status_code=404, detail="Notification not found")
    return db_notification

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if not crud.delete_notification(db, notification_id, str(current_user.id)):
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification deleted successfully"}

@router.get("/alerts", response_model=List[schemas.NotificationAlert])
def read_notification_alerts(
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return crud.get_notification_alerts(db, str(current_user.id))

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import List, Optional
import json
from datetime import datetime, timedelta
from . import models, schemas, auth

# User CRUD
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not auth.verify_password(password, user.hashed_password):
        return False
    return user

# Device CRUD
def get_devices(db: Session, user_id: str):
    return db.query(models.Device).filter(models.Device.user_id == user_id).all()

def get_device(db: Session, device_id: str, user_id: str):
    return db.query(models.Device).filter(
        and_(models.Device.id == device_id, models.Device.user_id == user_id)
    ).first()

def get_device_by_sn(db: Session, sn: str):
    return db.query(models.Device).filter(models.Device.sn == sn).first()

def create_device(db: Session, device: schemas.DeviceCreate, user_id: str):
    db_device = models.Device(**device.dict(), user_id=user_id)
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

def update_device(db: Session, device_id: str, device: schemas.DeviceUpdate, user_id: str):
    db_device = get_device(db, device_id, user_id)
    if db_device:
        update_data = device.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_device, key, value)
        db.commit()
        db.refresh(db_device)
    return db_device

def delete_device(db: Session, device_id: str, user_id: str):
    db_device = get_device(db, device_id, user_id)
    if db_device:
        db.delete(db_device)
        db.commit()
        return True
    return False

# Heartbeat CRUD
def create_heartbeat(db: Session, heartbeat: schemas.HeartbeatCreate):
    device = get_device_by_sn(db, heartbeat.device_sn)
    if not device:
        return None
    
    db_heartbeat = models.Heartbeat(
        device_id=device.id,
        cpu_usage=heartbeat.cpu_usage,
        ram_usage=heartbeat.ram_usage,
        disk_free=heartbeat.disk_free,
        temperature=heartbeat.temperature,
        dns_latency=heartbeat.dns_latency,
        connectivity=heartbeat.connectivity,
        boot_time=heartbeat.boot_time
    )
    db.add(db_heartbeat)
    db.commit()
    db.refresh(db_heartbeat)
    return db_heartbeat

def get_heartbeats(db: Session, device_id: str, start_date: datetime, end_date: datetime):
    return db.query(models.Heartbeat).filter(
        and_(
            models.Heartbeat.device_id == device_id,
            models.Heartbeat.created_at >= start_date,
            models.Heartbeat.created_at <= end_date
        )
    ).order_by(desc(models.Heartbeat.created_at)).all()

def get_latest_heartbeats(db: Session, device_ids: List[str]):
    return db.query(models.Heartbeat).filter(
        models.Heartbeat.device_id.in_(device_ids)
    ).order_by(desc(models.Heartbeat.created_at)).limit(len(device_ids)).all()

# Notification CRUD
def get_notifications(db: Session, user_id: str):
    return db.query(models.Notification).filter(models.Notification.user_id == user_id).all()

def create_notification(db: Session, notification: schemas.NotificationCreate, user_id: str):
    db_notification = models.Notification(**notification.dict(), user_id=user_id)
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    return db_notification

def update_notification(db: Session, notification_id: str, notification: schemas.NotificationUpdate, user_id: str):
    db_notification = db.query(models.Notification).filter(
        and_(models.Notification.id == notification_id, models.Notification.user_id == user_id)
    ).first()
    if db_notification:
        update_data = notification.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_notification, key, value)
        db.commit()
        db.refresh(db_notification)
    return db_notification

def delete_notification(db: Session, notification_id: str, user_id: str):
    db_notification = db.query(models.Notification).filter(
        and_(models.Notification.id == notification_id, models.Notification.user_id == user_id)
    ).first()
    if db_notification:
        db.delete(db_notification)
        db.commit()
        return True
    return False

def create_notification_alert(db: Session, notification_id: str, device_id: str, message: str, value: float):
    db_alert = models.NotificationAlert(
        notification_id=notification_id,
        device_id=device_id,
        message=message,
        value=value
    )
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

def get_notification_alerts(db: Session, user_id: str, limit: int = 100):
    return db.query(models.NotificationAlert).join(models.Notification).filter(
        models.Notification.user_id == user_id
    ).order_by(desc(models.NotificationAlert.created_at)).limit(limit).all()
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# Device schemas
class DeviceBase(BaseModel):
    name: str
    location: str
    sn: str = Field(..., min_length=12, max_length=12)
    description: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class DeviceUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None

class Device(DeviceBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True

# Heartbeat schemas
class HeartbeatBase(BaseModel):
    cpu_usage: float = Field(..., ge=0, le=100)
    ram_usage: float = Field(..., ge=0, le=100)
    disk_free: float = Field(..., ge=0, le=100)
    temperature: float
    dns_latency: float = Field(..., ge=0)
    connectivity: int = Field(..., ge=0, le=1)
    boot_time: datetime

class HeartbeatCreate(HeartbeatBase):
    device_sn: str

class Heartbeat(HeartbeatBase):
    id: uuid.UUID
    device_id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

# Notification schemas
class NotificationBase(BaseModel):
    name: str
    metric: str
    condition: str
    threshold: float
    device_ids: Optional[str] = None
    is_active: bool = True

class NotificationCreate(NotificationBase):
    pass

class NotificationUpdate(BaseModel):
    name: Optional[str] = None
    metric: Optional[str] = None
    condition: Optional[str] = None
    threshold: Optional[float] = None
    device_ids: Optional[str] = None
    is_active: Optional[bool] = None

class Notification(NotificationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationAlert(BaseModel):
    id: uuid.UUID
    notification_id: uuid.UUID
    device_id: uuid.UUID
    message: str
    value: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud, auth, database

router = APIRouter()

@router.get("/", response_model=List[schemas.Device])
def read_devices(
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    return crud.get_devices(db, current_user.id)

@router.post("/", response_model=schemas.Device)
def create_device(
    device: schemas.DeviceCreate,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    existing_device = crud.get_device_by_sn(db, device.sn)
    if existing_device:
        raise HTTPException(
            status_code=400,
            detail="Device with this serial number already exists"
        )
    return crud.create_device(db=db, device=device, user_id=str(current_user.id))

@router.get("/{device_id}", response_model=schemas.Device)
def read_device(
    device_id: str,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_device = crud.get_device(db, device_id, str(current_user.id))
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return db_device

@router.put("/{device_id}", response_model=schemas.Device)
def update_device(
    device_id: str,
    device: schemas.DeviceUpdate,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    db_device = crud.update_device(db, device_id, device, str(current_user.id))
    if db_device is None:
        raise HTTPException(status_code=404, detail="Device not found")
    return db_device

@router.delete("/{device_id}")
def delete_device(
    device_id: str,
    current_user: schemas.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db)
):
    if not crud.delete_device(db, device_id, str(current_user.id)):
        raise HTTPException(status_code=404, detail="Device not found")
    return {"message": "Device deleted successfully"}
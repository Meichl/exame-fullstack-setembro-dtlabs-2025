import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import get_db, Base

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def auth_headers(client):
    # Register and login user
    client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": "test@example.com", "password": "testpassword"}
    )
    
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpassword"}
    )
    
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_device(client, auth_headers):
    response = client.post(
        "/api/devices/",
        json={
            "name": "Test Device",
            "location": "Test Location",
            "sn": "TEST12345678",
            "description": "Test description"
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Test Device"
    assert response.json()["sn"] == "TEST12345678"

def test_get_devices(client, auth_headers):
    # Create a device first
    client.post(
        "/api/devices/",
        json={
            "name": "Test Device",
            "location": "Test Location", 
            "sn": "TEST12345678"
        },
        headers=auth_headers
    )
    
    response = client.get("/api/devices/", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
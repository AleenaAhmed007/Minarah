from fastapi import APIRouter, HTTPException
from ..models.user import UserCreate
from ..services.user_service import user_service
from pydantic import BaseModel

router = APIRouter(prefix="/user", tags=["User"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup")
def signup(user: UserCreate):
    try:
        return user_service.create_user(user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(data: LoginRequest):
    try:
        return user_service.login(data.email, data.password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

from pydantic import BaseModel, EmailStr
from typing import Optional

class RescueTeamCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    province: str
    area: str
    phone: str
    availability: str = "Available"  # Available | Busy | Offline

class RescueTeamDB(RescueTeamCreate):
    id: Optional[str] = None

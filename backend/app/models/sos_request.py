from pydantic import BaseModel
from typing import Optional

class SOSCreate(BaseModel):
    email: str
    name: str
    province: str
    area: str
    location: str
    issue: str
    priority: str  # High / Medium / Low
    status: str = "Pending"
    rescue_team: Optional[str] = None

class SOSDB(SOSCreate):
    id: str | None = None

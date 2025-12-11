from fastapi import APIRouter, HTTPException
from ..models.rescue_team import RescueTeamCreate
from ..services.rescue_team_service import rescue_team_service
from pydantic import BaseModel

router = APIRouter(prefix="/rescue", tags=["Rescue Teams"])

@router.post("/register")
def register_team(team: RescueTeamCreate):
    try:
        return rescue_team_service.register_team(team)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class RescueLoginData(BaseModel):
    email: str
    password: str

@router.post("/login")
def rescue_login(data: RescueLoginData):
    try:
        return rescue_team_service.login(data.email, data.password)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/available")
def available_teams():
    return rescue_team_service.get_available()

@router.put("/status/{team_id}")
def change_status(team_id: str, status: str):
    return rescue_team_service.update_status(team_id, status)

@router.get("/allTeams")
def get_all_teams():
    return rescue_team_service.get_all_teams()
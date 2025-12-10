from fastapi import APIRouter
from ..models.sos_request import SOSCreate
from ..services.sos_service import sos_service

router = APIRouter(prefix="/sos", tags=["SOS"])

@router.post("/create")
async def create_sos(sos: SOSCreate):
    return await sos_service.create_sos(sos)

@router.get("/pending")
def pending_sos():
    return sos_service.get_pending()

@router.put("/assign/{sos_id}")
def assign_sos(sos_id: str, team_email: str):
    return sos_service.assign_team(sos_id, team_email)

@router.put("/rescued/{sos_id}")
def rescued(sos_id: str):
    return sos_service.mark_rescued(sos_id)

@router.get("/filter")
def filter_sos(province: str, area: str):
    return sos_service.get_by_province_area(province, area)

@router.get("/assigned/{rescue_email}")
def assigned_sos(rescue_email: str):
    return sos_service.get_assigned_sos(rescue_email)

@router.get("/rescuedSOS")
def rescued_sos(rescue_email: str):
    return sos_service.rescued_sos(rescue_email)


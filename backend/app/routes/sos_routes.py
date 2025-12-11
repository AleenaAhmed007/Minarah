from fastapi import APIRouter
from ..models.sos_request import SOSCreate
from ..services.sos_service import sos_service

router = APIRouter(prefix="/sos", tags=["SOS"])

# Async because websocket broadcast is async
@router.post("/create")
async def create_sos(sos: SOSCreate):
    return await sos_service.create_sos(sos)

# Synchronous
@router.get("/pending")
def pending_sos():
    return sos_service.get_pending()

# Async because websocket broadcast is async
@router.put("/assign/{sos_id}")
async def assign_sos(sos_id: str, team_email: str):
    return await sos_service.assign_team(sos_id, team_email)

# Async because websocket broadcast is async
@router.put("/rescued/{sos_id}")
async def rescued(sos_id: str):
    return await sos_service.mark_rescued(sos_id)

# Synchronous
@router.get("/filter")
def filter_sos(province: str, area: str):
    return sos_service.get_by_province_area(province, area)

# Synchronous
@router.get("/assigned/{rescue_email}")
def assigned_sos(rescue_email: str):
    return sos_service.get_assigned_sos(rescue_email)

# Synchronous
@router.get("/rescuedSOS")
def rescued_sos(rescue_email: str):
    return sos_service.rescued_sos(rescue_email)

# Synchronous
@router.get("/sos")
def get_all_sos():
    return sos_service.get_all_sos()

from pydantic import BaseModel, Field
from typing import Dict, List

class RoadNode(BaseModel):
    id: str
    name: str
    lat: float
    lng: float

class RouteResponse(BaseModel):
    path: List[str] = Field(..., description="Ordered list of road/point IDs")
    distance: float = Field(..., description="Total distance in KM")
    status: str = "OK"
                
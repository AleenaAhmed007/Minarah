from fastapi import APIRouter, Query, HTTPException
from ..services.routing_service import routing_service

router = APIRouter(prefix="/route", tags=["Routing"])

@router.get("/find")
def get_route(
    start_id: str = Query(..., description="Start node MongoDB ID"),
    end_id: str = Query(..., description="End node MongoDB ID"),
    flooded: str = Query("", description="Comma-separated list of flooded road-node IDs")
):
    # Split flooded IDs
    flooded_roads = [f.strip() for f in flooded.split(",") if f.strip()]

    # Ensure DB graph connected
    if routing_service.graph is None:
        raise HTTPException(status_code=500, detail="Routing graph not initialized in backend.")

    # Fetch nodes
    start = routing_service.graph.find_one({"_id": start_id})
    end = routing_service.graph.find_one({"_id": end_id})

    if not start:
        raise HTTPException(status_code=404, detail=f"Start node '{start_id}' not found.")

    if not end:
        raise HTTPException(status_code=404, detail=f"End node '{end_id}' not found.")

    # Run A* Routing
    result = routing_service.find_route(start, end, flooded_roads)

    # No route found
    if result.get("status") == "NO_ROUTE":
        return {
            "status": "NO_ROUTE",
            "path": [],
            "distance": 0,
            "message": "No safe path found — all possible roads may be flooded."
        }

    # Normal result
    return {
        "status": "OK",
        "path": result["path"],
        "distance": result["distance"]
    }

from ..config import db
from ..models.sos_request import SOSCreate
from ..websockets.ws_manager import ws_manager
from bson import ObjectId
import heapq
import asyncio

# Unified priority mapping
PRIORITY_MAP = {
    "Critical": 3,
    "High": 2,
    "Medium": 1,
    "Low": 0
}

class SosService:
    def __init__(self):
        self.collection = db["sos"]

    # =========================================================
    # Create SOS
    # =========================================================
    async def create_sos(self, data: SOSCreate):
        data = data.dict()
        data["status"] = "Pending"

        self.collection.insert_one(data)

        # WebSocket broadcast
        await ws_manager.broadcast({
            "type": "NEW_SOS",
            "name": data["name"],
            "priority": data["priority"],
            "location": data["location"],
        })

        return {"message": "SOS Created"}

    # =========================================================
    # Get Pending SOS (Heap Priority Queue)
    # Highest priority → first
    # =========================================================
    def get_pending(self):
        pq = []
        sos_list = list(self.collection.find({"status": "Pending"}))

        for sos in sos_list:
            sos["_id"] = str(sos["_id"])

            priority_value = PRIORITY_MAP.get(sos.get("priority", ""), 0)

            # Push as (-priority, id, sos) to sort highest first
            heapq.heappush(pq, (-priority_value, sos["_id"], sos))

        sorted_sos = []
        while pq:
            _, _, sos = heapq.heappop(pq)
            sorted_sos.append(sos)

        return sorted_sos

    # =========================================================
    # Assign a Rescue Team
    # =========================================================
    async def assign_team(self, sos_id, rescue_email):

        updated = self.collection.update_one(
            {"_id": ObjectId(sos_id)},
            {"$set": {"rescue_team": rescue_email, "status": "Assigned"}}
        )

        if updated.modified_count > 0:
            await ws_manager.broadcast({
                "type": "SOS_ASSIGNED",
                "sos_id": sos_id,
                "rescue_team": rescue_email,
            })

        return {"message": "Rescue Team Assigned"}

    # =========================================================
    # Mark SOS as Rescued
    # =========================================================
    async def mark_rescued(self, sos_id):

        updated = self.collection.update_one(
            {"_id": ObjectId(sos_id)},
            {"$set": {"status": "Rescued"}}
        )

        if updated.modified_count > 0:
            await ws_manager.broadcast({
                "type": "SOS_RESCUED",
                "sos_id": sos_id,
            })

        return {"message": "User Rescued Successfully"}

    # =========================================================
    # Filter by province + area
    # =========================================================
    def get_by_province_area(self, province, area):
        sos_list = list(self.collection.find({
            "province": {"$regex": f"^{province}$", "$options": "i"},
            "area": {"$regex": f"^{area}$", "$options": "i"}
        }))

        for sos in sos_list:
            sos["_id"] = str(sos["_id"])

        return sos_list

    # =========================================================
    # Assigned SOS (team-specific)
    # =========================================================
    def get_assigned_sos(self, rescue_email):
        sos_list = list(self.collection.find({
            "status": "Assigned",
            "rescue_team": rescue_email
        }))

        for sos in sos_list:
            sos["_id"] = str(sos["_id"])

        return sos_list

    # =========================================================
    # Rescued SOS (team-specific)
    # =========================================================
    def rescued_sos(self, rescue_email):
        sos_list = list(self.collection.find({
            "status": "Rescued",
            "rescue_team": rescue_email
        }))

        for sos in sos_list:
            sos["_id"] = str(sos["_id"])

        return sos_list

    # =========================================================
    # Get ALL SOS (corrected)
    # =========================================================
    def get_all_sos(self):
        sos_list = list(self.collection.find())

        for sos in sos_list:
            sos["_id"] = str(sos["_id"])

        return sos_list


sos_service = SosService()
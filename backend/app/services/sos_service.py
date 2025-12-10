from ..config import db
from ..models.sos_request import SOSCreate
from ..websockets.ws_manager import ws_manager
from bson import ObjectId
import asyncio
import heapq
PRIORITY_MAP = {
    "High": 3,
    "Medium": 2,
    "Low": 1
    }
class SosService:
    def __init__(self):
        self.collection = db["sos"]

    async def create_sos(self, data: SOSCreate):
        data = data.dict()
        data["status"] = "Pending"
        self.collection.insert_one(data)

        # Real-time alert
        await ws_manager.broadcast({
            "type": "NEW_SOS",
            "user": data["name"],
            "priority": data["priority"],
            "location": data["location"]
        })

        return {"message": "SOS Created"}

    #def get_pending(self):
        #sos_list = list(self.collection.find({"status": "Pending"}).sort("priority", -1))
        #for sos in sos_list:
            #sos["_id"] = str(sos["_id"])
        #return sos_list
    

    def get_pending(self):
        pq = []
        sos_list = list(self.collection.find({"status": "Pending"}))
        
        priority_map = {
            "Critical": 3,
            "High": 2,
            "Medium": 1,
            "Low": 0
        }
       

        for sos in sos_list:
        
           sos["_id"] = str(sos["_id"])
           # convert text -> numeric priority
           priority_value = priority_map.get(sos.get("priority", ""), 0)

           # Push into heap (negative so highest comes first)
           heapq.heappush(pq, (-priority_value, sos["_id"], sos))

    # now pop in sorted order
        sorted_sos = []
        while pq:
           _, _, sos = heapq.heappop(pq)
           sorted_sos.append(sos)

        return sorted_sos
        




    def assign_team(self, sos_id, rescue_email):
        self.collection.update_one(
            {"_id": ObjectId(sos_id)},
            {"$set": {"rescue_team": rescue_email, "status": "Assigned"}}
        )
        return {"message": "Rescue Team Assigned"}

    def mark_rescued(self, sos_id):
        self.collection.update_one(
            {"_id": ObjectId(sos_id)},
            {"$set": {"status": "Rescued"}}
        )
        return {"message": "User Rescued Successfully"}

    def get_by_province_area(self, province, area):
        sos_list = list(self.collection.find({
            "province": {"$regex": f"^{province}$", "$options": "i"},
            "area": {"$regex": f"^{area}$", "$options": "i"}
        }))
        for sos in sos_list:
            sos["_id"] = str(sos["_id"])
        return sos_list
    
    def rescued_sos(self, rescue_email):
        sos_list = list(self.collection.find({
            "status": "Rescued",
            "rescue_team": rescue_email   # <--- filter added
        }))

        for sos in sos_list:
           sos["_id"] = str(sos["_id"])
        return sos_list
    
    def get_assigned_sos(self, rescue_email):
        sos_list = list(self.collection.find({
            "status": "Assigned",
            "rescue_team": rescue_email   # <--- filter added
        }))

        for sos in sos_list:
           sos["_id"] = str(sos["_id"])
        return sos_list


sos_service = SosService()

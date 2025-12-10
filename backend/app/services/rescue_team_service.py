from ..config import db
from bson import ObjectId
from passlib.hash import argon2
from ..models.rescue_team import RescueTeamCreate

class RescueTeamService:
    def __init__(self):
        self.collection = db["rescue_teams"]

    def register_team(self, data: RescueTeamCreate):
        # email exists check
        existing = self.collection.find_one({"email": data.email})
        if existing:
            raise Exception("Email already exists")

        hashed = argon2.hash(data.password)

        team_dict = data.dict()
        team_dict["password"] = hashed

        result = self.collection.insert_one(team_dict)
        return {"message": "Rescue Team Registered", "id": str(result.inserted_id)}

    def login(self, email, password):
        team = self.collection.find_one({"email": email})
        if not team:
            raise Exception("Team not found")

        if not argon2.verify(password, team["password"]):
            raise Exception("Incorrect password")

        return {
            "id": str(team["_id"]),
            "name": team["name"],
            "email": team["email"],
            "province": team["province"],
            "area": team["area"],
            "phone": team["phone"],
            "availability": team["availability"],
            "role": "rescue"
        }

    def get_available(self):
        teams = list(self.collection.find({"availability": "Available"}))
        for t in teams:
            t["_id"] = str(t["_id"])
        return teams

    def update_status(self, team_id, status):
        self.collection.update_one(
            {"_id": ObjectId(team_id)},
            {"$set": {"availability": status}}
        )
        return {"message": "Status Updated"}

rescue_team_service = RescueTeamService()

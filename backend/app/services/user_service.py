from ..config import db
from ..models.user import UserCreate
from passlib.hash import argon2

class UserService:
    def __init__(self):
        self.collection = db["users"]

    def create_user(self, user: UserCreate):
        existing = self.collection.find_one({"email": user.email})
        if existing:
            raise Exception("Email already exists")

        hashed = argon2.hash(user.password)

        user_dict = user.dict()
        user_dict["password"] = hashed

        self.collection.insert_one(user_dict)
        return {"message": "User created"}

    def login(self, email: str, password: str):
        # Hard-coded admin 
        if email == "admin@minarah.pk" and password == "Admin123":
            return {
                "name": "Admin",
                "email": email,
                "isAdmin": True
            }

        user = self.collection.find_one({"email": email})
        if not user:
            raise Exception("User not found")

        if not argon2.verify(password, user["password"]):
            raise Exception("Incorrect password")

        return {
            "name": user["name"],
            "role": user.get("role", "citizen"),
            "email": user["email"],
            "province": user["province"],
            "area": user["area"],
            "isAdmin": False
        }

user_service = UserService()

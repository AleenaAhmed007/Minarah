from pydantic_settings import BaseSettings
from pymongo import MongoClient


class Settings(BaseSettings):
    MONGO_URL: str
    SECRET_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()

client = MongoClient(settings.MONGO_URL)
db = client.get_database()  # auto picks minarah
# 👈 database name set here


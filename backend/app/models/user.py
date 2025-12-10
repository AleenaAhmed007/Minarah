from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., max_length=72)
    province: str
    area: str

class UserDB(UserCreate):
    id: str | None = None


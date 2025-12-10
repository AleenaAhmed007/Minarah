from pydantic import BaseModel, Field, validator

class FloodPredictionInput(BaseModel):
    month: int = Field(..., ge=1, le=12, description="Month number (1-12)")
    year: int = Field(..., ge=1900, le=2100, description="Year of data")
    temp: float = Field(..., description="Temperature in Celsius")
    ice: float = Field(..., description="Ice coverage index")
    veg: float = Field(..., description="Vegetation index")
    rain_mm: float = Field(..., description="Rainfall in mm")
    province: str = Field(..., description="Province name")

    @validator("province")
    def normalize_province(cls, v):
        return v.strip().title()

class FloodPredictionOutput(BaseModel):
    flood: bool = Field(..., description="Flood prediction True/False")
    severity: str = Field(..., description="Level of severity")

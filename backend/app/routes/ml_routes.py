from fastapi import APIRouter
from ..services.ml_service import prediction_service
from ..models.prediction import FloodPredictionInput, FloodPredictionOutput

router = APIRouter(prefix="/flood", tags=["Flood"])

@router.post("/predict", response_model=FloodPredictionOutput)
def flood_prediction(data: FloodPredictionInput):
    return prediction_service.predict_flood_and_severity(data)

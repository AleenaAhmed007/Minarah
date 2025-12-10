import numpy as np
from ..config import db
from ..ml_models.loader import (
    scaler,
    rf_flood_model,
    pre_flood_severity_model,
    pre_flood_severity_label_encoder,
    province_encoder
)
from ..models.prediction import FloodPredictionInput, FloodPredictionOutput

class PredictionService:
    def __init__(self):
        self.collection = db["prediction"]

    def prepare_features(self, input_data: FloodPredictionInput) -> np.ndarray:
        numeric_features = np.array([
            input_data.year,
            input_data.temp,
            input_data.ice,
            input_data.veg,
            input_data.rain_mm
        ]).reshape(1, -1)

        scaled_numeric = scaler.transform(numeric_features)
        pronvice = input_data.province.title()
        month = np.array([[input_data.month]])

        province_encoded = province_encoder.transform([pronvice])
        if province_encoded.ndim == 1:
            province_encoded = province_encoded.reshape(1, -1)

        # now all shapes are 2D → safe for hstack
        final_features = np.hstack([scaled_numeric, month, province_encoded])
        return final_features

    def predict_flood_and_severity(self, input_data: FloodPredictionInput) -> FloodPredictionOutput:
        flood_features = self.prepare_features(input_data)

        flood_pred = rf_flood_model.predict(flood_features)[0]
        flood_conf = float(rf_flood_model.predict_proba(flood_features)[0].max())

        severity_features = np.array([[
            input_data.rain_mm,
            input_data.temp,
            input_data.veg,
            max(0, input_data.ice)
        ]])

        if flood_pred == 1:
            severity_encoded = pre_flood_severity_model.predict(severity_features)[0]
            severity_pred = pre_flood_severity_label_encoder.inverse_transform([severity_encoded])[0]
        else:
            severity_pred = "No Flood"

        self.collection.insert_one({
            "month": input_data.month,
            "year": input_data.year,
            "temp": input_data.temp,
            "ice": input_data.ice,
            "veg": input_data.veg,
            "rain_mm": input_data.rain_mm,
            "province": input_data.province.strip().title(),
            "flood_pred": bool(flood_pred),
            "severity": severity_pred,
            "confidence": flood_conf
        })

        return FloodPredictionOutput(
            flood=bool(flood_pred),
            severity=severity_pred
        )

prediction_service = PredictionService()

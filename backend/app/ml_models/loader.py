import os
import joblib

BASE_DIR = os.path.dirname(__file__)
ARTIFACTS_DIR = os.path.join(BASE_DIR, "artifacts")

# -----------------------------
# Load Shared Encoders & Scaler
# -----------------------------
province_encoder = joblib.load(
    os.path.join(ARTIFACTS_DIR, "encoders", "province_encoder.pkl")
)

scaler = joblib.load(
    os.path.join(ARTIFACTS_DIR, "preprocessors", "scaler.pkl")
)

# -----------------------------
# Load Flood Occurrence Model
# -----------------------------
rf_flood_model = joblib.load(
    os.path.join(ARTIFACTS_DIR, "models", "rf_flood_model.pkl")
)

# -----------------------------
# Load Flood Severity Model + Label Encoder
# -----------------------------
pre_flood_severity_model = joblib.load(
    os.path.join(ARTIFACTS_DIR, "models", "pre_flood_severity_model.pkl")
)

pre_flood_severity_label_encoder = joblib.load(
    os.path.join(ARTIFACTS_DIR, "encoders", "pre_flood_severity_label_encoder.pkl")
)

import os
import joblib

BASE_DIR = os.path.dirname(__file__)

# -----------------------------
# Load Shared Encoders & Scaler
# -----------------------------
province_encoder = joblib.load(os.path.join(BASE_DIR, "province_encoder.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "scaler.pkl"))

# -----------------------------
# Load Flood Occurrence Model
# -----------------------------
rf_flood_model = joblib.load(os.path.join(BASE_DIR, "rf_flood_model.pkl"))

# -----------------------------
# Load Flood Severity Model + Label Encoder
# -----------------------------
pre_flood_severity_model = joblib.load(os.path.join(BASE_DIR, "pre_flood_severity_model.pkl"))
pre_flood_severity_label_encoder = joblib.load(os.path.join(BASE_DIR, "pre_flood_severity_label_encoder.pkl"))

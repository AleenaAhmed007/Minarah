import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import numpy as np

# -----------------------------
# LOAD DATA
# -----------------------------
df = pd.read_csv(r"D:\project\Minarah\backend\app\ml_models\combined_flood_data.csv")

# -----------------------------
# SELECT PRE-FLOOD FEATURES
# -----------------------------
pre_flood_features = ['Rain_mm', 'Temp', 'Veg', 'Ice']

# -----------------------------
# NEW SEVERITY BASED ON FORMULA (PRE-FLOOD)
# -----------------------------
def assign_severity_formula(row):
    rain = row.get('Rain_mm', 0) / 500
    veg = row.get('Veg', 0) / 5000
    temp = row.get('Temp', 0) / 50
    ice = max(0, row.get('Ice', 0)) / 10
    score = 0.5*rain + 0.3*veg + 0.2*temp + 0.1*ice

    if score >= 0.6:
        return "Severe"
    elif score >= 0.3:
        return "Moderate"
    return "Low"

df['Severity'] = df.apply(assign_severity_formula, axis=1)

# -----------------------------
# LABEL ENCODING
# -----------------------------
le = LabelEncoder()
df['Severity'] = le.fit_transform(df['Severity'])

# -----------------------------
# SPLIT DATA
# -----------------------------
X = df[pre_flood_features]
y = df['Severity']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# -----------------------------
# LOAD SHARED SCALER
# -----------------------------
shared_scaler = joblib.load(r"D:\project\Minarah\backend\app\ml_models\scaler.pkl")  # previously saved scaler

# Create numeric transformer using the shared scaler
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='mean')),
    ('scaler', shared_scaler)
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, pre_flood_features)
    ]
)

# -----------------------------
# RANDOM FOREST PIPELINE
# -----------------------------
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('clf', RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        random_state=42,
        class_weight='balanced'
    ))
])

# -----------------------------
# TRAIN MODEL
# -----------------------------
model.fit(X_train, y_train)

# -----------------------------
# EVALUATE MODEL
# -----------------------------
y_pred = model.predict(X_test)

print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))
print("\nClassification Report:\n", classification_report(y_test, y_pred, target_names=le.classes_))

# -----------------------------
# SAVE MODEL + ENCODER
# -----------------------------
joblib.dump(model, "pre_flood_severity_model.pkl")
joblib.dump(le, "pre_flood_severity_label_encoder.pkl")
print("\nModel saved as pre_flood_severity_model.pkl")
print("Label Encoder saved as pre_flood_severity_label_encoder.pkl")

# -----------------------------
# SAMPLE TEST
# -----------------------------
sample_test = pd.DataFrame({
    'Rain_mm': [150],
    'Temp': [35],
    'Veg': [4000],
    'Ice': [-0.1]
})

pred = model.predict(sample_test)[0]
pred_label = le.inverse_transform([pred])[0]
proba = model.predict_proba(sample_test)[0]

print("\n--- SAMPLE TEST RESULT ---")
print("Predicted Severity:", pred_label)
print("Class Probabilities:", dict(zip(le.inverse_transform([0,1,2]), proba)))

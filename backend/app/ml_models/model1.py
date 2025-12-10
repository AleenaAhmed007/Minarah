import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from imblearn.combine import SMOTETomek

from sklearn.ensemble import RandomForestClassifier
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

# ----------------------------
# 1. Load cleaned dataset
# ----------------------------
df = pd.read_csv(r"D:\project\Minarah\backend\app\ml_models\combined_flood_data.csv")

# ----------------------------
# 2. Encode categorical variables
# ----------------------------
le = LabelEncoder()
df['Province_enc'] = le.fit_transform(df['Province'].astype(str))

# ----------------------------
# 3. Define features and target
# ----------------------------
features = ['Month', 'Year', 'Temp', 'Ice', 'Veg', 'Rain_mm', 'Province_enc']
X = df[features].copy()
y = df['Flood'].copy()

# Fill missing values
X = X.fillna(X.mean())

# ----------------------------
# 4. Load shared scaler
# ----------------------------
scaler = joblib.load(r"D:\project\Minarah\backend\app\ml_models\scaler.pkl")  # previously saved scaler
num_cols = ['Year', 'Temp', 'Ice', 'Veg', 'Rain_mm']
X[num_cols] = scaler.transform(X[num_cols])

# ----------------------------
# 5. Train/Test Split
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ----------------------------
# 6. Apply SMOTE + Tomek
# ----------------------------
smote_tomek = SMOTETomek(sampling_strategy=0.5, random_state=42)
X_res, y_res = smote_tomek.fit_resample(X_train, y_train)

# ----------------------------
# 7. Train RandomForest Classifier
# ----------------------------
rf_model = RandomForestClassifier(
    n_estimators=500,
    max_depth=10,
    random_state=42,
    class_weight='balanced',  # handle imbalance
    n_jobs=-1
)

rf_model.fit(X_res, y_res)

# ----------------------------
# 8. Predictions and Evaluation
# ----------------------------
y_pred = rf_model.predict(X_test)
y_pred_proba = rf_model.predict_proba(X_test)[:,1]

print("Classification Report:\n")
print(classification_report(y_test, y_pred))

print("Confusion Matrix:\n")
cm = confusion_matrix(y_test, y_pred)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.show()

roc_auc = roc_auc_score(y_test, y_pred_proba)
print(f"ROC-AUC Score: {roc_auc:.4f}")

# ----------------------------
# 9. Feature Importance
# ----------------------------
importances = rf_model.feature_importances_
indices = np.argsort(importances)[::-1]
plt.figure(figsize=(8,5))
plt.title("RandomForest Feature Importance")
plt.bar(range(len(features)), importances[indices], align='center')
plt.xticks(range(len(features)), [features[i] for i in indices], rotation=45)
plt.show()

# ----------------------------
# 10. Example: Test a sample
# ----------------------------
sample_extreme = pd.DataFrame({
    'Month': [8],           # peak monsoon
    'Year': [2023],
    'Temp': [28],
    'Ice': [0],
    'Veg': [50],            # very low vegetation
    'Rain_mm': [900],       # extreme rainfall
    'Province_enc': [le.transform(['Punjab'])[0]]
})

sample_extreme[num_cols] = scaler.transform(sample_extreme[num_cols])
pred_proba = rf_model.predict_proba(sample_extreme)[:,1]

threshold = 0.2
pred_label = (pred_proba >= threshold).astype(int)

print("Predicted Flood:", "Yes" if pred_label[0]==1 else "No")
print("Flood Probability:", pred_proba[0])

# ----------------------------
# 11. Save Model and Encoder
# ----------------------------
joblib.dump(rf_model, "rf_flood_model.pkl")
joblib.dump(le, "province_encoder.pkl")
print("RandomForest model and label encoder saved.")

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, precision_recall_curve
from imblearn.combine import SMOTETomek

from sklearn.ensemble import RandomForestClassifier
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import warnings
warnings.filterwarnings('ignore')

# ----------------------------
# 1. Load cleaned dataset
# ----------------------------
df = pd.read_csv(r"D:\project\Minarah\backend\app\ml_models\data\combined_flood_data.csv")

print(f"Dataset shape: {df.shape}")
print(f"Flood class distribution:\n{df['Flood'].value_counts()}")
print(f"Missing values:\n{df.isnull().sum()}")

# ----------------------------
# 2. Encode categorical variables
# ----------------------------
le = LabelEncoder()
df['Province_enc'] = le.fit_transform(df['Province'].astype(str))

# Save mapping for interpretability
province_mapping = dict(zip(le.classes_, le.transform(le.classes_)))
print(f"\nProvince Encoding: {province_mapping}")

# ----------------------------
# 3. Define features and target
# ----------------------------
features = ['Month', 'Year', 'Temp', 'Ice', 'Veg', 'Rain_mm', 'Province_enc']
X = df[features].copy()
y = df['Flood'].copy()

# Fill missing values with median (more robust to outliers than mean)
X = X.fillna(X.median())

# ----------------------------
# 4. Load shared scaler
# ----------------------------
try:
    scaler = joblib.load(r"D:\project\Minarah\backend\app\ml_models\artifacts\preprocessors\scaler.pkl")
    print("\nScaler loaded successfully")
except FileNotFoundError:
    print("\nWarning: Scaler not found. Consider creating one if this is first run.")
    from sklearn.preprocessing import StandardScaler
    scaler = StandardScaler()
    # Fit on all numerical columns
    num_cols = ['Year', 'Temp', 'Ice', 'Veg', 'Rain_mm']
    scaler.fit(df[num_cols])
    joblib.dump(scaler, "scaler.pkl")

num_cols = ['Year', 'Temp', 'Ice', 'Veg', 'Rain_mm']
X[num_cols] = scaler.transform(X[num_cols])

# ----------------------------
# 5. Train/Test Split
# ----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\nTraining set: {X_train.shape}, Test set: {X_test.shape}")
print(f"Train flood distribution:\n{y_train.value_counts()}")

# ----------------------------
# 6. Apply SMOTE + Tomek
# ----------------------------
print("\nApplying SMOTE-Tomek for class balancing...")
smote_tomek = SMOTETomek(sampling_strategy=0.5, random_state=42)
X_res, y_res = smote_tomek.fit_resample(X_train, y_train)

print(f"After resampling: {X_res.shape}")
print(f"Resampled flood distribution:\n{pd.Series(y_res).value_counts()}")

# ----------------------------
# 7. Train RandomForest Classifier with Cross-Validation
# ----------------------------
print("\nTraining RandomForest Classifier...")
rf_model = RandomForestClassifier(
    n_estimators=500,
    max_depth=10,
    min_samples_split=5,
    min_samples_leaf=2,
    max_features='sqrt',  # Better for preventing overfitting
    random_state=42,
    class_weight='balanced',
    n_jobs=-1
)

# Cross-validation on resampled data
cv_scores = cross_val_score(rf_model, X_res, y_res, cv=5, scoring='roc_auc')
print(f"Cross-validation ROC-AUC scores: {cv_scores}")
print(f"Mean CV ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

# Train on full resampled training set
rf_model.fit(X_res, y_res)

# ----------------------------
# 8. Predictions and Evaluation
# ----------------------------
y_pred = rf_model.predict(X_test)
y_pred_proba = rf_model.predict_proba(X_test)[:,1]

print("\n" + "="*50)
print("EVALUATION METRICS")
print("="*50)

print("\nClassification Report:")
print(classification_report(y_test, y_pred, target_names=['No Flood', 'Flood']))

# Confusion Matrix
print("\nConfusion Matrix:")
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
            xticklabels=['No Flood', 'Flood'],
            yticklabels=['No Flood', 'Flood'])
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix - RandomForest")
plt.tight_layout()
plt.savefig('confusion_matrix.png', dpi=300)
plt.show()

# Calculate metrics manually for clarity
tn, fp, fn, tp = cm.ravel()
print(f"\nTrue Negatives: {tn}, False Positives: {fp}")
print(f"False Negatives: {fn}, True Positives: {tp}")
print(f"Specificity: {tn/(tn+fp):.4f}")
print(f"Sensitivity (Recall): {tp/(tp+fn):.4f}")

# ROC-AUC
roc_auc = roc_auc_score(y_test, y_pred_proba)
print(f"\nROC-AUC Score: {roc_auc:.4f}")

# Precision-Recall Curve (better for imbalanced datasets)
precision, recall, thresholds = precision_recall_curve(y_test, y_pred_proba)
plt.figure(figsize=(8, 6))
plt.plot(recall, precision, marker='.')
plt.xlabel('Recall')
plt.ylabel('Precision')
plt.title('Precision-Recall Curve')
plt.grid(True)
plt.tight_layout()
plt.savefig('precision_recall_curve.png', dpi=300)
plt.show()

# ----------------------------
# 9. Feature Importance
# ----------------------------
importances = rf_model.feature_importances_
feature_importance_df = pd.DataFrame({
    'Feature': features,
    'Importance': importances
}).sort_values('Importance', ascending=False)

print("\nFeature Importance:")
print(feature_importance_df)

plt.figure(figsize=(10, 6))
plt.title("RandomForest Feature Importance")
plt.bar(range(len(features)), importances[np.argsort(importances)[::-1]], align='center')
plt.xticks(range(len(features)), 
           [features[i] for i in np.argsort(importances)[::-1]], 
           rotation=45, ha='right')
plt.ylabel('Importance')
plt.xlabel('Features')
plt.tight_layout()
plt.savefig('feature_importance.png', dpi=300)
plt.show()

# ----------------------------
# 10. Threshold Optimization
# ----------------------------
print("\n" + "="*50)
print("THRESHOLD OPTIMIZATION")
print("="*50)

# Test different thresholds
thresholds_to_test = [0.1, 0.2, 0.3, 0.4, 0.5]
for threshold in thresholds_to_test:
    y_pred_thresh = (y_pred_proba >= threshold).astype(int)
    cm_thresh = confusion_matrix(y_test, y_pred_thresh)
    tn, fp, fn, tp = cm_thresh.ravel()
    
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    print(f"\nThreshold: {threshold:.1f}")
    print(f"  Precision: {precision:.4f}, Recall: {recall:.4f}, F1: {f1:.4f}")
    print(f"  FP: {fp}, FN: {fn}")

# ----------------------------
# 11. Example: Test extreme scenarios
# ----------------------------
print("\n" + "="*50)
print("PREDICTION EXAMPLES")
print("="*50)

# Scenario 1: High risk
sample_extreme = pd.DataFrame({
    'Month': [8],           # peak monsoon
    'Year': [2023],
    'Temp': [28],
    'Ice': [0],
    'Veg': [50],            # low vegetation
    'Rain_mm': [900],       # extreme rainfall
    'Province_enc': [le.transform(['Punjab'])[0]]
})

sample_extreme[num_cols] = scaler.transform(sample_extreme[num_cols])
pred_proba_high = rf_model.predict_proba(sample_extreme)[:,1]

print("\nScenario 1 - High Risk (Monsoon + Extreme Rain):")
print(f"  Flood Probability: {pred_proba_high[0]:.4f}")
print(f"  Prediction: {'Flood' if pred_proba_high[0] >= 0.2 else 'No Flood'}")

# Scenario 2: Low risk
sample_low = pd.DataFrame({
    'Month': [12],          # winter
    'Year': [2023],
    'Temp': [15],
    'Ice': [20],
    'Veg': [80],            # good vegetation
    'Rain_mm': [50],        # low rainfall
    'Province_enc': [le.transform(['Punjab'])[0]]
})

sample_low[num_cols] = scaler.transform(sample_low[num_cols])
pred_proba_low = rf_model.predict_proba(sample_low)[:,1]

print("\nScenario 2 - Low Risk (Winter + Low Rain):")
print(f"  Flood Probability: {pred_proba_low[0]:.4f}")
print(f"  Prediction: {'Flood' if pred_proba_low[0] >= 0.2 else 'No Flood'}")

# ----------------------------
# 12. Save Model and Artifacts
# ----------------------------
# joblib.dump(rf_model, "rf_flood_model.pkl")
# joblib.dump(le, "province_encoder.pkl")
# joblib.dump(scaler, "scaler.pkl")

# Save metadata
metadata = {
    'features': features,
    'province_mapping': province_mapping,
    'threshold': 0.2,
    'model_type': 'RandomForestClassifier',
    'roc_auc_score': roc_auc,
    'num_columns': num_cols
}
joblib.dump(metadata, "model_metadata.pkl")

print("\n" + "="*50)
print("Model artifacts saved successfully:")
print("  - rf_flood_model.pkl")
print("  - province_encoder.pkl")
print("  - scaler.pkl")
print("  - model_metadata.pkl")
print("="*50)